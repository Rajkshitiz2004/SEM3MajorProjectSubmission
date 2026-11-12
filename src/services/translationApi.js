/**
 * translationApi.js
 * Translation API client communicating with Python FastAPI backend.
 *
 * Backend contract:
 * POST /api/v1/translate
 * Request:  { website_id, text, source_language, target_language }
 * Response: { original_text, translated_text, source_language, target_language, status }
 */
import { mockTranslateText } from './mockTranslationApi';

/**
 * Normalizes and reads API base URL from Vite environment variables.
 */
export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '';
  return envUrl.replace(/\/+$/, '');
}

/**
 * Checks if mock mode is explicitly enabled via environment variable.
 */
export function isMockModeEnabled() {
  return import.meta.env.VITE_USE_MOCK_TRANSLATION === 'true';
}

/**
 * Gets configured default request timeout in milliseconds.
 */
export function getDefaultTimeoutMs() {
  const timeout = Number(import.meta.env.VITE_TRANSLATION_TIMEOUT_MS);
  return Number.isFinite(timeout) && timeout > 0 ? timeout : 8000;
}

/**
 * Reusable function to translate text.
 * Connects to FastAPI endpoint or explicit mock adapter based strictly on VITE_USE_MOCK_TRANSLATION.
 *
 * @param {Object} options
 * @param {number} [options.website_id=1]
 * @param {string} options.text
 * @param {string} [options.source_language='en']
 * @param {string} [options.target_language='hi']
 * @param {AbortSignal} [options.signal] - External signal (e.g. for user cancellation)
 * @param {number} [options.timeoutMs] - Request timeout in ms (defaults to VITE_TRANSLATION_TIMEOUT_MS or 8000)
 * @returns {Promise<{
 *   original_text: string,
 *   translated_text: string,
 *   source_language: string,
 *   target_language: string,
 *   status: string,
 *   isMock?: boolean
 * }>}
 */
export async function translateText({
  website_id = 1,
  text,
  source_language = 'en',
  target_language = 'hi',
  signal,
  timeoutMs = getDefaultTimeoutMs(),
} = {}) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('Text to translate is required and cannot be empty.');
  }

  // 1. Mock Mode Check: Explicitly controlled by VITE_USE_MOCK_TRANSLATION
  if (isMockModeEnabled()) {
    return mockTranslateText({
      website_id,
      text,
      source_language,
      target_language,
      signal,
    });
  }

  // 2. Real API Mode: Check base URL
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error(
      'Translation API base URL is not configured. Please set VITE_API_BASE_URL in your .env file or enable VITE_USE_MOCK_TRANSLATION=true.'
    );
  }

  const endpoint = `${baseUrl}/api/v1/translate`;

  // 3. Setup AbortController for timeout + external signal chaining
  const timeoutController = new AbortController();
  let timerId = null;

  if (timeoutMs > 0) {
    timerId = setTimeout(() => {
      timeoutController.abort(new Error(`Translation request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  }

  // Handle external cancellation
  const onExternalAbort = () => {
    timeoutController.abort(signal.reason || new Error('Request was cancelled by user'));
  };

  if (signal) {
    if (signal.aborted) {
      if (timerId) clearTimeout(timerId);
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      throw err;
    }
    signal.addEventListener('abort', onExternalAbort, { once: true });
  }

  const payload = {
    website_id: Number(website_id),
    text,
    source_language,
    target_language,
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: timeoutController.signal,
    });

    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }

    // 4. Handle HTTP error status codes
    if (!response.ok) {
      let errorDetail = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson && (errorJson.detail || errorJson.message || errorJson.error)) {
          errorDetail = errorJson.detail || errorJson.message || errorJson.error;
          if (typeof errorDetail === 'object') {
            errorDetail = JSON.stringify(errorDetail);
          }
        }
      } catch {
        // Fall back to status text if body is not JSON
      }
      const httpError = new Error(errorDetail);
      httpError.status = response.status;
      httpError.response = response;
      throw httpError;
    }

    // 5. Parse and validate response contract
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid JSON response received from translation backend.');
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response structure received from translation backend.');
    }

    if (typeof data.translated_text !== 'string') {
      throw new Error('Response is missing required "translated_text" field.');
    }

    return {
      original_text: data.original_text ?? text,
      translated_text: data.translated_text,
      source_language: data.source_language ?? source_language,
      target_language: data.target_language ?? target_language,
      status: data.status ?? 'machine',
      isMock: false,
    };
  } catch (error) {
    if (timerId) {
      clearTimeout(timerId);
    }

    // Identify aborts/timeouts
    if (error.name === 'AbortError' || timeoutController.signal.aborted) {
      const abortError = new Error(
        error.message.includes('timed out')
          ? error.message
          : 'Translation request was cancelled.'
      );
      abortError.name = 'AbortError';
      abortError.isTimeout = error.message.includes('timed out');
      throw abortError;
    }

    // Handle generic network errors (e.g. backend offline / connection refused / CORS)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const netError = new Error(
        `Unable to reach translation server at ${baseUrl}. Please ensure the FastAPI backend is running.`
      );
      netError.isNetworkError = true;
      throw netError;
    }

    // Never silently fall back to mock translations on real backend failure
    throw error;
  } finally {
    if (signal) {
      signal.removeEventListener('abort', onExternalAbort);
    }
  }
}

