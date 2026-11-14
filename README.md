# RajBhasha AI (राजभाषा AI) — Frontend Portal

> **Third-Semester Major Project Submission**  
> **Demonstration Prototype:** National Electricity Services Portal (Ministry of Power Demo)  
> **Architecture:** React 19 + Vite 8 SPA communicating with Python FastAPI Translation Backend  

---

## 1. Project Overview

**RajBhasha AI** is an intelligent bilingual localization platform designed to make Indian public sector digital services accessible in India's official language (राजभाषा हिन्दी) alongside English.

To demonstrate real-world efficacy, this repository implements a comprehensive citizen utility interface: the **National Electricity Services Portal** (inspired by Ministry of Power citizen workflows). It features a non-intrusive floating translation widget that dynamically translates live web content into Hindi and instantly restores original English text without page reloads or layout breakage.

### Key Capabilities
* **Dynamic DOM Translation Engine:** Uses browser-native `TreeWalker` algorithms to identify and translate text nodes with concurrency throttling.
* **Instant Reversible Restoration:** Caches original text via `WeakMap` references to enable instantaneous, zero-latency restoration back to English.
* **Dual Execution Modes:**
  * **Live AI Mode:** Sends asynchronous batches to the Python FastAPI backend (`/api/v1/translate`).
  * **Offline Mock Mode:** Standalone demo mode with sample dictionary entries for offline evaluations.
* **Strict Ethical & Security Boundaries:**
  * Mock mode is explicitly disclosed via UI badges and disclaimers; it is **never** presented as real AI inference.
  * API responses are strictly bound as text nodes (`textNode.nodeValue`), completely neutralizing XSS vectors.
  * Form inputs, passwords, and sensitive fields are excluded from translation by design.

---

## 2. Verified Page Translation Features

The translation engine has been thoroughly verified across all five portal views:

| Page | Route | Verified Content Translated |
|---|---|---|
| **Home** | `/` | Hero title, statistics, 24x7 helpline announcements, 6 core electricity service cards, flagship schemes summary, notice board previews, helpline callout. |
| **Schemes** | `/schemes` | National Electricity Schemes, Domestic Subsidy criteria, PM Surya Ghar solar rooftop guidelines, Rural Electrification Mission, 4-step application procedure. |
| **Services** | `/services` | Bill payment & tariff structures, new service connections, grievance registration, consumer charter guarantees. |
| **Notices** | `/notices` | Departmental circulars, statutory deadline reminders, monsoon & agricultural electrical safety guidelines. |
| **Contact** | `/contact` | Department directory, headquarters & ombudsman office hours, multi-channel support details, citizen inquiry form, consumer FAQs. |

---

## 3. Getting Started & Setup Instructions

### Prerequisites
* **Node.js:** v18.0.0 or higher (v20+ recommended)
* **npm:** v9.0.0 or higher
* **Python (optional, for Live Backend):** Python 3.10+ with FastAPI and Uvicorn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your local environment configuration file:
   ```bash
   cp .env.example .env
   ```

---

## 4. Environment Configuration

Configure the application by editing `.env`:

```env
# 1. Translation API Base URL
# Point to your local or hosted FastAPI backend
VITE_API_BASE_URL=http://localhost:8000

# 2. Mock Translation Mode
# Set to 'true' for offline presentation without running the Python backend
# Set to 'false' to connect to the live Python FastAPI translation server
VITE_USE_MOCK_TRANSLATION=true

# 3. Translation Request Timeout (milliseconds)
VITE_TRANSLATION_TIMEOUT_MS=8000

# 4. Multi-Tenant Website Identifier
VITE_DEFAULT_WEBSITE_ID=1
```

---

## 5. Running Frontend & FastAPI Backend Together

To run the complete full-stack project for a live demonstration:

### Terminal 1: Python FastAPI Translation Backend
```bash
# Navigate to the backend directory
cd Backend

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install backend dependencies if not already done
pip install -r requirements.txt

# Start the FastAPI server on port 8000
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
> *Verify backend health at `http://localhost:8000/docs` (Swagger UI).*

### Terminal 2: React Frontend
```bash
# In the Frontend directory
cd Frontend

# Ensure VITE_USE_MOCK_TRANSLATION=false and VITE_API_BASE_URL=http://localhost:8000 in .env
npm run dev
```
> *Open your browser at `http://localhost:5173`.*

---

## 6. Testing, Quality Assurance & Security

### Automated Testing (Vitest & React Testing Library)
Run the automated test suite covering API client success/failure, text restoration, state changes, and component interactions:

```bash
# Run all automated tests
npm run test

# Run linter
npm run lint

# Build production bundle
npm run build
```

### Actual Test Results
* **Unit & Integration Tests:** 33 passed (100% pass rate) across 2 test suites.
* **Code Linting:** 0 errors, 0 warnings (Oxlint).
* **Production Build:** Vite bundle generated in ~150ms without warnings.

