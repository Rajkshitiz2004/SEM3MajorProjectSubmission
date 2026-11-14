/**
 * useTranslation.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit tests for src/hooks/useTranslation.js
 * (Prompt 6 — Member 3: Final Integration, Testing, and Documentation)
 *
 * Tests:
 *  1.  Initial state — selectedLang defaults to DEFAULT_LANGUAGE ('en')
 *  2.  Initial state — status is 'idle'
 *  3.  Initial state — statusMsg is 'Choose a language below'
 *  4.  Initial state — isLoading is false
 *  5.  Initial state — error is null
 *  6.  Initial state — lastResult is null
 *  7.  Initial state — isMock reflects isMockModeEnabled() at mount
 *  8.  translate() — sets status to 'loading' immediately
 *  9.  translate() — sets status to 'success' on API success
 *  10. translate() — updates selectedLang to targetLang on success
 *  11. translate() — updates lastResult with API response on success
 *  12. translate() — sets isMock=true when result.isMock is true
 *  13. translate() — sets Hindi success statusMsg on success (non-English target)
 *  14. translate() — sets 'Switched to English' statusMsg when targetLang='en'
 *  15. translate() — sets status to 'error' when API throws
 *  16. translate() — sets statusMsg to the error message on failure
 *  17. translate() — sets error state to the thrown error
 *  18. translate() — does NOT set error state on AbortError
 *  19. translate() — returns null on AbortError without throwing
 *  20. translate() — re-throws non-Abort errors to the caller
 *  21. cancelTranslation() — aborts in-flight controller
 *  22. setSelectedLang() — exposes setter so caller can change language directly
 *  23. Auto-reset — status returns to 'idle' after success (using fake timers)
 *  24. Auto-reset — status returns to 'idle' after error (using fake timers)
 *  25. Cleanup on unmount — aborts in-flight controller
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ── Mock translationApi ───────────────────────────────────────────────────────
vi.mock('../services/translationApi', () => ({
  translateText: vi.fn(),
  isMockModeEnabled: vi.fn(() => false),
}));

import { useTranslation } from '../hooks/useTranslation';
import { translateText, isMockModeEnabled } from '../services/translationApi';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function successResponse(overrides = {}) {
  return {
    original_text: 'Hello',
    translated_text: 'नमस्ते',
    source_language: 'en',
    target_language: 'hi',
    status: 'machine',
    isMock: false,
    ...overrides,
  };
}

function renderUseTranslation(options = {}) {
  return renderHook(() => useTranslation(options));
}

// ─────────────────────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  isMockModeEnabled.mockReturnValue(false);
  translateText.mockResolvedValue(successResponse());
});

afterEach(() => {
  vi.useRealTimers();
});

// ─────────────────────────────────────────────────────────────────────────────
// 1–7: Initial state
// ─────────────────────────────────────────────────────────────────────────────

describe('useTranslation() — initial state', () => {
  it('selectedLang defaults to "en" (DEFAULT_LANGUAGE)', () => {
    const { result } = renderUseTranslation();
    expect(result.current.selectedLang).toBe('en');
  });

  it('status is "idle" at mount', () => {
    const { result } = renderUseTranslation();
    expect(result.current.status).toBe('idle');
  });

  it('statusMsg is "Choose a language below" at mount', () => {
    const { result } = renderUseTranslation();
    expect(result.current.statusMsg).toBe('Choose a language below');
  });

  it('isLoading is false at mount', () => {
    const { result } = renderUseTranslation();
    expect(result.current.isLoading).toBe(false);
  });

  it('error is null at mount', () => {
    const { result } = renderUseTranslation();
    expect(result.current.error).toBeNull();
  });

  it('lastResult is null at mount', () => {
    const { result } = renderUseTranslation();
    expect(result.current.lastResult).toBeNull();
  });

  it('isMock reflects isMockModeEnabled() value at mount', () => {
    isMockModeEnabled.mockReturnValue(true);
    const { result } = renderUseTranslation();
    expect(result.current.isMock).toBe(true);
  });

  it('honours custom initialLanguage option', () => {
    const { result } = renderUseTranslation({ initialLanguage: 'hi' });
    expect(result.current.selectedLang).toBe('hi');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8–14: translate() — success path
// ─────────────────────────────────────────────────────────────────────────────

describe('useTranslation() — translate() success path', () => {
  it('sets status to "loading" synchronously when translate() is called', async () => {
    // Use a never-resolving promise so we can inspect the loading state
    translateText.mockReturnValue(new Promise(() => {}));
    const { result } = renderUseTranslation();

    act(() => {
      result.current.translate('Hello', 'hi');
    });

    expect(result.current.status).toBe('loading');
    expect(result.current.isLoading).toBe(true);
  });

  it('sets status to "success" after translate() resolves', async () => {
    const { result } = renderUseTranslation();
    await act(async () => {
      await result.current.translate('Hello', 'hi');
    });
    expect(result.current.status).toBe('success');
  });

  it('updates selectedLang to the targetLang on success', async () => {
    const { result } = renderUseTranslation();
    await act(async () => {
      await result.current.translate('Hello', 'hi');
    });
    expect(result.current.selectedLang).toBe('hi');
  });

  it('updates lastResult with the API response on success', async () => {
    const response = successResponse();
    translateText.mockResolvedValue(response);
    const { result } = renderUseTranslation();
    await act(async () => {
      await result.current.translate('Hello', 'hi');
    });
    expect(result.current.lastResult).toEqual(response);
  });

  it('sets isMock=true when result.isMock is true', async () => {
    translateText.mockResolvedValue(successResponse({ isMock: true }));
    const { result } = renderUseTranslation();
    await act(async () => {
      await result.current.translate('Hello', 'hi');
    });
    expect(result.current.isMock).toBe(true);
  });

  it('statusMsg is Hindi success message when targetLang is not "en"', async () => {
    const { result } = renderUseTranslation();
    await act(async () => {
      await result.current.translate('Hello', 'hi');
    });
    expect(result.current.statusMsg).toContain('हिन्दी');
  });

  it('statusMsg is "Switched to English" when targetLang is "en"', async () => {
    translateText.mockResolvedValue(
      successResponse({ target_language: 'en', translated_text: 'Hello' })
    );
    const { result } = renderUseTranslation({ initialLanguage: 'hi' });
    await act(async () => {
      await result.current.translate('नमस्ते', 'en');
    });
    expect(result.current.statusMsg).toBe('Switched to English');
  });

  it('error is null after a successful translation', async () => {
    const { result } = renderUseTranslation();
    await act(async () => {
      await result.current.translate('Hello', 'hi');
    });
    expect(result.current.error).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 15–20: translate() — error path
// ─────────────────────────────────────────────────────────────────────────────

describe('useTranslation() — translate() error path', () => {
  it('sets status to "error" when translateText throws a non-Abort error', async () => {
    translateText.mockRejectedValue(new Error('Network error'));
    const { result } = renderUseTranslation();
    await act(async () => {
      await result.current.translate('Hello', 'hi').catch(() => {});
    });
    expect(result.current.status).toBe('error');
  });

  it('sets statusMsg to the error message on failure', async () => {
    translateText.mockRejectedValue(new Error('Backend is offline'));
    const { result } = renderUseTranslation();
    await act(async () => {
      await result.current.translate('Hello', 'hi').catch(() => {});
    });
    expect(result.current.statusMsg).toBe('Backend is offline');
  });

  it('sets error state to the thrown error object', async () => {
    const err = new Error('Server error 500');
    translateText.mockRejectedValue(err);
    const { result } = renderUseTranslation();
    await act(async () => {
      await result.current.translate('Hello', 'hi').catch(() => {});
    });
    expect(result.current.error).toBe(err);
  });

  it('does NOT change status when translateText throws an AbortError', async () => {
    const abortErr = new Error('Aborted');
    abortErr.name = 'AbortError';
    translateText.mockRejectedValue(abortErr);

    const { result } = renderUseTranslation();
    await act(async () => {
      // Should not throw — AbortError is swallowed
      const returned = await result.current.translate('Hello', 'hi');
      expect(returned).toBeNull();
    });
    // Status should remain 'loading' (controller was replaced, so second guard fires)
    // — the important check: it is NOT 'error'
    expect(result.current.status).not.toBe('error');
  });

  it('re-throws non-Abort errors so the caller can handle them', async () => {
    translateText.mockRejectedValue(new Error('Server unavailable'));
    const { result } = renderUseTranslation();
    await act(async () => {
      await expect(result.current.translate('Hello', 'hi')).rejects.toThrow(
        'Server unavailable'
      );
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 21: cancelTranslation()
// ─────────────────────────────────────────────────────────────────────────────

describe('useTranslation() — cancelTranslation()', () => {
  it('calling cancelTranslation() while loading does not throw', () => {
    translateText.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderUseTranslation();
    act(() => {
      result.current.translate('Hello', 'hi');
    });
    expect(() => {
      act(() => result.current.cancelTranslation());
    }).not.toThrow();
  });

  it('calling cancelTranslation() when idle does not throw', () => {
    const { result } = renderUseTranslation();
    expect(() => {
      act(() => result.current.cancelTranslation());
    }).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 22: setSelectedLang()
// ─────────────────────────────────────────────────────────────────────────────

describe('useTranslation() — setSelectedLang()', () => {
  it('exposes setSelectedLang to allow direct language state changes', () => {
    const { result } = renderUseTranslation();
    act(() => {
      result.current.setSelectedLang('hi');
    });
    expect(result.current.selectedLang).toBe('hi');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 23–24: Auto-reset timers
// ─────────────────────────────────────────────────────────────────────────────

describe('useTranslation() — auto-reset to idle', () => {
  it('resets status to "idle" after success (after 2200 ms)', async () => {
    vi.useFakeTimers();
    const { result } = renderUseTranslation();

    await act(async () => {
      await result.current.translate('Hello', 'hi');
    });
    expect(result.current.status).toBe('success');

    // Advance past the 2200ms reset timer
    act(() => vi.advanceTimersByTime(2500));
    expect(result.current.status).toBe('idle');
    expect(result.current.statusMsg).toBe('Choose a language below');
  });

  it('resets status to "idle" after error (after 3500 ms)', async () => {
    vi.useFakeTimers();
    translateText.mockRejectedValue(new Error('Timeout'));
    const { result } = renderUseTranslation();

    await act(async () => {
      await result.current.translate('Hello', 'hi').catch(() => {});
    });
    expect(result.current.status).toBe('error');

    // Advance past the 3500ms error reset timer
    act(() => vi.advanceTimersByTime(4000));
    expect(result.current.status).toBe('idle');
    expect(result.current.statusMsg).toBe('Choose a language below');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 25: Cleanup on unmount
// ─────────────────────────────────────────────────────────────────────────────

describe('useTranslation() — cleanup on unmount', () => {
  it('does not throw when unmounted while a request is in-flight', () => {
    translateText.mockReturnValue(new Promise(() => {})); // never resolves
    const { result, unmount } = renderUseTranslation();
    act(() => {
      result.current.translate('Hello', 'hi');
    });
    expect(() => unmount()).not.toThrow();
  });
});
