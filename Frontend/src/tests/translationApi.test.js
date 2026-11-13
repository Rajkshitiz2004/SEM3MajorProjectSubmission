/**
 * translationApi.test.js
 * Comprehensive unit and integration tests for the RajBhasha AI translation client,
 * DOM translator, text restoration, mock mode boundaries, and security guarantees.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  translateText,
  getApiBaseUrl,
  isMockModeEnabled,
  getDefaultTimeoutMs,
} from '../services/translationApi';
import { mockTranslateText } from '../services/mockTranslationApi';
import {
  translateDom,
  restoreDom,
  collectTextNodes,
  newGeneration,
} from '../utils/domTranslator';

describe('Translation API Client (translationApi.js)', () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // Restore environment
    Object.assign(import.meta.env, originalEnv);
  });

  describe('Configuration & Environment Helpers', () => {
    it('returns normalized base URL without trailing slashes', () => {
      import.meta.env.VITE_API_BASE_URL = 'http://localhost:8000///';
      expect(getApiBaseUrl()).toBe('http://localhost:8000');
    });

    it('returns empty string if VITE_API_BASE_URL is not defined', () => {
      delete import.meta.env.VITE_API_BASE_URL;
      expect(getApiBaseUrl()).toBe('');
    });

    it('identifies whether mock mode is explicitly enabled', () => {
      import.meta.env.VITE_USE_MOCK_TRANSLATION = 'true';
      expect(isMockModeEnabled()).toBe(true);

      import.meta.env.VITE_USE_MOCK_TRANSLATION = 'false';
      expect(isMockModeEnabled()).toBe(false);

      delete import.meta.env.VITE_USE_MOCK_TRANSLATION;
      expect(isMockModeEnabled()).toBe(false);
    });

    it('returns configured timeout or default 8000ms', () => {
      import.meta.env.VITE_TRANSLATION_TIMEOUT_MS = '5000';
      expect(getDefaultTimeoutMs()).toBe(5000);

      delete import.meta.env.VITE_TRANSLATION_TIMEOUT_MS;
      expect(getDefaultTimeoutMs()).toBe(8000);
    });
  });

  describe('Input Validation', () => {
    it('throws when text is empty or not a string', async () => {
      await expect(translateText({ text: '' })).rejects.toThrow(
        'Text to translate is required and cannot be empty.'
      );
      await expect(translateText({ text: '   ' })).rejects.toThrow(
        'Text to translate is required and cannot be empty.'
      );
      await expect(translateText({ text: null })).rejects.toThrow(
        'Text to translate is required and cannot be empty.'
      );
    });

    it('throws descriptive error if VITE_API_BASE_URL is missing and mock mode is disabled', async () => {
      import.meta.env.VITE_USE_MOCK_TRANSLATION = 'false';
      delete import.meta.env.VITE_API_BASE_URL;

      await expect(
        translateText({ text: 'Ministry of Power' })
      ).rejects.toThrow(/Translation API base URL is not configured/);
    });
  });

  describe('FastAPI Backend Integration (Live Mode)', () => {
    beforeEach(() => {
      import.meta.env.VITE_USE_MOCK_TRANSLATION = 'false';
      import.meta.env.VITE_API_BASE_URL = 'http://127.0.0.1:8000';
    });

    it('successfully sends translation payload and parses response', async () => {
      const mockBackendResponse = {
        website_id: 1,
        original_text: 'Ministry of Power',
        translated_text: 'विद्युत मंत्रालय',
        source_language: 'en',
        target_language: 'hi',
        status: 'machine',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockBackendResponse,
      });

      const result = await translateText({
        website_id: 1,
        text: 'Ministry of Power',
        source_language: 'en',
        target_language: 'hi',
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toBe('http://127.0.0.1:8000/api/v1/translate');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body)).toEqual({
        website_id: 1,
        text: 'Ministry of Power',
        source_language: 'en',
        target_language: 'hi',
      });

      expect(result).toEqual({
        original_text: 'Ministry of Power',
        translated_text: 'विद्युत मंत्रालय',
        source_language: 'en',
        target_language: 'hi',
        status: 'machine',
        isMock: false,
      });
    });

    it('handles HTTP error responses (e.g., 500, 422, 503) with details', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => ({ detail: 'Model service temporarily overloaded' }),
      });

      await expect(
        translateText({ text: 'National Power Portal' })
      ).rejects.toThrow('Model service temporarily overloaded');
    });

    it('handles unavailable backend / network failure without falling back to mock mode', async () => {
      // Simulate network disconnection or server offline (fetch throws TypeError)
      const fetchTypeError = new TypeError('Failed to fetch');
      global.fetch = vi.fn().mockRejectedValue(fetchTypeError);

      try {
        await translateText({ text: 'Citizen Services' });
        expect.unreachable('Should have thrown network error');
      } catch (err) {
        expect(err.isNetworkError).toBe(true);
        expect(err.message).toContain('Unable to reach translation server at http://127.0.0.1:8000');
        expect(err.message).toContain('Please ensure the FastAPI backend is running');
      }
    });

    it('aborts when external signal is triggered', async () => {
      const controller = new AbortController();
      global.fetch = vi.fn().mockImplementation((_url, { signal }) => {
        return new Promise((_, reject) => {
          signal.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        });
      });

      const translatePromise = translateText({
        text: 'Quick access',
        signal: controller.signal,
      });

      controller.abort();

      await expect(translatePromise).rejects.toThrow('Translation request was cancelled.');
    });

    it('aborts when request exceeds timeoutMs', async () => {
      global.fetch = vi.fn().mockImplementation((_url, { signal }) => {
        return new Promise((_, reject) => {
          signal.addEventListener('abort', () => {
            const err = new Error('Translation request timed out after 50ms');
            err.name = 'AbortError';
            reject(err);
          });
        });
      });

      await expect(
        translateText({
          text: 'Slow translation text',
          timeoutMs: 50,
        })
      ).rejects.toThrow(/timed out after 50ms/);
    });
  });

  describe('Mock Translation Mode (VITE_USE_MOCK_TRANSLATION=true)', () => {
    beforeEach(() => {
      import.meta.env.VITE_USE_MOCK_TRANSLATION = 'true';
    });

    it('returns known translation with isMock: true', async () => {
      const result = await translateText({
        text: 'Home',
        target_language: 'hi',
      });

      expect(result.translated_text).toBe('होम');
      expect(result.isMock).toBe(true);
      expect(result.status).toBe('machine');
    });

    it('provides clear fallback for unmapped dictionary keys', async () => {
      const result = await translateText({
        text: 'Unmapped Unique String',
        target_language: 'hi',
      });

      expect(result.translated_text).toBe('[अनुवाद: Unmapped Unique String]');
      expect(result.isMock).toBe(true);
    });

    it('handles translation back to English from Hindi', async () => {
      const result = await mockTranslateText({
        text: 'होम',
        source_language: 'hi',
        target_language: 'en',
      });

      expect(result.translated_text).toBe('Home');
      expect(result.isMock).toBe(true);
    });
  });

  describe('DOM Translation & Text Restoration (domTranslator.js)', () => {
    beforeEach(() => {
      import.meta.env.VITE_USE_MOCK_TRANSLATION = 'true';
      document.body.innerHTML = '';
    });

    it('collects eligible text nodes while ignoring buttons, scripts, and inputs', () => {
      document.body.innerHTML = `
        <div id="container">
          <h1>Electricity Portal</h1>
          <p>Official citizen portal.</p>
          <input type="text" value="Sensitive User Value" />
          <textarea>User complaint text</textarea>
          <button type="button">Action Button</button>
          <code>const code = 1;</code>
          <span data-no-translate>DO NOT TRANSLATE ME</span>
          <div class="tw-panel"><span>Widget Inner Text</span></div>
        </div>
      `;

      const nodes = collectTextNodes(document.getElementById('container'));
      const textValues = nodes.map((n) => n.nodeValue.trim());

      expect(textValues).toContain('Electricity Portal');
      expect(textValues).toContain('Official citizen portal.');
      expect(textValues).not.toContain('Sensitive User Value');
      expect(textValues).not.toContain('User complaint text');
      expect(textValues).not.toContain('DO NOT TRANSLATE ME');
      expect(textValues).not.toContain('Widget Inner Text');
    });

    it('skips sensitive fields marked with data-sensitive or type=password', () => {
      document.body.innerHTML = `
        <div id="secure-box">
          <p>Public statement</p>
          <div data-sensitive="true">
            <span>Confidential Aadhaar / Token</span>
          </div>
          <input type="password" value="secret123" />
        </div>
      `;

      const nodes = collectTextNodes(document.getElementById('secure-box'));
      const textValues = nodes.map((n) => n.nodeValue.trim());

      expect(textValues).toContain('Public statement');
      expect(textValues).not.toContain('Confidential Aadhaar / Token');
    });

    it('translates DOM text nodes and safely restores original English text', async () => {
      const testContainer = document.createElement('div');
      testContainer.innerHTML = `
        <h2 id="title">Home</h2>
        <p id="desc">Schemes</p>
      `;
      document.body.appendChild(testContainer);

      // 1. Translate to Hindi
      const gen1 = newGeneration();
      await translateDom({
        root: testContainer,
        targetLang: 'hi',
        sourceLang: 'en',
        websiteId: 1,
        generation: gen1,
      });

      expect(document.getElementById('title').textContent.trim()).toBe('होम');
      expect(document.getElementById('desc').textContent.trim()).toBe('योजनाएँ');

      // 2. Restore to English
      restoreDom(testContainer);

      expect(document.getElementById('title').textContent.trim()).toBe('Home');
      expect(document.getElementById('desc').textContent.trim()).toBe('Schemes');
    });

    it('security verification: API responses cannot insert executable HTML into DOM', async () => {
      import.meta.env.VITE_USE_MOCK_TRANSLATION = 'false';
      import.meta.env.VITE_API_BASE_URL = 'http://127.0.0.1:8000';

      const maliciousPayload = '<script>window.__xss = true;</script><img src="x" onerror="window.__xss2 = true" />';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          original_text: 'Safe Text',
          translated_text: maliciousPayload,
          source_language: 'en',
          target_language: 'hi',
          status: 'machine',
        }),
      });

      const container = document.createElement('div');
      container.innerHTML = '<p id="target">Safe Text</p>';
      document.body.appendChild(container);

      const gen2 = newGeneration();
      await translateDom({
        root: container,
        targetLang: 'hi',
        sourceLang: 'en',
        websiteId: 1,
        generation: gen2,
      });

      const pElement = document.getElementById('target');
      // The text must be rendered literally as textNode value, NOT as DOM elements
      expect(pElement.childNodes.length).toBe(1);
      expect(pElement.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
      expect(pElement.innerHTML).toContain('&lt;script&gt;');
      expect(document.querySelector('script')).toBeNull();
      expect(window.__xss).toBeUndefined();
      expect(window.__xss2).toBeUndefined();
    });
  });
});
