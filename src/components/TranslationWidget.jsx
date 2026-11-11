import React, { useState, useCallback } from 'react';
import { Languages } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { DEFAULT_LANGUAGE, getLanguageByCode, mockTranslate } from '../data/mockTranslations';
import '../styles/translation-widget.css';

/**
 * TranslationWidget
 * ─────────────────
 * A floating FAB (Floating Action Button) that opens a compact language
 * selector panel. Manages translation state using local mock data.
 *
 * Translation state shape (ready for real API swap):
 * {
 *   selectedLang : string,           // ISO code, e.g. 'en' | 'hi'
 *   status       : 'idle' | 'loading' | 'success' | 'error',
 *   statusMsg    : string,
 *   isLoading    : boolean,
 *   lastTranslated: string | null,   // last translated text (demo only)
 *   isMock       : boolean,
 * }
 *
 * To wire up a real API later:
 *   Replace the `mockTranslate(...)` call inside `handleLanguageSelect`
 *   with your actual API fetch. The state shape stays identical.
 */
export default function TranslationWidget() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [translationState, setTranslationState] = useState({
    selectedLang: DEFAULT_LANGUAGE,
    status: 'idle',
    statusMsg: 'Choose a language below',
    isLoading: false,
    lastTranslated: null,
    isMock: true,
  });

  const selectedLangMeta = getLanguageByCode(translationState.selectedLang);

  /* ── Open / Close Panel ── */
  const openPanel = () => setIsPanelOpen(true);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);

  /* ── Language Selection Handler ── */
  const handleLanguageSelect = useCallback(
    async (code) => {
      // No-op if same language is re-selected
      if (code === translationState.selectedLang) {
        closePanel();
        return;
      }

      // Set loading state immediately
      setTranslationState((prev) => ({
        ...prev,
        status: 'loading',
        statusMsg: 'Translating…',
        isLoading: true,
      }));

      try {
        // Demo: translate a sample phrase to verify mock works
        const sampleText = 'National Electricity Services Portal';
        const result = await mockTranslate(sampleText, code);

        setTranslationState({
          selectedLang: code,
          status: 'success',
          statusMsg:
            code === 'en'
              ? 'Switched to English'
              : 'हिन्दी में स्विच किया गया',
          isLoading: false,
          lastTranslated: result.translatedText,
          isMock: result.isMock,
        });

        // Reset to idle after a short display window
        setTimeout(() => {
          setTranslationState((prev) => ({
            ...prev,
            status: 'idle',
            statusMsg: 'Choose a language below',
          }));
        }, 2200);
      } catch {
        setTranslationState((prev) => ({
          ...prev,
          status: 'error',
          statusMsg: 'Translation failed. Please try again.',
          isLoading: false,
        }));

        // Auto-clear error after 3 s
        setTimeout(() => {
          setTranslationState((prev) => ({
            ...prev,
            status: 'idle',
            statusMsg: 'Choose a language below',
          }));
        }, 3000);
      }
    },
    [translationState.selectedLang, closePanel]
  );

  return (
    <>
      {/* ── Floating Action Button ── */}
      <button
        type="button"
        className={`tw-fab${translationState.selectedLang === 'hi' ? ' lang-hi' : ''}`}
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
          {translationState.selectedLang.toUpperCase()}
        </span>
      </button>

      {/* ── Language Selector Panel (portal-like fixed positioning) ── */}
      {isPanelOpen && (
        <div id="tw-language-panel">
          <LanguageSelector
            selectedLang={translationState.selectedLang}
            onSelect={handleLanguageSelect}
            onClose={closePanel}
            isLoading={translationState.isLoading}
            status={translationState.status}
            statusMsg={translationState.statusMsg}
          />
        </div>
      )}
    </>
  );
}

