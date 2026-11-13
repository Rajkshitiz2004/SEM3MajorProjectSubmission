/**
 * domTranslator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Safe DOM text-node translator for the RajBhasha AI portal.
 *
 * Design decisions:
 *  • TreeWalker-based text-node collection (never touches innerHTML).
 *  • WeakMap stores original text per Text node so originals survive GC cycles.
 *  • Skips: script, style, code, pre, input, textarea, select, button (widget),
 *    contenteditable, data-no-translate, and the translation widget itself.
 *  • Preserves: standalone numbers, dates (d/m/y patterns), URLs, single
 *    punctuation-only strings, and strings under 2 chars.
 *  • Controlled concurrency via a simple semaphore (default: 4 parallel calls).
 *  • A "generation" counter prevents stale async responses from landing
 *    after the user has already switched language again.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { translateText } from '../services/translationApi';

/* ── Regexes for content that should NOT be translated ─────────────────────── */

// Pure numbers (including floats, commas like 1,912)
const RE_PURE_NUMBER = /^\s*[\d,.\s]+\s*$/;

// Date-like strings: "10 Nov 2026", "2026-11-12", "12/11/2026"
const RE_DATE_LIKE =
  /^\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4})\s*$/;

// URL-like strings
const RE_URL = /^(https?:\/\/|www\.)\S+$/i;

// All-punctuation / whitespace only (using Unicode properties so Hindi/Devanagari letters are not treated as punctuation)
const RE_PUNCT_ONLY = /^[\s\p{P}\p{S}]+$/u;

// HTML entity-like artifacts (e.g. &amp;) — unlikely in text nodes but guard anyway
const RE_TOO_SHORT = /^.{0,1}$/;

// Application identifiers: standalone digits (phone numbers like "1912")
const RE_APP_ID = /^\d{3,}$/;

/**
 * Returns true if this string should be left untranslated.
 * @param {string} text
 */
function shouldSkipText(text) {
  const t = text.trim();
  if (!t) return true;
  if (RE_TOO_SHORT.test(t)) return true;
  if (RE_PUNCT_ONLY.test(t)) return true;
  if (RE_PURE_NUMBER.test(t)) return true;
  if (RE_DATE_LIKE.test(t)) return true;
  if (RE_URL.test(t)) return true;
  if (RE_APP_ID.test(t)) return true;
  return false;
}

/* ── Tag names whose subtree must be skipped entirely ───────────────────────── */
const SKIP_TAG_SET = new Set([
  'SCRIPT', 'STYLE', 'CODE', 'PRE', 'KBD', 'SAMP',
  'INPUT', 'TEXTAREA', 'SELECT', 'OPTION', 'BUTTON',
  'MATH', 'SVG', 'CANVAS', 'NOSCRIPT', 'TEMPLATE',
]);

/**
 * Returns true if the given element (or any ancestor up to `root`) means
 * its text nodes must be skipped.
 * @param {Element} el
 * @returns {boolean}
 */
function isSkippedElement(el) {
  let node = el;
  while (node && node.nodeType === Node.ELEMENT_NODE) {
    // Skip by tag name
    if (SKIP_TAG_SET.has(node.tagName)) return true;
    // Skip contenteditable
    if (node.contentEditable === 'true') return true;
    // Skip data-no-translate attribute
    if (node.hasAttribute('data-no-translate')) return true;
    // Skip sensitive fields and passwords explicitly
    if (
      node.hasAttribute('data-sensitive') ||
      node.getAttribute('type') === 'password' ||
      node.getAttribute('type') === 'hidden' ||
      node.classList.contains('sensitive-field')
    ) {
      return true;
    }
    // Skip the translation widget itself (identified by tw-panel / tw-fab classes)
    if (
      node.classList.contains('tw-fab') ||
      node.classList.contains('tw-panel') ||
      node.id === 'tw-language-panel'
    ) {
      return true;
    }
    node = node.parentElement;
  }
  return false;
}

/* ── WeakMap: Text node → original text string ──────────────────────────────── */
const originalTextStore = new WeakMap();

/**
 * Collect all eligible Text nodes from the given root element.
 * @param {Element} root
 * @returns {Text[]}
 */
