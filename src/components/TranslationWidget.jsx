import React, { useState, useCallback } from 'react';
import { Languages } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { DEFAULT_LANGUAGE, getLanguageByCode } from '../data/mockTranslations';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/translation-widget.css';

/**
 * TranslationWidget
 * ─────────────────
 * A floating FAB (Floating Action Button) that opens a compact language
 * selector panel. Connects to backend translation API (or mock adapter)
 * using the custom useTranslation hook.
 */
export default function TranslationWidget() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const {
    selectedLang,
    status,
    statusMsg,
    isLoading,
    isMock,
    translate,
  } = useTranslation({
    initialLanguage: DEFAULT_LANGUAGE,
    websiteId: Number(import.meta.env.VITE_DEFAULT_WEBSITE_ID) || 1,
  });

  const selectedLangMeta = getLanguageByCode(selectedLang);

  /* ── Open / Close Panel ── */
  const openPanel = () => setIsPanelOpen(true);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);

  /* ── Language Selection Handler ── */
  const handleLanguageSelect = useCallback(
    async (code) => {
      // No-op if same language is re-selected
      if (code === selectedLang) {
        closePanel();
        return;
      }

      try {
        // Sample portal phrase to trigger translation
        const sampleText = 'National Electricity Services Portal';
        await translate(sampleText, code);
      } catch (err) {
        // Error state and auto-reset are handled within useTranslation hook
        console.error('Translation error:', err);
      }
    },
    [selectedLang, closePanel, translate]
  );

  return (
    <>
      {/* ── Floating Action Button ── */}
      <button
        type="button"
        className={`tw-fab${selectedLang === 'hi' ? ' lang-hi' : ''}`}
        onClick={() => (isPanelOpen ? closePanel() : openPanel())}
        aria-label={`Language: ${selectedLangMeta.label}. Click to change language.`}
        aria-expanded={isPanelOpen}
        aria-controls="tw-language-panel"
        title="Change website language"
      >
        <span className="tw-fab-globe" aria-hidden="true">
          <Languages size={18} />
        </span>
        <span>{selectedLangMeta.nativeLabel}</span>
        <span className="tw-fab-lang" aria-hidden="true">
          {selectedLang.toUpperCase()}
        </span>
      </button>

      {/* ── Language Selector Panel (portal-like fixed positioning) ── */}
      {isPanelOpen && (
        <div id="tw-language-panel">
          <LanguageSelector
            selectedLang={selectedLang}
            onSelect={handleLanguageSelect}
            onClose={closePanel}
            isLoading={isLoading}
            status={status}
            statusMsg={statusMsg}
            isMock={isMock}
          />
        </div>
      )}
    </>
  );
}
