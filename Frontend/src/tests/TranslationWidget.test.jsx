/**
 * TranslationWidget.test.jsx
 * UI and Integration tests for the TranslationWidget component,
 * LanguageSelector panel, state transitions, keyboard accessibility,
 * loading indicators, error reporting, and mock mode indicators.
 */
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import TranslationWidget from '../components/TranslationWidget';
import LanguageSelector from '../components/LanguageSelector';
import App from '../App';

describe('TranslationWidget Component', () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    import.meta.env.VITE_USE_MOCK_TRANSLATION = 'true';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    Object.assign(import.meta.env, originalEnv);
  });

  describe('FAB Rendering & Accessibility', () => {
    it('renders the floating action button with initial English state and aria attributes', () => {
      render(
        <BrowserRouter>
          <TranslationWidget />
        </BrowserRouter>
      );

      const fab = screen.getByRole('button', { name: /Language: English/i });
      expect(fab).toBeInTheDocument();
      expect(fab).toHaveAttribute('aria-expanded', 'false');
      expect(fab).toHaveAttribute('aria-controls', 'tw-language-panel');
      expect(fab).toHaveAttribute('data-no-translate');
      expect(within(fab).getByText('EN')).toBeInTheDocument();
    });

    it('opens language panel upon clicking FAB and updates aria-expanded', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <TranslationWidget />
        </BrowserRouter>
      );

      const fab = screen.getByRole('button', { name: /Language: English/i });
      await user.click(fab);

      expect(fab).toHaveAttribute('aria-expanded', 'true');
      const dialog = screen.getByRole('dialog', { name: /Language selection panel/i });
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByText(/Select Language/i)).toBeInTheDocument();
    });
  });

  describe('LanguageSelector Panel Keyboard & Dialog Behavior', () => {
    it('closes the panel when pressing Escape', async () => {
      const onCloseMock = vi.fn();
      render(
        <LanguageSelector
          selectedLang="en"
          onSelect={vi.fn()}
          onClose={onCloseMock}
          isLoading={false}
          status="idle"
          statusMsg="Choose a language below"
          isMock={true}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('closes the panel when clicking the close button', async () => {
      const onCloseMock = vi.fn();
      const user = userEvent.setup();
      render(
        <LanguageSelector
          selectedLang="en"
          onSelect={vi.fn()}
          onClose={onCloseMock}
          isLoading={false}
          status="idle"
          statusMsg="Choose a language below"
          isMock={true}
        />
      );

      const closeBtn = screen.getByRole('button', { name: /Close language selector/i });
      await user.click(closeBtn);
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('disables language option buttons while isLoading is true', () => {
      render(
        <LanguageSelector
          selectedLang="en"
          onSelect={vi.fn()}
          onClose={vi.fn()}
          isLoading={true}
          status="loading"
          statusMsg="Translating page…"
          isMock={true}
        />
      );

      const hindiBtn = screen.getByRole('button', { name: /Hindi — हिन्दी/i });
      expect(hindiBtn).toBeDisabled();
    });
  });

  describe('Honest Mock Mode Presentation vs Live Mode', () => {
    it('prominently displays MOCK badge and explicit sample translations disclaimer in mock mode', () => {
      render(
        <LanguageSelector
          selectedLang="en"
          onSelect={vi.fn()}
          onClose={vi.fn()}
          isLoading={false}
          status="idle"
          statusMsg="Choose a language below"
          isMock={true}
        />
      );

      expect(screen.getByText('MOCK')).toBeInTheDocument();
      expect(
        screen.getByText(/Using local sample translations — no API connected yet/i)
      ).toBeInTheDocument();
      expect(screen.queryByText('LIVE')).not.toBeInTheDocument();
    });

    it('displays LIVE badge when real translation API mode is active', () => {
      render(
        <LanguageSelector
          selectedLang="en"
          onSelect={vi.fn()}
          onClose={vi.fn()}
          isLoading={false}
          status="idle"
          statusMsg="Choose a language below"
          isMock={false}
        />
      );

      expect(screen.getByText('LIVE')).toBeInTheDocument();
      expect(
        screen.getByText(/Connected to RajBhasha AI translation API/i)
      ).toBeInTheDocument();
      expect(screen.queryByText('MOCK')).not.toBeInTheDocument();
    });
  });

  describe('Translation State Transitions & Error Messages', () => {
    it('switches language from English to Hindi in TranslationWidget', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <div id="content-container">
            <h2>Home</h2>
            <p>Schemes</p>
          </div>
          <TranslationWidget />
        </BrowserRouter>
      );

      const fab = screen.getByRole('button', { name: /Language: English/i });
      await user.click(fab);

      const hindiBtn = screen.getByRole('button', { name: /Hindi — हिन्दी/i });
      await user.click(hindiBtn);

      // Status updates to success in panel
      await waitFor(() => {
        expect(screen.getByText('हिन्दी में स्विच किया गया')).toBeInTheDocument();
      }, { timeout: 3000 });

      // FAB updates to Hindi indicator
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Language: Hindi/i })).toBeInTheDocument();
      }, { timeout: 3000 });

      // Panel can be closed via close button
      const closeBtn = screen.getByRole('button', { name: /Close language selector/i });
      await user.click(closeBtn);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders progress bar and status while translating', () => {
      render(
        <LanguageSelector
          selectedLang="hi"
          onSelect={vi.fn()}
          onClose={vi.fn()}
          isLoading={true}
          status="loading"
          statusMsg="Translating page… (5 / 10)"
          isMock={true}
          progress={{ done: 5, total: 10 }}
        />
      );

      expect(screen.getByText('Translating page… (5 / 10)')).toBeInTheDocument();
      expect(screen.getByText('5 / 10')).toBeInTheDocument();
    });

    it('renders error status bar with user-friendly error message when failure occurs', () => {
      render(
        <LanguageSelector
          selectedLang="hi"
          onSelect={vi.fn()}
          onClose={vi.fn()}
          isLoading={false}
          status="error"
          statusMsg="Unable to reach translation server at http://localhost:8000. Please ensure the FastAPI backend is running."
          isMock={false}
        />
      );

      const errorText = screen.getByText(
        /Unable to reach translation server at http:\/\/localhost:8000/i
      );
      expect(errorText).toBeInTheDocument();
    });
  });

  describe('Full Application Page Integration & Navigation Smoke Tests', () => {
    it('renders Home page with semantic navigation and headers', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      expect(
        screen.getByRole('heading', { name: /National Electricity Services Portal/i, level: 1 })
      ).toBeInTheDocument();
      expect(screen.getAllByText(/1912/i).length).toBeGreaterThan(0);
    });

    it('navigates to Schemes page with correct content', () => {
      render(
        <MemoryRouter initialEntries={['/schemes']}>
          <App />
        </MemoryRouter>
      );

      expect(
        screen.getByRole('heading', { name: /National Electricity Schemes & Subsidies/i, level: 1 })
      ).toBeInTheDocument();
    });

    it('navigates to Services page with correct content', () => {
      render(
        <MemoryRouter initialEntries={['/services']}>
          <App />
        </MemoryRouter>
      );

      expect(
        screen.getByRole('heading', { name: /Public Electricity Services Portal/i, level: 1 })
      ).toBeInTheDocument();
    });

    it('navigates to Notices page with correct content', () => {
      render(
        <MemoryRouter initialEntries={['/notices']}>
          <App />
        </MemoryRouter>
      );

      expect(
        screen.getByRole('heading', { name: /Public Notices, Deadlines & Safety Guidelines/i, level: 1 })
      ).toBeInTheDocument();
    });

    it('navigates to Contact page and renders inquiry form', () => {
      render(
        <MemoryRouter initialEntries={['/contact']}>
          <App />
        </MemoryRouter>
      );

      expect(
        screen.getByRole('heading', { name: /Department Contact & Grievance Channels/i, level: 1 })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Full Citizen Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Submit Inquiry/i })).toBeInTheDocument();
    });
  });
});