export function collectTextNodes(root = document.body) {
  const nodes = [];

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        // Parent element checks
        if (node.parentElement && isSkippedElement(node.parentElement)) {
          return NodeFilter.FILTER_REJECT;
        }
        // Content checks
        if (shouldSkipText(node.nodeValue ?? '')) {
          return NodeFilter.FILTER_SKIP;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let current;
  while ((current = walker.nextNode())) {
    nodes.push(current);
  }
  return nodes;
}

/* ── Simple async semaphore ─────────────────────────────────────────────────── */
function createSemaphore(concurrency = 4) {
  let running = 0;
  const queue = [];

  function next() {
    if (queue.length === 0 || running >= concurrency) return;
    running++;
    const { fn, resolve, reject } = queue.shift();
    Promise.resolve()
      .then(fn)
      .then(resolve, reject)
      .finally(() => {
        running--;
        next();
      });
  }

  return {
    run(fn) {
      return new Promise((resolve, reject) => {
        queue.push({ fn, resolve, reject });
        next();
      });
    },
  };
}

const semaphore = createSemaphore(4);

/* ── Generation counter — prevents stale responses ─────────────────────────── */
let _currentGeneration = 0;

/**
 * Start a new translation generation. Any in-flight tasks from a prior
 * generation will detect the mismatch and not write to the DOM.
 * @returns {number} the new generation id
 */
export function newGeneration() {
  _currentGeneration += 1;
  return _currentGeneration;
}

/**
 * Translate all eligible text nodes inside `root` to `targetLang`.
 *
 * @param {object} options
 * @param {Element}  options.root           - DOM root to scan (default: document.body)
 * @param {string}   options.targetLang     - e.g. 'hi'
 * @param {string}   options.sourceLang     - e.g. 'en'
 * @param {number}   options.websiteId      - forwarded to translateText()
 * @param {number}   options.generation     - generation id; stale responses are dropped
 * @param {AbortSignal} [options.signal]    - external cancellation signal
 * @param {function} [options.onProgress]  - called with (done, total) on each completion
 * @param {function} [options.onError]     - called with (err, textNode) for per-node errors
 * @returns {Promise<{ translated: number, skipped: number, failed: number }>}
 */
export async function translateDom({
  root = document.body,
  targetLang,
  sourceLang = 'en',
  websiteId = 1,
  generation = newGeneration(),
  signal,
  onProgress,
  onError,
}) {
  const nodes = collectTextNodes(root);
  const total = nodes.length;
  let translated = 0;
  let skipped = 0;
  let failed = 0;

  if (total === 0) return { translated, skipped, failed };

  const tasks = nodes.map((textNode) => {
    return semaphore.run(async () => {
      // Bail if generation has changed or externally cancelled
      if (generation !== _currentGeneration || signal?.aborted) {
        skipped++;
        return;
      }

      const originalText = textNode.nodeValue;

      // Preserve original in WeakMap (only once — the first time)
      if (!originalTextStore.has(textNode)) {
        originalTextStore.set(textNode, originalText);
      }

      // If translating back to source, restore from WeakMap
      if (targetLang === sourceLang) {
        const original = originalTextStore.get(textNode);
        if (original !== undefined) {
          textNode.nodeValue = original;
        }
        translated++;
        onProgress?.(translated + failed, total);
        return;
      }

      try {
        const result = await translateText({
          website_id: websiteId,
          text: originalText.trim(),
          source_language: sourceLang,
          target_language: targetLang,
          signal,
        });

        // Guard: drop result if generation changed while request was in-flight
        if (generation !== _currentGeneration || signal?.aborted) {
          skipped++;
          return;
        }

        // Write translated text, preserving surrounding whitespace
        const leading = originalText.match(/^\s*/)?.[0] ?? '';
        const trailing = originalText.match(/\s*$/)?.[0] ?? '';
        textNode.nodeValue = leading + result.translated_text + trailing;
        translated++;
      } catch (err) {
        if (err.name === 'AbortError') {
          skipped++;
          return;
        }
        failed++;
        onError?.(err, textNode);
      } finally {
        onProgress?.(translated + failed + skipped, total);
      }
    });
  });

  await Promise.allSettled(tasks);
  return { translated, skipped, failed };
}

/**
 * Restore all text nodes inside `root` to their original English values
 * using the WeakMap store. Does NOT call the API.
 * @param {Element} root
 */
export function restoreDom(root = document.body) {
  const nodes = collectTextNodes(root);
  for (const textNode of nodes) {
    const original = originalTextStore.get(textNode);
    if (original !== undefined) {
      textNode.nodeValue = original;
    }
  }
  // Also sweep any node that may have been translated but is now outside
  // the current TreeWalker scope (e.g., nodes hidden by CSS)
}

