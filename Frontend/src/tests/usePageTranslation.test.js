/**
 * usePageTranslation.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit tests for src/hooks/usePageTranslation.js
 * (Prompt 6 — Member 3: Final Integration, Testing, and Documentation)
 *
 * Key design note:
 *   The hook calls collectTextNodes(root) BEFORE invoking translateDom. If the
 *   JSDOM body has no eligible text nodes the hook short-circuits early.
 *   We mock collectTextNodes to return fake Text nodes so the hook always
 *   proceeds to call translateDom and update state.
 *
 * Tests:
 *  1.  Initial state — progress is { done:0, total:0 }
 *  2.  Initial state — failedCount is 0
 *  3.  Initial state — exposes retryFailed function
 *  4.  activeLang='en' — restoreDom is called (not translateDom)
 *  5.  activeLang changed to 'hi' — translateDom is called with targetLang='hi'
 *  6.  onStatusChange — called with 'loading' when translation starts
 *  7.  onStatusChange — called with 'success' on clean completion (0 failed)
 *  8.  onStatusChange — called with 'success'+partial msg when some fail (translated>0)
 *  9.  onStatusChange — called with 'error' when ALL segments fail (translated===0)
 *  10. onStatusChange — called with 'error' when translateDom throws
 *  11. failedCount — set to result.failed after translateDom resolves
 *  12. retryFailed — calls translateDom again when activeLang is Hindi
 *  13. retryFailed — does not call translateDom when activeLang is English
 *  14. activeLang='en' at mount — no 'loading' status emitted
 *  15. Unmount during idle — no errors
 *  16. Unmount during in-flight translation — no errors
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

// ── Mock domTranslator before importing the hook ──────────────────────────────
vi.mock('../utils/domTranslator', () => ({
  translateDom: vi.fn(),
  restoreDom: vi.fn(),
  newGeneration: vi.fn(),
  collectTextNodes: vi.fn(),
}));

import { usePageTranslation } from '../hooks/usePageTranslation';
import {
  translateDom,
  restoreDom,
  newGeneration,
  collectTextNodes,
} from '../utils/domTranslator';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Create fake Text node objects so collectTextNodes returns non-empty arrays */
function makeFakeTextNodes(count = 2) {
  return Array.from({ length: count }, (_, i) => ({
    nodeType: 3,
    nodeValue: `Sample text ${i}`,
  }));
}

function makeWrapper(initialPath = '/') {
  return function Wrapper({ children }) {
    return React.createElement(MemoryRouter, { initialEntries: [initialPath] }, children);
  };
}

