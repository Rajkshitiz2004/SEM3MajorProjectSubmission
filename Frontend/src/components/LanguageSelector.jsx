import React, { useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/mockTranslations';

/**
 * LanguageSelector
 * Compact floating panel rendered inside the TranslationWidget.
 * Closes on Escape key or when clicking outside (handled via useEffect).
 *
 * Props:
 *  - selectedLang {string}         ISO code of the currently active language
 *  - onSelect     {function}       Called with the chosen language code
 *  - onClose      {function}       Called when the panel should close
 *  - isLoading    {boolean}        Disables interactions while a translation is in progress
 *  - status       {'idle'|'loading'|'success'|'error'}
 *  - statusMsg    {string}         Human-readable status message
 *  - isMock       {boolean}        Whether mock adapter is active
 *  - progress     {{ done, total }} Translation progress counters
 */
export default function LanguageSelector({
  selectedLang,
  onSelect,
  onClose,
  isLoading,
  status = 'idle',
  statusMsg = '',
  isMock = false,
  progress = { done: 0, total: 0 },
}) {
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);

  /* Auto-focus the close button when panel opens */
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  /* Escape → close */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  /* Click-outside → close */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!panelRef.current) return;
      if (panelRef.current.contains(e.target)) return;
      const fab = document.querySelector('.tw-fab');
      if (fab?.contains(e.target)) return;
      onClose();
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleLanguageClick = (code) => {
    if (isLoading) return;
    onSelect(code);
  };

  /* Status bar class */
  const statusClass =
    { loading: 'is-loading', success: 'is-success', error: 'is-error', idle: 'is-idle' }[
      status
    ] ?? 'is-idle';

  /* Progress percentage */
  const progressPct =
    progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div
      ref={panelRef}
      className="tw-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Language selection panel"
      data-no-translate
    >
      {/* ── Panel Header ── */}
      <div className="tw-panel-header">
        <div className="tw-panel-title">
          <span className="tw-panel-globe" aria-hidden="true">🌐</span>
          <span>Select Language</span>
        </div>
        <button
          ref={closeBtnRef}
          type="button"
          className="tw-panel-close"
          onClick={onClose}
          aria-label="Close language selector"
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Status Bar ── */}
      <div
        className={`tw-status-bar ${statusClass}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {status === 'loading' && (
          <span className="tw-spinner" aria-hidden="true" />
        )}
        {status === 'success' && (
          <Check size={14} aria-hidden="true" />
        )}
        <span>{statusMsg || (status === 'idle' ? 'Choose a language below' : '')}</span>
      </div>

      {/* ── Progress Bar (inside panel) ── */}
      {status === 'loading' && progress.total > 0 && (
        <div className="tw-panel-progress" aria-hidden="true">
          <div
            className="tw-panel-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
          <span className="tw-panel-progress-label">
            {progress.done} / {progress.total}
          </span>
        </div>
      )}

      {/* ── Language Option List ── */}
      <ul
        className="tw-lang-list"
        role="listbox"
        aria-label="Available languages"
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isActive = lang.code === selectedLang;
          return (
            <li key={lang.code} role="option" aria-selected={isActive}>
              <button
                type="button"
                className={`tw-lang-btn${isActive ? ' is-active' : ''}`}
                onClick={() => handleLanguageClick(lang.code)}
                disabled={isLoading}
                aria-pressed={isActive}
                aria-label={`${lang.label} — ${lang.nativeLabel}${isActive ? ' (currently selected)' : ''}`}
              >
                <span className="tw-lang-flag" aria-hidden="true">
                  {lang.flag}
                </span>
                <span className="tw-lang-labels">
                  <span className="tw-lang-native">{lang.nativeLabel}</span>
                  <span className="tw-lang-en">{lang.label}</span>
                </span>
                {isActive && (
                  <span className="tw-lang-check" aria-hidden="true">
                    <Check size={16} strokeWidth={2.5} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="tw-divider" aria-hidden="true" />

      {/* ── Mock / Live Mode Footer ── */}
      <div className="tw-mock-footer" role="note">
        {isMock ? (
          <>
            <span className="tw-mock-badge">MOCK</span>
            <span>Using local sample translations — no API connected yet.</span>
          </>
        ) : (
          <>
            <span className="tw-mock-badge tw-mock-badge--live">LIVE</span>
            <span>Connected to RajBhasha AI translation API.</span>
          </>
        )}
      </div>
    </div>
  );
}
