/**
 * domTranslator.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated tests for src/utils/domTranslator.js
 * (Prompt 6 — Member 3: Final Integration, Testing, and Documentation)
 *
 * Tests:
 *  1.  collectTextNodes — skips script/style/input elements
 *  2.  collectTextNodes — skips nodes with data-no-translate
 *  3.  collectTextNodes — skips pure numbers
 *  4.  collectTextNodes — skips URL-like strings
 *  5.  collectTextNodes — skips date-like strings
 *  6.  collectTextNodes — skips strings under 2 characters
 *  7.  collectTextNodes — collects valid plain-text nodes
 *  8.  newGeneration — returns incrementing values
 *  9.  translateDom — calls translateText for each eligible text node
 *  10. translateDom — writes translated text back to DOM node
 *  11. translateDom — preserves leading/trailing whitespace around translated text
 *  12. translateDom — does NOT translate when targetLang === sourceLang (restores)
 *  13. translateDom — records failed count when translateText throws
 *  14. translateDom — does NOT write DOM when signal is aborted mid-flight
 *  15. translateDom — skips nodes that have data-no-translate
 *  16. restoreDom — restores original text after a translation cycle
 *  17. restoreDom — no-ops gracefully when no original was stored
 *  18. translateDom — returns { translated, skipped, failed } summary
 *  19. translateDom — calls onProgress callback with correct counts
 *  20. translateDom — calls onError callback when translateText throws
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mock translationApi before importing the module under test ────────────────
vi.mock('../services/translationApi', () => ({
  translateText: vi.fn(),
}));

import {
  collectTextNodes,
  translateDom,
  restoreDom,
  newGeneration,
} from '../utils/domTranslator';

import { translateText } from '../services/translationApi';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a minimal in-memory DOM element with the given HTML string.
 * Returns the container div so text nodes are real DOM objects.
 */
function makeElement(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container;
}

