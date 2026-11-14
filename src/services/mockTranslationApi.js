/**
 * mockTranslationApi.js
 * Mock translation adapter for development and testing without a live FastAPI backend.
 * Conforms to the backend API response contract:
 * {
 *   original_text: string,
 *   translated_text: string,
 *   source_language: string,
 *   target_language: string,
 *   status: string
 * }
 */
import { MOCK_DICTIONARY_HI } from '../data/mockTranslations';

/**
 * Translates text using in-memory mock dictionary with artificial latency.
 * Supports cancellation via AbortSignal.
 *
 * @param {Object} params
 * @param {number} [params.website_id=1]
 * @param {string} params.text
 * @param {string} [params.source_language='en']
 * @param {string} [params.target_language='hi']
 * @param {AbortSignal} [params.signal]
 * @returns {Promise<{
 *   original_text: string,
 *   translated_text: string,
 *   source_language: string,
 *   target_language: string,
 *   status: string,
 *   isMock: boolean
 * }>}
 */
export async function mockTranslateText({
  website_id = 1,
  text,
  source_language = 'en',
  target_language = 'hi',
  signal,
} = {}) {
  // Check if already aborted
  if (signal?.aborted) {
    const error = new Error('The operation was aborted');
    error.name = 'AbortError';
    throw error;
  }

  // Artificial network latency between 250ms - 500ms
  const latency = 250 + Math.random() * 250;

  await new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, latency);

    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timeoutId);
          const error = new Error('The operation was aborted');
          error.name = 'AbortError';
          reject(error);
        },
        { once: true }
      );
    }
  });

  // If source and target are the same, return the original text
  if (source_language === target_language) {
    return {
      original_text: text,
      translated_text: text,
      source_language,
      target_language,
      status: 'cached',
      isMock: true,
      website_id,
    };
  }

  // Target: English (source Hindi) -> if found in inverse dictionary or return original
  if (target_language === 'en') {
    let englishMatch = text;
    for (const [enKey, hiVal] of Object.entries(MOCK_DICTIONARY_HI)) {
      if (hiVal === text) {
        englishMatch = enKey;
        break;
      }
    }
    return {
      original_text: text,
      translated_text: englishMatch,
      source_language,
      target_language,
      status: 'machine',
      isMock: true,
      website_id,
    };
  }

  // Target: Hindi (or others)
  const translated = MOCK_DICTIONARY_HI[text] ?? `[अनुवाद: ${text}]`;

  return {
    original_text: text,
    translated_text: translated,
    source_language,
    target_language,
    status: 'machine',
    isMock: true,
    website_id,
  };
}