function renderPageTranslation(opts = {}, wrapperPath = '/') {
  const defaultOpts = {
    activeLang: 'en',
    sourceLang: 'en',
    websiteId: 1,
    onStatusChange: vi.fn(),
    ...opts,
  };
  return renderHook(() => usePageTranslation(defaultOpts), {
    wrapper: makeWrapper(wrapperPath),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Setup / teardown
// ─────────────────────────────────────────────────────────────────────────────

let genCounter = 0;

beforeEach(() => {
  vi.clearAllMocks();
  genCounter = 0;
  newGeneration.mockImplementation(() => ++genCounter);
  // By default: 2 fake text nodes so the hook proceeds past the total===0 guard
  collectTextNodes.mockReturnValue(makeFakeTextNodes(2));
  // translateDom resolves cleanly
  translateDom.mockResolvedValue({ translated: 2, skipped: 0, failed: 0 });
  restoreDom.mockReturnValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

// ─────────────────────────────────────────────────────────────────────────────
// 1–3: Initial state
// ─────────────────────────────────────────────────────────────────────────────

describe('usePageTranslation() — initial state', () => {
  it('progress starts as { done: 0, total: 0 }', () => {
    const { result } = renderPageTranslation({ activeLang: 'en' });
    expect(result.current.progress).toEqual({ done: 0, total: 0 });
  });

  it('failedCount starts at 0', () => {
    const { result } = renderPageTranslation({ activeLang: 'en' });
    expect(result.current.failedCount).toBe(0);
  });

  it('exposes a retryFailed function', () => {
    const { result } = renderPageTranslation({ activeLang: 'en' });
    expect(typeof result.current.retryFailed).toBe('function');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4: English (restore path)
// ─────────────────────────────────────────────────────────────────────────────

describe('usePageTranslation() — English restore path', () => {
  it('calls restoreDom when activeLang equals sourceLang ("en")', async () => {
    const onStatusChange = vi.fn();
    renderPageTranslation({ activeLang: 'en', onStatusChange });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // When targetLang === sourceLang the hook calls restoreDom and emits 'success'
    expect(restoreDom).toHaveBeenCalled();
  });

  it('no "loading" status emitted when activeLang is "en" at mount', async () => {
    const onStatusChange = vi.fn();
    renderPageTranslation({ activeLang: 'en', onStatusChange });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 60));
    });

    const loadingCalls = onStatusChange.mock.calls.filter(([s]) => s === 'loading');
    expect(loadingCalls).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5: Hindi translation path — translateDom called
// ─────────────────────────────────────────────────────────────────────────────

describe('usePageTranslation() — Hindi translation path', () => {
  it('calls translateDom with targetLang="hi" when activeLang changes to "hi"', async () => {
    const onStatusChange = vi.fn();
    const { rerender } = renderHook(
      ({ lang }) =>
        usePageTranslation({
          activeLang: lang,
          sourceLang: 'en',
          websiteId: 1,
          onStatusChange,
        }),
      { wrapper: makeWrapper(), initialProps: { lang: 'en' } }
    );

    // Switch to Hindi
    await act(async () => {
      rerender({ lang: 'hi' });
    });

    await waitFor(() => expect(translateDom).toHaveBeenCalled());
    const args = translateDom.mock.calls[0][0];
    expect(args.targetLang).toBe('hi');
    expect(args.sourceLang).toBe('en');
    expect(args.websiteId).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6–10: onStatusChange callbacks
// ─────────────────────────────────────────────────────────────────────────────

describe('usePageTranslation() — onStatusChange callbacks', () => {
  it('calls onStatusChange("loading", …) while translating', async () => {
    const onStatusChange = vi.fn();
    translateDom.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ translated: 2, skipped: 0, failed: 0 }), 20))
    );

    const { rerender } = renderHook(
      ({ lang }) =>
        usePageTranslation({
          activeLang: lang,
          sourceLang: 'en',
          websiteId: 1,
          onStatusChange,
        }),
      { wrapper: makeWrapper(), initialProps: { lang: 'en' } }
    );

    await act(async () => {
      rerender({ lang: 'hi' });
      await new Promise((r) => setTimeout(r, 60));
    });

    const loadingCalls = onStatusChange.mock.calls.filter(([s]) => s === 'loading');
    expect(loadingCalls.length).toBeGreaterThan(0);
  });

  it('calls onStatusChange("success", …) when all segments translate (failed=0)', async () => {
    const onStatusChange = vi.fn();
    translateDom.mockResolvedValue({ translated: 2, skipped: 0, failed: 0 });

    const { rerender } = renderHook(
      ({ lang }) =>
        usePageTranslation({
          activeLang: lang,
          sourceLang: 'en',
          websiteId: 1,
          onStatusChange,
        }),
      { wrapper: makeWrapper(), initialProps: { lang: 'en' } }
    );

    await act(async () => {
      rerender({ lang: 'hi' });
    });

    await waitFor(() => {
      const successCalls = onStatusChange.mock.calls.filter(([s]) => s === 'success');
      expect(successCalls.length).toBeGreaterThan(0);
    });
  });

  it('calls onStatusChange("success") with partial fail message when some segments fail and translated > 0', async () => {
    const onStatusChange = vi.fn();
    translateDom.mockResolvedValue({ translated: 1, skipped: 0, failed: 1 });

    const { rerender } = renderHook(
      ({ lang }) =>
        usePageTranslation({
          activeLang: lang,
          sourceLang: 'en',
          websiteId: 1,
          onStatusChange,
        }),
      { wrapper: makeWrapper(), initialProps: { lang: 'en' } }
    );

    await act(async () => {
      rerender({ lang: 'hi' });
    });

    await waitFor(() => {
      // The hook may first emit success('Switched to English') on mount (lang='en'),
      // then emit success('…failed…') after switching to 'hi' with partial failures.
      // Find the success call whose message mentions "fail" specifically.
      const partialFailCall = onStatusChange.mock.calls.find(
        ([s, msg]) => s === 'success' && /fail/i.test(msg)
      );
      expect(partialFailCall).toBeDefined();
    });
  });

  it('calls onStatusChange("error") when translated=0 and failed>0 (complete failure)', async () => {
    const onStatusChange = vi.fn();
    translateDom.mockResolvedValue({ translated: 0, skipped: 0, failed: 2 });

    const { rerender } = renderHook(
      ({ lang }) =>
        usePageTranslation({
          activeLang: lang,
          sourceLang: 'en',
          websiteId: 1,
          onStatusChange,
        }),
      { wrapper: makeWrapper(), initialProps: { lang: 'en' } }
    );

    await act(async () => {
      rerender({ lang: 'hi' });
    });

    await waitFor(() => {
      const errorCalls = onStatusChange.mock.calls.filter(([s]) => s === 'error');
      expect(errorCalls.length).toBeGreaterThan(0);
    });
  });

  it('calls onStatusChange("error", …) when translateDom throws a non-Abort error', async () => {
    const onStatusChange = vi.fn();
    translateDom.mockRejectedValue(new Error('Translation service crashed'));

    const { rerender } = renderHook(
      ({ lang }) =>
        usePageTranslation({
          activeLang: lang,
          sourceLang: 'en',
          websiteId: 1,
          onStatusChange,
        }),
      { wrapper: makeWrapper(), initialProps: { lang: 'en' } }
    );

    await act(async () => {
      rerender({ lang: 'hi' });
    });

    await waitFor(() => {
      const errorCalls = onStatusChange.mock.calls.filter(([s]) => s === 'error');
      expect(errorCalls.length).toBeGreaterThan(0);
      const [, msg] = errorCalls[0];
      expect(msg).toContain('Translation service crashed');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11: failedCount state
// ─────────────────────────────────────────────────────────────────────────────

describe('usePageTranslation() — failedCount state', () => {
  it('failedCount is updated to result.failed after translateDom resolves', async () => {
    translateDom.mockResolvedValue({ translated: 1, skipped: 0, failed: 2 });
    const onStatusChange = vi.fn();

    const { result, rerender } = renderHook(
      ({ lang }) =>
        usePageTranslation({
          activeLang: lang,
          sourceLang: 'en',
          websiteId: 1,
          onStatusChange,
        }),
      { wrapper: makeWrapper(), initialProps: { lang: 'en' } }
    );

    await act(async () => {
      rerender({ lang: 'hi' });
    });

    await waitFor(() => {
      expect(result.current.failedCount).toBe(2);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12–13: retryFailed
// ─────────────────────────────────────────────────────────────────────────────

describe('usePageTranslation() — retryFailed()', () => {
  it('calls translateDom again when retryFailed() is invoked while lang is Hindi', async () => {
    const onStatusChange = vi.fn();

    const { result, rerender } = renderHook(
      ({ lang }) =>
        usePageTranslation({
          activeLang: lang,
          sourceLang: 'en',
          websiteId: 1,
          onStatusChange,
        }),
      { wrapper: makeWrapper(), initialProps: { lang: 'en' } }
    );

    await act(async () => {
      rerender({ lang: 'hi' });
    });
    await waitFor(() => expect(translateDom).toHaveBeenCalled());

    translateDom.mockClear();

    await act(async () => {
      result.current.retryFailed();
    });

    await waitFor(() => {
      expect(translateDom).toHaveBeenCalled();
      const args = translateDom.mock.calls[0][0];
      expect(args.targetLang).toBe('hi');
    });
  });

  it('does NOT call translateDom when retryFailed() is called while lang is English', async () => {
    // With activeLang='en', activeLangRef.current === sourceLang → bail
    const { result } = renderPageTranslation({ activeLang: 'en' });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });
    translateDom.mockClear();

    act(() => {
      result.current.retryFailed();
    });

    // Allow microtasks to flush
    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });

    expect(translateDom).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 15–16: Cleanup on unmount
// ─────────────────────────────────────────────────────────────────────────────

describe('usePageTranslation() — cleanup on unmount', () => {
  it('unmounts cleanly while in idle state', () => {
    const { unmount } = renderPageTranslation({ activeLang: 'en' });
    expect(() => unmount()).not.toThrow();
  });

  it('unmounts cleanly while a translation is in-flight', () => {
    // Never-resolving translateDom
    translateDom.mockReturnValue(new Promise(() => {}));
    const onStatusChange = vi.fn();

    const { rerender, unmount } = renderHook(
      ({ lang }) =>
        usePageTranslation({
          activeLang: lang,
          sourceLang: 'en',
          websiteId: 1,
          onStatusChange,
        }),
      { wrapper: makeWrapper(), initialProps: { lang: 'en' } }
    );

    act(() => {
      rerender({ lang: 'hi' });
    });

    expect(() => unmount()).not.toThrow();
  });
});