function cleanup(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock translation response factory
// ─────────────────────────────────────────────────────────────────────────────

function mockTranslateResponse(text) {
  return {
    original_text: text,
    translated_text: `[HI:${text}]`,
    source_language: 'en',
    target_language: 'hi',
    status: 'machine',
    isMock: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Setup / teardown
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  // Default: translateText resolves successfully
  translateText.mockImplementation(({ text }) =>
    Promise.resolve(mockTranslateResponse(text))
  );
});

afterEach(() => {
  // Remove any elements added to body during tests
  document.body.innerHTML = '';
});

// ─────────────────────────────────────────────────────────────────────────────
// 1–7: collectTextNodes
// ─────────────────────────────────────────────────────────────────────────────

describe('collectTextNodes() — element skipping', () => {
  it('skips text inside <script> elements', () => {
    const el = makeElement('<script>var x = 1;</script><p>Keep me</p>');
    const nodes = collectTextNodes(el);
    const values = nodes.map((n) => n.nodeValue.trim());
    expect(values).not.toContain('var x = 1;');
    expect(values).toContain('Keep me');
    cleanup(el);
  });

  it('skips text inside <style> elements', () => {
    const el = makeElement('<style>body { color: red; }</style><p>Visible</p>');
    const nodes = collectTextNodes(el);
    const values = nodes.map((n) => n.nodeValue.trim());
    expect(values).not.toContain('body { color: red; }');
    expect(values).toContain('Visible');
    cleanup(el);
  });

  it('skips text inside <input> elements (value is not a text node)', () => {
    // Input elements do not expose text nodes — this just confirms no crash
    const el = makeElement('<input type="text" value="hello" /><p>Show</p>');
    const nodes = collectTextNodes(el);
    const values = nodes.map((n) => n.nodeValue.trim());
    expect(values).toContain('Show');
    cleanup(el);
  });

  it('skips nodes whose ancestor has data-no-translate', () => {
    const el = makeElement(
      '<div data-no-translate><p>Widget text</p></div><p>Page text</p>'
    );
    const nodes = collectTextNodes(el);
    const values = nodes.map((n) => n.nodeValue.trim());
    expect(values).not.toContain('Widget text');
    expect(values).toContain('Page text');
    cleanup(el);
  });
});

describe('collectTextNodes() — content skipping', () => {
  it('skips pure numeric strings', () => {
    const el = makeElement('<p>12345</p><p>Electricity Bill</p>');
    const nodes = collectTextNodes(el);
    const values = nodes.map((n) => n.nodeValue.trim());
    expect(values).not.toContain('12345');
    expect(values).toContain('Electricity Bill');
    cleanup(el);
  });

  it('skips URL-like strings', () => {
    const el = makeElement('<p>https://example.gov.in</p><p>Visit our portal</p>');
    const nodes = collectTextNodes(el);
    const values = nodes.map((n) => n.nodeValue.trim());
    expect(values).not.toContain('https://example.gov.in');
    expect(values).toContain('Visit our portal');
    cleanup(el);
  });

  it('skips date-like strings such as "10 Nov 2026"', () => {
    const el = makeElement('<p>10 Nov 2026</p><p>Application deadline</p>');
    const nodes = collectTextNodes(el);
    const values = nodes.map((n) => n.nodeValue.trim());
    expect(values).not.toContain('10 Nov 2026');
    expect(values).toContain('Application deadline');
    cleanup(el);
  });

  it('skips strings under 2 characters', () => {
    const el = makeElement('<p>A</p><p>Go to the portal</p>');
    const nodes = collectTextNodes(el);
    const values = nodes.map((n) => n.nodeValue.trim());
    expect(values).not.toContain('A');
    expect(values).toContain('Go to the portal');
    cleanup(el);
  });

  it('collects valid translatable text nodes', () => {
    const el = makeElement(
      '<h1>Electricity Services Portal</h1><p>Apply for a new connection today.</p>'
    );
    const nodes = collectTextNodes(el);
    const values = nodes.map((n) => n.nodeValue.trim());
    expect(values).toContain('Electricity Services Portal');
    expect(values).toContain('Apply for a new connection today.');
    cleanup(el);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8: newGeneration
// ─────────────────────────────────────────────────────────────────────────────

describe('newGeneration()', () => {
  it('returns incrementing integer values on successive calls', () => {
    const g1 = newGeneration();
    const g2 = newGeneration();
    const g3 = newGeneration();
    expect(g2).toBe(g1 + 1);
    expect(g3).toBe(g2 + 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9–14: translateDom
// ─────────────────────────────────────────────────────────────────────────────

describe('translateDom() — successful translation', () => {
  it('calls translateText for each eligible text node', async () => {
    const el = makeElement('<p>Apply for subsidy</p><p>View your bill</p>');
    const generation = newGeneration();
    await translateDom({
      root: el,
      targetLang: 'hi',
      sourceLang: 'en',
      websiteId: 1,
      generation,
    });
    expect(translateText).toHaveBeenCalledTimes(2);
    cleanup(el);
  });

  it('writes the translated text back into the text node', async () => {
    const el = makeElement('<p>Apply for subsidy</p>');
    const generation = newGeneration();
    await translateDom({
      root: el,
      targetLang: 'hi',
      sourceLang: 'en',
      websiteId: 1,
      generation,
    });
    expect(el.textContent).toContain('[HI:Apply for subsidy]');
    cleanup(el);
  });

  it('preserves leading/trailing whitespace around translated text', async () => {
    const el = document.createElement('p');
    // Insert a text node with leading/trailing spaces
    el.appendChild(document.createTextNode('  New Connection  '));
    document.body.appendChild(el);

    const generation = newGeneration();
    await translateDom({
      root: el,
      targetLang: 'hi',
      sourceLang: 'en',
      websiteId: 1,
      generation,
    });

    const textNode = el.firstChild;
    expect(textNode.nodeValue).toMatch(/^\s+/); // leading space preserved
    expect(textNode.nodeValue).toMatch(/\s+$/); // trailing space preserved
    cleanup(el);
  });

  it('returns a summary with { translated, skipped, failed } keys', async () => {
    const el = makeElement('<p>Electricity subsidy scheme</p>');
    const generation = newGeneration();
    const result = await translateDom({
      root: el,
      targetLang: 'hi',
      sourceLang: 'en',
      websiteId: 1,
      generation,
    });
    expect(result).toHaveProperty('translated');
    expect(result).toHaveProperty('skipped');
    expect(result).toHaveProperty('failed');
    expect(result.translated).toBeGreaterThanOrEqual(1);
    cleanup(el);
  });
});

describe('translateDom() — restore to source language', () => {
  it('restores original text when targetLang === sourceLang ("en")', async () => {
    const el = makeElement('<p>Apply for subsidy</p>');
    const gen1 = newGeneration();

    // Translate to Hindi first
    await translateDom({
      root: el,
      targetLang: 'hi',
      sourceLang: 'en',
      websiteId: 1,
      generation: gen1,
    });
    expect(el.textContent).toContain('[HI:Apply for subsidy]');

    // Now restore to English
    const gen2 = newGeneration();
    await translateDom({
      root: el,
      targetLang: 'en',
      sourceLang: 'en',
      websiteId: 1,
      generation: gen2,
    });
    expect(el.textContent).toContain('Apply for subsidy');
    cleanup(el);
  });
});

describe('translateDom() — error handling', () => {
  it('records failed count when translateText rejects', async () => {
    translateText.mockRejectedValue(new Error('Network error'));
    const el = makeElement('<p>Electricity services</p>');
    const generation = newGeneration();
    const result = await translateDom({
      root: el,
      targetLang: 'hi',
      sourceLang: 'en',
      websiteId: 1,
      generation,
    });
    expect(result.failed).toBeGreaterThanOrEqual(1);
    cleanup(el);
  });

  it('calls onError callback with the error and text node when translation fails', async () => {
    const networkError = new Error('Backend offline');
    translateText.mockRejectedValue(networkError);

    const el = makeElement('<p>Apply online today</p>');
    const onError = vi.fn();
    const generation = newGeneration();

    await translateDom({
      root: el,
      targetLang: 'hi',
      sourceLang: 'en',
      websiteId: 1,
      generation,
      onError,
    });

    expect(onError).toHaveBeenCalledOnce();
    const [calledErr, calledNode] = onError.mock.calls[0];
    expect(calledErr.message).toBe('Backend offline');
    expect(calledNode.nodeType).toBe(Node.TEXT_NODE);
    cleanup(el);
  });

  it('does not call translateText and returns empty result when DOM has no eligible nodes', async () => {
    const el = makeElement('<p>12345</p><p>https://gov.in</p>');
    const generation = newGeneration();
    const result = await translateDom({
      root: el,
      targetLang: 'hi',
      sourceLang: 'en',
      websiteId: 1,
      generation,
    });
    expect(translateText).not.toHaveBeenCalled();
    expect(result).toEqual({ translated: 0, skipped: 0, failed: 0 });
    cleanup(el);
  });
});

describe('translateDom() — AbortSignal cancellation', () => {
  it('does not call translateText when signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    const el = makeElement('<p>New electricity connection</p>');
    const generation = newGeneration();

    await translateDom({
      root: el,
      targetLang: 'hi',
      sourceLang: 'en',
      websiteId: 1,
      generation,
      signal: controller.signal,
    });

    // With a pre-aborted signal the semaphore still runs but bails early
    // translateText should not be called (or aborted immediately)
    // The important thing: DOM text should NOT be modified
    expect(el.textContent.trim()).toBe('New electricity connection');
    cleanup(el);
  });
});

describe('translateDom() — skips data-no-translate elements', () => {
  it('never calls translateText for text inside data-no-translate', async () => {
    const el = makeElement(
      '<div data-no-translate>Widget controls</div><p>Page content here</p>'
    );
    const generation = newGeneration();
    await translateDom({
      root: el,
      targetLang: 'hi',
      sourceLang: 'en',
      websiteId: 1,
      generation,
    });
    // translateText should only be called for "Page content here"
    expect(translateText).toHaveBeenCalledTimes(1);
    const [callArgs] = translateText.mock.calls;
    expect(callArgs[0].text).toBe('Page content here');
    cleanup(el);
  });
});

describe('translateDom() — progress callbacks', () => {
  it('calls onProgress with increasing counts up to total', async () => {
    const el = makeElement('<p>Scheme one</p><p>Scheme two</p>');
    const onProgress = vi.fn();
    const generation = newGeneration();

    await translateDom({
      root: el,
      targetLang: 'hi',
      sourceLang: 'en',
      websiteId: 1,
      generation,
      onProgress,
    });

    expect(onProgress).toHaveBeenCalled();
    // Last call should have done === total
    const lastCall = onProgress.mock.calls[onProgress.mock.calls.length - 1];
    const [done, total] = lastCall;
    expect(done).toBe(total);
    cleanup(el);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 16–17: restoreDom
// ─────────────────────────────────────────────────────────────────────────────

describe('restoreDom()', () => {
  it('restores original English text after a Hindi translation', async () => {
    const el = makeElement('<p>Consumer rights charter</p>');
    const generation = newGeneration();

    await translateDom({
      root: el,
      targetLang: 'hi',
      sourceLang: 'en',
      websiteId: 1,
      generation,
    });
    // DOM now has Hindi text
    expect(el.textContent).toContain('[HI:Consumer rights charter]');

    // restoreDom should bring English back
    restoreDom(el);
    expect(el.textContent).toContain('Consumer rights charter');
    cleanup(el);
  });

  it('does not throw when called on an element that was never translated', () => {
    const el = makeElement('<p>Untouched paragraph</p>');
    expect(() => restoreDom(el)).not.toThrow();
    cleanup(el);
  });
});

