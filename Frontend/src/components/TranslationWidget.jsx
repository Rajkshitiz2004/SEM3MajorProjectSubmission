/**
 * TranslationWidget.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Floating language-switcher widget for the RajBhasha AI portal.
 *
 * Integrates:
 *   • useTranslation  — language state + single-text API health check
 *   • usePageTranslation — full DOM sweep, route-aware re-translation,
 *                          MutationObserver for lazy content, retry support
 *   • LanguageSelector   — compact floating panel with status bar
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useCallback, useRef } from 'react';
import { Languages, RefreshCw } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { DEFAULT_LANGUAGE, getLanguageByCode } from '../data/mockTranslations';
import { useTranslation } from '../hooks/useTranslation';
import { usePageTranslation } from '../hooks/usePageTranslation';
import '../styles/translation-widget.css';

export default function TranslationWidget() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  /* ── Widget-level translation state (drives status bar text) ── */
  const {
    selectedLang,
    setSelectedLang,
    status,
    statusMsg,
    isLoading,
    isMock,
  } = useTranslation({
    initialLanguage: DEFAULT_LANGUAGE,
    websiteId: Number(import.meta.env.VITE_DEFAULT_WEBSITE_ID) || 1,
  });

  const [localStatus, setLocalStatus] = useState({ status: 'idle', msg: 'Choose a language below' });

  /* ── Status reported up from page-translation hook ── */
  const statusRef = useRef({ status: 'idle', msg: '' });

  const handleStatusChange = useCallback((newStatus, msg) => {
    statusRef.current = { status: newStatus, msg };
    // Bubble into the useTranslation display state
    // We achieve this by calling setSelectedLang only on actual lang change;
    // status display is managed via our own localStatus state.
    setLocalStatus({ status: newStatus, msg });
  }, []);

  /* ── Page-level DOM translation ── */
  const { progress, failedCount, retryFailed } = usePageTranslation({
    activeLang: selectedLang,
    sourceLang: 'en',
    websiteId: Number(import.meta.env.VITE_DEFAULT_WEBSITE_ID) || 1,
    onStatusChange: handleStatusChange,
  });

  const selectedLangMeta = getLanguageByCode(selectedLang);

  /* ── Panel open / close ── */
  const openPanel = () => setIsPanelOpen(true);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);

  /* ── Language selection handler ── */
  const handleLanguageSelect = useCallback(
    (code) => {
      if (code === selectedLang) {
        closePanel();
        return;
      }
      // Commit language change — usePageTranslation reacts to selectedLang change
      setSelectedLang(code);
      closePanel(); // Close panel immediately so user sees translation progress
      setLocalStatus({ status: 'loading', msg: 'Starting page translation…' });
    },
    [selectedLang, closePanel, setSelectedLang, setLocalStatus]
  );

  /* ── Effective status for the panel display ── */
  // Prefer the page-translation status while loading/erroring;
  // fall back to the widget's own translation status.
  const effectiveStatus = localStatus.status !== 'idle' ? localStatus.status : status;
  const effectiveMsg =
    localStatus.status !== 'idle'
      ? localStatus.msg
      : (statusMsg || 'Choose a language below');

  /* ── Progress bar percentage ── */
  const progressPct =
    progress.total > 0
      ? Math.round((progress.done / progress.total) * 100)
      : 0;

  const isPageLoading = localStatus.status === 'loading';

  return (
    <>
      {/* ── Floating Action Button ── */}
      <button
        type="button"
        className={`tw-fab${selectedLang === 'hi' ? ' lang-hi' : ''}${isPageLoading ? ' is-translating' : ''}`}
        onClick={() => (isPanelOpen ? closePanel() : openPanel())}
        aria-label={`Language: ${selectedLangMeta.label}. Click to change language.`}
        aria-expanded={isPanelOpen}
        aria-controls="tw-language-panel"
        title="Change website language"
        data-no-translate
      >
        <span className="tw-fab-globe" aria-hidden="true">
          {isPageLoading
            ? <RefreshCw size={18} className="tw-fab-spin" />
            : <Languages size={18} />}
        </span>
        <span data-no-translate>{selectedLangMeta.nativeLabel}</span>
        <span className="tw-fab-lang" aria-hidden="true" data-no-translate>
          {selectedLang.toUpperCase()}
        </span>
      </button>

      {/* ── Progress bar (only while translating) ── */}
      {isPageLoading && progress.total > 0 && (
        <div
          className="tw-progress-bar-wrap"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Translation progress: ${progress.done} of ${progress.total}`}
          data-no-translate
        >
          <div
            className="tw-progress-bar-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* ── Retry button (only when errors occurred and not loading) ── */}
      {failedCount > 0 && localStatus.status !== 'loading' && selectedLang !== 'en' && (
        <button
          type="button"
          className="tw-retry-btn"
          onClick={retryFailed}
          aria-label={`Retry ${failedCount} failed translation(s)`}
          data-no-translate
        >
          <RefreshCw size={14} />
          <span data-no-translate>Retry ({failedCount} failed)</span>
        </button>
      )}

      {/* ── Language Selector Panel ── */}
      {isPanelOpen && (
        <div id="tw-language-panel" data-no-translate>
          <LanguageSelector
            selectedLang={selectedLang}
            onSelect={handleLanguageSelect}
            onClose={closePanel}
            isLoading={isPageLoading || isLoading}
            status={effectiveStatus}
            statusMsg={effectiveMsg}
            isMock={isMock}
            progress={progress}
          />
        </div>
      )}
    </>
  );
}
