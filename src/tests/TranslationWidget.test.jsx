/**
 * TranslationWidget.test.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Component-level tests for TranslationWidget using
 * Vitest + React Testing Library.
 *
 * Uses vi.mock() hoisting (top-level) and static imports
 * for ESM compatibility with Vite/Vitest.
 *
 * Tests:
 *  1. Widget renders floating action button (FAB)
 *  2. FAB has correct initial aria-expanded=false
 *  3. FAB opens panel on click (aria-expanded=true)
 *  4. FAB carries data-no-translate
 *  5. Panel is not visible initially
 *  6. Panel opens on FAB click
 *  7. Panel shows English and Hindi options
 *  8. Panel closes on Escape key
 *  9. Panel has aria-modal=true
 * 10. Close button inside panel closes it
 * 11. Status bar has aria-live=polite
 * 12. Language buttons disabled when isLoading=true
 * 13. MOCK badge shown when isMock=true
 * 14. LIVE badge shown when isMock=false
 * 15. MOCK badge text mentions local translations
 * 16. Progress bar absent when not translating
 * 17. Retry button absent when failedCount=0
 * 18. Retry button absent when language is English
 * 19. Retry button appears when failedCount>0 and lang=Hindi
 * 20. Retry button aria-label shows failed count
 * 21. FAB is keyboard-focusable
 * 22. FAB has a descriptive title attribute
 * 23. Language list has role=listbox with aria-label
 * 24. Language options have role=option with aria-selected
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// ── Mocks (must be at top level for Vitest hoisting) ─────────────────────────

// Mock CSS import (no-op in jsdom)
vi.mock('../styles/translation-widget.css', () => ({}));

// Mutable state for hook returns — tests mutate these before each render
let _translationState = {};
let _pageTranslationState = {};

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => _translationState,
}));

vi.mock('../hooks/usePageTranslation', () => ({
  usePageTranslation: () => _pageTranslationState,
}));

// ── Static import of the component (after mocks are hoisted) ─────────────────
import TranslationWidget from '../components/TranslationWidget';

// ── Default hook return values ───────────────────────────────────────────────
const defaultTranslation = {
  selectedLang: 'en',
  setSelectedLang: vi.fn(),
  status: 'idle',
  statusMsg: 'Choose a language below',
  isLoading: false,
  isMock: false,
  translate: vi.fn(),
  cancelTranslation: vi.fn(),
};

const defaultPageTranslation = {
  progress: { done: 0, total: 0 },
  failedCount: 0,
  retryFailed: vi.fn(),
};

// ── Reset helpers ────────────────────────────────────────────────────────────
function setupHooks(translationOverrides = {}, pageTranslationOverrides = {}) {
  _translationState = { ...defaultTranslation, ...translationOverrides };
  _pageTranslationState = { ...defaultPageTranslation, ...pageTranslationOverrides };
}

function renderWidget() {
  return render(
    <BrowserRouter>
      <TranslationWidget />
    </BrowserRouter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Test suites
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  setupHooks();
});

afterEach(() => {
  vi.clearAllMocks();
});

// ── 1. Floating Action Button ─────────────────────────────────────────────────
describe('TranslationWidget — Floating Action Button (FAB)', () => {
  it('renders a button with aria-label mentioning language', () => {
    renderWidget();
    expect(screen.getByRole('button', { name: /language/i })).toBeInTheDocument();
  });

  it('FAB has aria-expanded=false when panel is closed', () => {
    renderWidget();
    const fab = screen.getByRole('button', { name: /language/i });
    expect(fab).toHaveAttribute('aria-expanded', 'false');
  });

  it('FAB sets aria-expanded=true after clicking open', async () => {
    renderWidget();
    const fab = screen.getByRole('button', { name: /language/i });
    await userEvent.click(fab);
    expect(fab).toHaveAttribute('aria-expanded', 'true');
  });

  it('FAB carries data-no-translate (widget must not translate itself)', () => {
    renderWidget();
    const fab = screen.getByRole('button', { name: /language/i });
    expect(fab).toHaveAttribute('data-no-translate');
  });

  it('FAB has a descriptive title attribute', () => {
    renderWidget();
    const fab = screen.getByRole('button', { name: /language/i });
    expect(fab.getAttribute('title')).toBeTruthy();
  });

  it('FAB is keyboard-focusable', () => {
    renderWidget();
    const fab = screen.getByRole('button', { name: /language/i });
    fab.focus();
    expect(document.activeElement).toBe(fab);
  });
});

// ── 2. Language Selector Panel ────────────────────────────────────────────────
describe('TranslationWidget — Language Selector Panel', () => {
  it('panel is not visible initially', () => {
    renderWidget();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('panel opens when FAB is clicked', async () => {
    renderWidget();
    await userEvent.click(screen.getByRole('button', { name: /language/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('panel displays English and Hindi language options', async () => {
    renderWidget();
    await userEvent.click(screen.getByRole('button', { name: /language/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('button', { name: /english.*english/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /hindi/i })).toBeInTheDocument();
  });

  it('panel closes on Escape key press', async () => {
    renderWidget();
    await userEvent.click(screen.getByRole('button', { name: /language/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('panel has aria-modal=true for screen reader accessibility', async () => {
    renderWidget();
    await userEvent.click(screen.getByRole('button', { name: /language/i }));
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('close button inside panel closes the panel', async () => {
    renderWidget();
    await userEvent.click(screen.getByRole('button', { name: /language/i }));
    const closeBtn = screen.getByRole('button', { name: /close language selector/i });
    await userEvent.click(closeBtn);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('language list has role=listbox with aria-label', async () => {
    renderWidget();
    await userEvent.click(screen.getByRole('button', { name: /language/i }));
    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-label');
  });

  it('language options have role=option with aria-selected', async () => {
    renderWidget();
    await userEvent.click(screen.getByRole('button', { name: /language/i }));
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
    options.forEach((option) => {
      expect(option).toHaveAttribute('aria-selected');
    });
  });
});

// ── 3. Status / Loading ───────────────────────────────────────────────────────
describe('TranslationWidget — Status States', () => {
  it('status bar has aria-live=polite for announcements', async () => {
    renderWidget();
    await userEvent.click(screen.getByRole('button', { name: /language/i }));
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('language buttons are disabled while isLoading=true', async () => {
    setupHooks({ isLoading: true, status: 'loading', statusMsg: 'Translating…' });
    renderWidget();
    await userEvent.click(screen.getByRole('button', { name: /language/i }));
    const dialog = screen.getByRole('dialog');
    // The language option buttons inside the panel should be disabled during loading
    const langButtons = within(dialog).getAllByRole('button', { name: /english|hindi/i });
    langButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});

// ── 4. Mock / Live Badges ─────────────────────────────────────────────────────
describe('TranslationWidget — Mock / Live Mode Badges', () => {
  it('shows MOCK badge when isMock=true', async () => {
    setupHooks({ isMock: true });
    renderWidget();
    await userEvent.click(screen.getByRole('button', { name: /language/i }));
    expect(screen.getByText('MOCK')).toBeInTheDocument();
  });

  it('shows LIVE badge when isMock=false', async () => {
    setupHooks({ isMock: false });
    renderWidget();
    await userEvent.click(screen.getByRole('button', { name: /language/i }));
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('MOCK mode shows message about local sample translations', async () => {
    setupHooks({ isMock: true });
    renderWidget();
    await userEvent.click(screen.getByRole('button', { name: /language/i }));
    expect(screen.getByText(/local sample translations/i)).toBeInTheDocument();
  });

  it('LIVE mode shows message about connected API', async () => {
    setupHooks({ isMock: false });
    renderWidget();
    await userEvent.click(screen.getByRole('button', { name: /language/i }));
    expect(screen.getByText(/connected to rajbhasha/i)).toBeInTheDocument();
  });
});

// ── 5. Progress Bar ───────────────────────────────────────────────────────────
describe('TranslationWidget — Progress Bar', () => {
  it('page-level progress bar is NOT rendered when not translating', () => {
    renderWidget();
    // The tw-progress-bar-wrap is only shown when isPageLoading=true (localStatus='loading')
    // In idle/default state it should be absent.
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});

// ── 6. Retry Button ───────────────────────────────────────────────────────────
describe('TranslationWidget — Retry Button', () => {
  it('retry button is NOT visible when failedCount=0', () => {
    setupHooks({}, { failedCount: 0 });
    renderWidget();
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('retry button is NOT visible when selectedLang is English (no translation active)', () => {
    setupHooks({ selectedLang: 'en' }, { failedCount: 3 });
    renderWidget();
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('retry button IS visible when failedCount > 0 and selectedLang is Hindi', () => {
    setupHooks({ selectedLang: 'hi', status: 'error' }, { failedCount: 2 });
    renderWidget();
    expect(screen.getByRole('button', { name: /retry.*failed/i })).toBeInTheDocument();
  });

  it('retry button aria-label includes the failed count', () => {
    setupHooks({ selectedLang: 'hi', status: 'error' }, { failedCount: 7 });
    renderWidget();
    const retryBtn = screen.getByRole('button', { name: /retry.*7.*failed/i });
    expect(retryBtn).toBeInTheDocument();
  });
});
