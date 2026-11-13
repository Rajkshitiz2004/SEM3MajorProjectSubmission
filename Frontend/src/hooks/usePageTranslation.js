/**
 * usePageTranslation.js
 * ─────────────────────────────────────────────────────────────────────────────
 * React hook that wires DOM translation to React Router navigation.
 *
 * Responsibilities:
 *  1. Triggers full-page DOM translation when `activeLang` changes.
 *  2. Watches for React Router route changes (via `location.pathname`) and
 *     re-translates newly rendered page content when Hindi is active.
 *  3. Runs a MutationObserver to catch lazily rendered content (e.g. cards
 *     added after the initial render). Uses a debounce + observer-pause flag
 *     to avoid recursive loops when the translator itself mutates text nodes.
 *  4. Exposes `progress`, `failedCount`, and `retryFailed` for the widget UI.
 *  5. Cleans up AbortControllers, timers, and the MutationObserver on unmount.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  translateDom,
  restoreDom,
  newGeneration,
  collectTextNodes,
} from '../utils/domTranslator';

const DEBOUNCE_MS = 350; // how long to wait after DOM mutations before re-scanning

/**
 * @param {object} opts
 * @param {string}  opts.activeLang      - 'en' | 'hi'
 * @param {string}  opts.sourceLang      - always 'en'
 * @param {number}  opts.websiteId
 * @param {function} opts.onStatusChange - (status:'loading'|'success'|'error'|'idle', msg:string) => void
 */
export function usePageTranslation({
  activeLang,
  sourceLang = 'en',
  websiteId = 1,
  onStatusChange,
}) {
  const location = useLocation();

  // ── Progress state ──────────────────────────────────────────────────────────
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [failedCount, setFailedCount] = useState(0);
  const [_failedNodes, setFailedNodes] = useState([]); // { node, text }[]

  // ── Internal refs ───────────────────────────────────────────────────────────
  const abortRef = useRef(null);         // current AbortController
  const observerRef = useRef(null);      // MutationObserver instance
  const debounceRef = useRef(null);      // debounce timer handle
  const isTranslatingRef = useRef(false);// guard against observer re-entry
  const activeLangRef = useRef(activeLang);
  const generationRef = useRef(0);

  // Keep activeLangRef in sync
  useEffect(() => {
    activeLangRef.current = activeLang;
  }, [activeLang]);

  // ── Core translate function ─────────────────────────────────────────────────
  const runTranslation = useCallback(
    async (targetLang, root = document.body) => {
      // Cancel any in-flight run
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      const generation = newGeneration();
      generationRef.current = generation;

      if (targetLang === sourceLang) {
        // Restore English — no API calls needed
        restoreDom(root);
        setProgress({ done: 0, total: 0 });
        setFailedCount(0);
        setFailedNodes([]);
        onStatusChange?.('success', 'Switched to English');
        setTimeout(() => onStatusChange?.('idle', ''), 2000);
        return;
      }

      // Collect nodes first so we know total count
      const nodes = collectTextNodes(root);
      const total = nodes.length;
      if (total === 0) {
        onStatusChange?.('idle', '');
        return;
      }

      setProgress({ done: 0, total });
      setFailedCount(0);
      setFailedNodes([]);
      onStatusChange?.('loading', `Translating page… (0 / ${total})`);

      const localFailedNodes = [];

      try {
        isTranslatingRef.current = true;

        const result = await translateDom({
          root,
          targetLang,
          sourceLang,
          websiteId,
          generation,
          signal: controller.signal,
          onProgress: (done, tot) => {
            setProgress({ done, total: tot });
            onStatusChange?.(
              'loading',
              `Translating page… (${done} / ${tot})`
            );
          },
          onError: (err, textNode) => {
            localFailedNodes.push({
              node: textNode,
              text: textNode.nodeValue,
              err,
            });
          },
        });

        isTranslatingRef.current = false;

        // Check if still the latest generation
        if (generation !== generationRef.current) return;

        setFailedCount(result.failed);
        setFailedNodes(localFailedNodes);

        if (result.failed > 0 && result.translated === 0) {
          onStatusChange?.(
            'error',
            `Translation failed for ${result.failed} segment(s). Try again.`
          );
        } else if (result.failed > 0) {
          onStatusChange?.(
            'success',
            `हिन्दी में स्विच किया गया (${result.failed} segment(s) failed)`
          );
          setTimeout(() => onStatusChange?.('idle', ''), 3500);
        } else {
          onStatusChange?.('success', 'हिन्दी में स्विच किया गया');
          setTimeout(() => onStatusChange?.('idle', ''), 2200);
        }
      } catch (err) {
        isTranslatingRef.current = false;
        if (err.name === 'AbortError') return;
        onStatusChange?.('error', err.message || 'Translation failed. Please try again.');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sourceLang, websiteId]
  );

  // ── Retry failed nodes ──────────────────────────────────────────────────────
  const retryFailed = useCallback(() => {
    if (activeLangRef.current === sourceLang) return;
    runTranslation(activeLangRef.current);
  }, [runTranslation, sourceLang]);

  // ── MutationObserver: catch lazily-rendered React content ───────────────────
  const setupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new MutationObserver((mutations) => {
      // Skip mutations we ourselves caused (text node writes)
      if (isTranslatingRef.current) return;
      if (activeLangRef.current === sourceLang) return;

      // Check if any added node has text content worth translating
      const hasNewText = mutations.some((m) =>
        Array.from(m.addedNodes).some(
          (n) =>
            n.nodeType === Node.TEXT_NODE ||
            (n.nodeType === Node.ELEMENT_NODE && n.textContent?.trim().length > 2)
        )
      );

      if (!hasNewText) return;

      // Debounce to batch rapid mutations (e.g. React reconciliation)
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (activeLangRef.current !== sourceLang) {
          runTranslation(activeLangRef.current);
        }
      }, DEBOUNCE_MS);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      // Do NOT observe characterData — that would create a loop when we write text
      characterData: false,
    });

    observerRef.current = observer;
  }, [runTranslation, sourceLang]);

  // ── Effect: language change ─────────────────────────────────────────────────
  useEffect(() => {
    runTranslation(activeLang);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLang]);

  // ── Effect: route change — re-translate if Hindi is active ─────────────────
  useEffect(() => {
    if (activeLangRef.current !== sourceLang) {
      // Small delay so React has committed the new page's DOM
      const t = setTimeout(() => {
        runTranslation(activeLangRef.current);
      }, 120);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // ── Effect: set up MutationObserver once on mount ──────────────────────────
  useEffect(() => {
    setupObserver();
    return () => {
      observerRef.current?.disconnect();
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    progress,
    failedCount,
    retryFailed,
  };
}

