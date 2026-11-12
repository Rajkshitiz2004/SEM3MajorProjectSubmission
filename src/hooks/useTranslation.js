/**
 * useTranslation.js
 * React hook for managing translation operations, state transitions,
 * request cancellations, and backend error handling.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { translateText, isMockModeEnabled } from '../services/translationApi';
import { DEFAULT_LANGUAGE } from '../data/mockTranslations';

/**
 * @typedef {'idle' | 'loading' | 'success' | 'error'} TranslationStatus
 */

/**
 * Custom hook for translation.
 *
 * @param {Object} options
 * @param {string} [options.initialLanguage='en']
 * @param {number} [options.websiteId=1]
 * @param {number} [options.timeoutMs]
 */
export function useTranslation({
  initialLanguage = DEFAULT_LANGUAGE,
  websiteId = 1,
  timeoutMs,
} = {}) {
  const [selectedLang, setSelectedLang] = useState(initialLanguage);
  const [status, setStatus] = useState('idle');
  const [statusMsg, setStatusMsg] = useState('Choose a language below');
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [isMock, setIsMock] = useState(isMockModeEnabled());

  // Ref to track ongoing request AbortController for in-flight cancellation
  const abortControllerRef = useRef(null);

  // Auto-reset message timer ref
  const resetTimerRef = useRef(null);

  // Clear pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  /**
   * Cancel any in-flight translation request
   */
  const cancelTranslation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Translates given text to target language, aborting any prior request.
   *
   * @param {string} text - Text to translate
   * @param {string} targetLang - Target language code (e.g., 'hi', 'en')
   * @param {string} [sourceLang] - Source language code (defaults to selectedLang or 'en')
   * @returns {Promise<{
   *   original_text: string,
   *   translated_text: string,
   *   source_language: string,
   *   target_language: string,
   *   status: string,
   *   isMock?: boolean
   * }>}
   */
  const translate = useCallback(
    async (text, targetLang, sourceLang = selectedLang) => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }

      // Cancel previous in-flight request when changing language or requesting new text
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setStatus('loading');
      setStatusMsg('Translating…');
      setError(null);

      try {
        const result = await translateText({
          website_id: websiteId,
          text,
          source_language: sourceLang,
          target_language: targetLang,
          signal: controller.signal,
          timeoutMs,
        });

        // If request finished and matches current controller
        if (abortControllerRef.current === controller) {
          setSelectedLang(targetLang);
          setStatus('success');
          setStatusMsg(
            targetLang === 'en'
              ? 'Switched to English'
              : 'हिन्दी में स्विच किया गया'
          );
          setError(null);
          setLastResult(result);
          setIsMock(Boolean(result.isMock));
          abortControllerRef.current = null;

          // Auto reset to idle state after display interval
          resetTimerRef.current = setTimeout(() => {
            setStatus('idle');
            setStatusMsg('Choose a language below');
          }, 2200);
        }

        return result;
      } catch (err) {
        // If aborted by user / language change, do not overwrite status with error
        if (err.name === 'AbortError') {
          return null;
        }

        if (abortControllerRef.current === controller) {
          const userFriendlyMessage = err.message || 'Translation failed. Please try again.';
          setStatus('error');
          setStatusMsg(userFriendlyMessage);
          setError(err);
          abortControllerRef.current = null;

          // Auto reset error notification after 3.5s
          resetTimerRef.current = setTimeout(() => {
            setStatus('idle');
            setStatusMsg('Choose a language below');
          }, 3500);
        }

        throw err;
      }
    },
    [selectedLang, websiteId, timeoutMs]
  );

  return {
    selectedLang,
    setSelectedLang,
    status,
    statusMsg,
    isLoading: status === 'loading',
    error,
    lastResult,
    isMock,
    translate,
    cancelTranslation,
  };
}

export default useTranslation;