### Security Guarantees
1. **Prevention of Sensitive Input Translation:**
   * Form inputs (`<input>`, `<textarea>`, `<select>`) have no child text nodes in the DOM tree.
   * `TreeWalker` explicitly rejects elements with `type="password"`, `type="hidden"`, `data-sensitive`, or `data-no-translate`.
   * Citizen numbers, Aadhaar placeholders, and user messages in the Contact form are never transmitted to external APIs.
2. **XSS & Executable HTML Immunity:**
   * Translations are injected strictly using `textNode.nodeValue = translatedText`.
   * Even if a compromised backend or malicious prompt returns `<script>alert(1)</script>`, the browser renders it harmlessly as literal text characters. No DOM nodes are created or executed.

### Behavioral Resilience
* **When FastAPI Backend is Unavailable:**
  * In live mode (`VITE_USE_MOCK_TRANSLATION=false`), if the backend is down or unreachable, the system displays a clear error status: *"Unable to reach translation server at http://localhost:8000. Please ensure the FastAPI backend is running."*
  * A **Retry** button appears.
  * The frontend **never** silently falls back to mock mode on failure, upholding academic integrity.
* **Honest Mock Mode Presentation:**
  * When `VITE_USE_MOCK_TRANSLATION=true`, the selector panel displays an amber **MOCK** badge with the text: *"Using local sample translations — no API connected yet."*
  * In live mode, it displays a green **LIVE** badge: *"Connected to RajBhasha AI translation API."*

---

## 7. Responsiveness & Accessibility

* **Cross-Device Support:**
  * **Desktop (1200px+):** 3-column service grid, dual-column contact layout, fixed floating widget at bottom-right.
  * **Tablet (768px – 1024px):** 2-column adaptive grids, collapsible info cards.
  * **Mobile (< 768px):** Hamburger menu navigation, full-width touch targets (minimum 44×44px), repositioned floating action button.
* **Accessibility (WCAG 2.1 AA Standards):**
  * Keyboard navigation: Floating widget and panel toggle via `Enter`/`Space`; panel dismisses on `Escape` key.
  * ARIA attributes: `aria-expanded`, `aria-controls`, `aria-live="polite"` status announcements for screen readers.
  * Semantic HTML: Landmark elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).

---

## 8. Known Limitations (Honest Disclosure)

1. **Sentence Fragmentation Across Nested Formatting:** When sentences contain inline formatting tags (e.g., `<strong>`, `<a>`, `<em>`), each text node is translated individually. While sufficient for demonstration, complex compound grammar can occasionally sound fragmented without holistic DOM node serialization.
2. **Dynamic Lazy Content Latency:** Content added after initial page load is detected via `MutationObserver` with a 350ms debounce. Under rapid UI re-rendering, translations appear with a brief visual delay.
3. **Number & Date Script Normalization:** Numerals and standard Indian date patterns (e.g., `10 Nov 2026`) are intentionally preserved in Latin digits to prevent formatting corruption.
4. **Vocabulary Depth in Mock Mode:** When operating in offline mock mode, strings outside the curated dictionary fallback to formatted bracketed text (`[अनुवाद: Text]`) to clearly signal mock boundaries.

---

## 9. Final College Demonstration Checklist

Use this checklist during the live evaluation:

- [ ] **1. Introduction & Architecture Overview:**
  - Introduce the objective: Bilingual accessibility for Government of India citizen services.
  - Highlight the non-intrusive widget architecture (can be integrated into any existing portal with a single `<script>` or React component).
- [ ] **2. Navigation & Portal Walkthrough (English):**
  - Show the 5 primary routes: Home (`/`), Schemes (`/schemes`), Services (`/services`), Notices (`/notices`), Contact (`/contact`).
  - Demonstrate responsive viewports using browser DevTools (Desktop, iPad, Mobile iPhone).
- [ ] **3. English → Hindi Translation Demonstration:**
  - Click the floating globe widget (bottom-right).
  - Select **हिन्दी (Hindi)**.
  - Observe the progress bar and status indicator (`Translating page…` → `हिन्दी में स्विच किया गया`).
  - Demonstrate translated content across all 5 pages.
- [ ] **4. Instant Reversible Restoration (Hindi → English):**
  - Click the widget and select **English**.
  - Note the instantaneous restoration (< 50ms) without network calls, powered by the internal `WeakMap` cache.
- [ ] **5. Route-Aware Persistence:**
  - Switch to Hindi on Home.
  - Navigate to **Schemes** or **Services**.
  - Show that newly navigated pages automatically translate into Hindi.
- [ ] **6. Mock vs. Live Transparency Demonstration:**
  - Open widget panel; point to the **MOCK** badge and sample disclaimer.
  - Explain the dual-mode configuration in `.env`.
- [ ] **7. Error Handling & Backend Disconnection:**
  - Switch `.env` to live mode (`VITE_USE_MOCK_TRANSLATION=false`) with backend offline.
  - Attempt translation: observe the graceful error alert and **Retry** button without application crashes.
- [ ] **8. Security & Accessibility Proof:**
  - Show that form fields in `/contact` are not translated or corrupted.
  - Demonstrate closing the widget panel with the `Escape` key.
  - Mention automated test suite: 33 tests passing with 0 lint errors.
