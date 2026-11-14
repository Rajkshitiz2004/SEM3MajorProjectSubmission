/**
 * translationApi.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated tests for src/services/translationApi.js
 *
 * Strategy:
 *  - vi.mock the mockTranslationApi so we can test real translateText logic
 *    without coupling to mock dictionary content
 *  - Use vi.stubGlobal('fetch') to simulate HTTP responses
 *  - vi.stubEnv for environment variable testing
 *  - Re-import the module per describe block by using vi.resetModules()
 *    and dynamic import() for env-sensitive tests
 *
 * Test categories:
 *  1. getApiBaseUrl()          — env var normalization
 *  2. isMockModeEnabled()      — env flag reading
 *  3. getDefaultTimeoutMs()    — timeout config
 *  4. translateText() — input validation
 *  5. translateText() — successful real API request
 *  6. translateText() — HTTP errors
 *  7. translateText() — invalid/malformed responses
 *  8. translateText() — network failures
 *  9. translateText() — AbortSignal cancellation
 * 10. translateText() — explicit mock mode
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mock the CSS import just in case ────────────────────────────────────────
// (not strictly needed here but keeps module resolution clean)

// ── Mock mockTranslationApi so we can observe calls to it ───────────────────
vi.mock('../services/mockTranslationApi', () => ({
  mockTranslateText: vi.fn().mockResolvedValue({
    original_text: 'Hello',
    translated_text: 'नमस्ते',
    source_language: 'en',
    target_language: 'hi',
    status: 'machine',
    isMock: true,
  }),
}));

// Static import — env tests will use vi.stubEnv and re-read the functions
// (env helpers read import.meta.env at call time, not at import time)
import {
  getApiBaseUrl,
  isMockModeEnabled,
  getDefaultTimeoutMs,
  translateText,
} from '../services/translationApi.js';
import { mockTranslateText } from '../services/mockTranslationApi.js';

// ─────────────────────────────────────────────────────────────────────────────
// 1. getApiBaseUrl()
// ─────────────────────────────────────────────────────────────────────────────
describe('getApiBaseUrl()', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('returns empty string when VITE_API_BASE_URL is not set', () => {
    vi.stubEnv('VITE_API_BASE_URL', '');
    expect(getApiBaseUrl()).toBe('');
  });

  it('strips a single trailing slash from the URL', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000/');
    expect(getApiBaseUrl()).toBe('http://localhost:8000');
  });

  it('strips multiple trailing slashes from the URL', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000//');
    expect(getApiBaseUrl()).toBe('http://localhost:8000');
  });

  it('returns clean URL when no trailing slash', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
    expect(getApiBaseUrl()).toBe('http://localhost:8000');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. isMockModeEnabled()
// ─────────────────────────────────────────────────────────────────────────────
describe('isMockModeEnabled()', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('returns true when VITE_USE_MOCK_TRANSLATION is "true"', () => {
    vi.stubEnv('VITE_USE_MOCK_TRANSLATION', 'true');
    expect(isMockModeEnabled()).toBe(true);
  });

  it('returns false when VITE_USE_MOCK_TRANSLATION is "false"', () => {
    vi.stubEnv('VITE_USE_MOCK_TRANSLATION', 'false');
    expect(isMockModeEnabled()).toBe(false);
  });

  it('returns false when VITE_USE_MOCK_TRANSLATION is empty string', () => {
    vi.stubEnv('VITE_USE_MOCK_TRANSLATION', '');
    expect(isMockModeEnabled()).toBe(false);
  });

  it('is case-sensitive — "True" does not enable mock mode', () => {
    vi.stubEnv('VITE_USE_MOCK_TRANSLATION', 'True');
    expect(isMockModeEnabled()).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. getDefaultTimeoutMs()
// ─────────────────────────────────────────────────────────────────────────────
describe('getDefaultTimeoutMs()', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('returns 8000 when env var is not set', () => {
    vi.stubEnv('VITE_TRANSLATION_TIMEOUT_MS', '');
    expect(getDefaultTimeoutMs()).toBe(8000);
  });

  it('returns parsed integer from valid env var', () => {
    vi.stubEnv('VITE_TRANSLATION_TIMEOUT_MS', '5000');
    expect(getDefaultTimeoutMs()).toBe(5000);
  });

  it('returns 8000 for non-numeric env var value', () => {
    vi.stubEnv('VITE_TRANSLATION_TIMEOUT_MS', 'abc');
    expect(getDefaultTimeoutMs()).toBe(8000);
  });

  it('returns 8000 for zero (non-positive)', () => {
    vi.stubEnv('VITE_TRANSLATION_TIMEOUT_MS', '0');
    expect(getDefaultTimeoutMs()).toBe(8000);
  });

  it('returns 8000 for negative values', () => {
    vi.stubEnv('VITE_TRANSLATION_TIMEOUT_MS', '-1000');
    expect(getDefaultTimeoutMs()).toBe(8000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. translateText() — Input Validation
// ─────────────────────────────────────────────────────────────────────────────
describe('translateText() — input validation', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_USE_MOCK_TRANSLATION', 'false');
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('throws when text is an empty string', async () => {
    await expect(translateText({ text: '' })).rejects.toThrow(/required/i);
  });

  it('throws when text is whitespace only', async () => {
    await expect(translateText({ text: '   ' })).rejects.toThrow(/required/i);
  });

  it('throws when text is a number (not a string)', async () => {
    await expect(translateText({ text: 42 })).rejects.toThrow(/required/i);
  });

  it('throws when text is undefined', async () => {
    await expect(translateText({})).rejects.toThrow(/required/i);
  });

  it('throws when API base URL is missing in real mode', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');
    await expect(translateText({ text: 'Hello' })).rejects.toThrow(/VITE_API_BASE_URL/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. translateText() — Successful real API request
// ─────────────────────────────────────────────────────────────────────────────
describe('translateText() — successful real API request', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_USE_MOCK_TRANSLATION', 'false');
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns translated_text from a valid 200 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        original_text: 'Hello',
        translated_text: 'नमस्ते',
        source_language: 'en',
        target_language: 'hi',
        status: 'machine',
      }),
    }));

    const result = await translateText({ text: 'Hello', target_language: 'hi' });
    expect(result.translated_text).toBe('नमस्ते');
    expect(result.original_text).toBe('Hello');
    expect(result.isMock).toBe(false);
  });

  it('POSTs to /api/v1/translate with correct payload', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        translated_text: 'नमस्ते',
        original_text: 'Hello',
        source_language: 'en',
        target_language: 'hi',
        status: 'machine',
      }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await translateText({ text: 'Hello', website_id: 1, target_language: 'hi' });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('http://localhost:8000/api/v1/translate');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    const body = JSON.parse(options.body);
    expect(body.text).toBe('Hello');
    expect(body.website_id).toBe(1);
    expect(body.source_language).toBe('en');
    expect(body.target_language).toBe('hi');
  });

  it('applies default status="machine" when backend omits status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ translated_text: 'अनुवाद' }),
    }));

    const result = await translateText({ text: 'Test', target_language: 'hi' });
    expect(result.status).toBe('machine');
  });

  it('applies default original_text from input when backend omits it', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ translated_text: 'परीक्षण' }),
    }));

    const result = await translateText({ text: 'Test', target_language: 'hi' });
    expect(result.original_text).toBe('Test');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. translateText() — HTTP errors
// ─────────────────────────────────────────────────────────────────────────────
describe('translateText() — HTTP error responses', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_USE_MOCK_TRANSLATION', 'false');
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('throws with status=500 on Internal Server Error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('no body')),
    }));

    const err = await translateText({ text: 'Hello' }).catch(e => e);
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(500);
  });

  it('includes server error detail from JSON body on HTTP 422', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      json: () => Promise.resolve({ detail: 'Missing required field: text' }),
    }));

    const err = await translateText({ text: 'Hello' }).catch(e => e);
    expect(err.message).toContain('Missing required field');
  });

  it('throws on HTTP 404 Not Found', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({}),
    }));

    const err = await translateText({ text: 'Hello' }).catch(e => e);
    expect(err.status).toBe(404);
  });

  it('does NOT silently fall back to mock on HTTP error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: () => Promise.reject(new Error()),
    }));

    const result = await translateText({ text: 'Hello' }).catch(e => e);
    expect(result).toBeInstanceOf(Error);
    // isMock should NOT be set — this is a real failure, not a mock response
    expect(result.isMock).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. translateText() — Invalid / malformed responses
// ─────────────────────────────────────────────────────────────────────────────
describe('translateText() — invalid/malformed API response', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_USE_MOCK_TRANSLATION', 'false');
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('throws "Invalid JSON" when response body is not valid JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    }));

    await expect(translateText({ text: 'Hello' })).rejects.toThrow(/invalid json/i);
  });

  it('throws when translated_text field is missing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ some_other_field: 'value' }),
    }));

    await expect(translateText({ text: 'Hello' })).rejects.toThrow(/translated_text/i);
  });

  it('throws when response is null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(null),
    }));

    await expect(translateText({ text: 'Hello' })).rejects.toThrow();
  });

  it('throws when translated_text is a number instead of string', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ translated_text: 42 }),
    }));

    await expect(translateText({ text: 'Hello' })).rejects.toThrow(/translated_text/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. translateText() — Network failures
// ─────────────────────────────────────────────────────────────────────────────
describe('translateText() — network failures (backend offline)', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_USE_MOCK_TRANSLATION', 'false');
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('throws with isNetworkError=true when fetch itself rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(
      new TypeError('fetch failed')
    ));

    const err = await translateText({ text: 'Hello' }).catch(e => e);
    expect(err.isNetworkError).toBe(true);
  });

  it('error message mentions the backend base URL for network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(
      new TypeError('fetch failed')
    ));

    const err = await translateText({ text: 'Hello' }).catch(e => e);
    expect(err.message).toContain('http://localhost:8000');
  });

  it('error message mentions FastAPI backend for network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(
      new TypeError('fetch failed')
    ));

    const err = await translateText({ text: 'Hello' }).catch(e => e);
    expect(err.message.toLowerCase()).toContain('fastapi');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. translateText() — AbortSignal (request cancellation)
// ─────────────────────────────────────────────────────────────────────────────
describe('translateText() — AbortSignal cancellation', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_USE_MOCK_TRANSLATION', 'false');
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('throws AbortError when signal is already aborted before the call', async () => {
    const controller = new AbortController();
    controller.abort();

    const err = await translateText({ text: 'Hello', signal: controller.signal }).catch(e => e);
    expect(err.name).toBe('AbortError');
  });

  it('AbortError name is set correctly on pre-aborted signal', async () => {
    const controller = new AbortController();
    controller.abort();

    const err = await translateText({ text: 'Hello', signal: controller.signal }).catch(e => e);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('AbortError');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. translateText() — Explicit mock mode
// ─────────────────────────────────────────────────────────────────────────────
describe('translateText() — explicit mock mode (VITE_USE_MOCK_TRANSLATION=true)', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_USE_MOCK_TRANSLATION', 'true');
    vi.clearAllMocks();
    // Restore mock implementation
    mockTranslateText.mockResolvedValue({
      original_text: 'Hello',
      translated_text: 'नमस्ते',
      source_language: 'en',
      target_language: 'hi',
      status: 'machine',
      isMock: true,
    });
  });
  afterEach(() => vi.unstubAllEnvs());

  it('calls mockTranslateText instead of fetch in mock mode', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    await translateText({ text: 'Hello', target_language: 'hi' });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(mockTranslateText).toHaveBeenCalled();
  });

  it('returns isMock=true when mock mode is enabled', async () => {
    const result = await translateText({ text: 'Hello', target_language: 'hi' });
    expect(result.isMock).toBe(true);
  });

  it('passes correct arguments to mockTranslateText', async () => {
    await translateText({ text: 'Home', website_id: 2, target_language: 'hi', source_language: 'en' });
    expect(mockTranslateText).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Home',
        website_id: 2,
        target_language: 'hi',
        source_language: 'en',
      })
    );
  });
});
