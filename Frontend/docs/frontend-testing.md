# RajBhasha AI — Frontend Testing & Quality Assurance Report

## 1. Overview & Testing Philosophy

The **RajBhasha AI** frontend is an interactive bilingual portal for public sector digital services (demonstrated via the National Electricity Services Portal prototype). The testing suite verifies:
1. **API Client Integrity:** Robust interaction with the FastAPI backend endpoint (`POST /api/v1/translate`), error resilience, timeouts, and user-initiated cancellations.
2. **DOM Translation & Reversible Restoration:** Bi-directional translation (English ↔ Hindi) across the document tree using `TreeWalker` and `WeakMap` cache without page reloading.
3. **Security & Input Protection:** Complete immunity to XSS/HTML injection and zero leakage or translation of sensitive user inputs, form fields, and credentials.
4. **Transparent Mode Isolation:** Strict boundary between Live AI translation mode and offline mock mode, ensuring mock results are never misrepresented as live AI inference.
5. **Accessibility & Responsive Usability:** Full keyboard navigation (Escape, focus traps, ARIA attributes), semantic HTML markup, and cross-device responsiveness.

---

## 2. Test Architecture & Tooling

| Layer | Tool | Purpose |
|---|---|---|
| **Test Runner** | [Vitest](https://vitest.dev/) v4.1.x | Fast ESM-native unit & integration test runner |
| **DOM Environment** | [jsdom](https://github.com/jsdom/jsdom) | Headless browser DOM emulation |
| **Component Testing** | [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | User-centric React 19 component testing |
| **User Events** | `@testing-library/user-event` | High-fidelity keyboard, click, and focus simulation |
| **DOM Matchers** | `@testing-library/jest-dom` | Declarative DOM assertions (`toBeInTheDocument`, `toBeDisabled`) |
| **Static Analysis** | [Oxlint](https://oxc.rs/) | Rust-powered linter for React hooks and AST rules |

---

## 3. Test Suites & Coverage Breakdown

### Suite 1: `src/tests/translationApi.test.js` (18 Tests)

* **Configuration & Environment Helpers:**
  * Normalization of base URL (`http://localhost:8000///` → `http://localhost:8000`).
  * Default fallback behavior when `VITE_API_BASE_URL` is omitted.
  * Explicit parsing of `VITE_USE_MOCK_TRANSLATION` boolean flags.
  * Correct parsing of custom or default timeouts (`VITE_TRANSLATION_TIMEOUT_MS`).
* **Input Validation & Guard Clauses:**
  * Rejection of empty strings, whitespace-only, and non-string inputs.
  * Descriptive configuration error when `VITE_API_BASE_URL` is absent in live mode.
* **FastAPI Backend Integration (Live Mode):**
  * Accurate transmission of POST body (`website_id`, `text`, `source_language`, `target_language`).
  * Proper deserialization of API response contracts (`original_text`, `translated_text`, `status`, `isMock: false`).
  * Handling HTTP error statuses (422, 500, 503) with structured error extraction.
  * **Network Resilience:** Throws explicit network error when FastAPI backend is offline or unreachable without silent mock fallback.
  * Request abortion via `AbortController` signal when user initiates cancellation.
  * Automatic cancellation upon exceeding timeout threshold (`timeoutMs`).
* **Mock Translation Adapter:**
  * Fast sample translation lookup with explicit `isMock: true` flag.
  * Fallback bracket formatting (`[अनुवाद: ...]`) for unmapped test tokens.
  * Reverse lookup support (Hindi to English).
* **DOM Translation, Unicode Handling & Security:**
  * `TreeWalker` node collection correctly filters out scripts, styles, codes, and inputs.
  * **Unicode Fix Verification:** Accurate regex matching (`RE_PUNCT_ONLY`) using Unicode property escapes (`\p{P}\p{S}`), guaranteeing Devanagari script characters are never misclassified as punctuation.
  * Complete text restoration back to pristine English state via `restoreDom`.
  * **XSS Defense:** Malicious payloads containing `<script>` or `<img onerror=...>` injected into translation responses are safely set as `textNode.nodeValue` plain text and never executed as HTML.
  * **Sensitive Input Protection:** Bypasses elements with `data-sensitive`, `type="password"`, `type="hidden"`, or `.sensitive-field`.

### Suite 2: `src/tests/TranslationWidget.test.jsx` (15 Tests)

* **FAB Floating Action Button & Semantics:**
  * Initial render with English label, ISO badge (`EN`), and accessibility attributes (`aria-expanded="false"`, `aria-controls="tw-language-panel"`).
  * Panel toggling upon user click, dynamically updating `aria-expanded="true"`.
* **LanguageSelector Modal & Keyboard Accessibility:**
  * Closes on `Escape` key press.
  * Closes on close button (`X`) click.
  * Interactive options are properly disabled when `isLoading: true` to prevent race conditions.
* **Mock vs. Live Presentation Transparency:**
  * Prominent amber `MOCK` badge and disclaimer: *"Using local sample translations — no API connected yet."*
  * Green `LIVE` badge when communicating with actual FastAPI backend.
  * Zero deception: Mock mode is never masked as real AI translation.
* **State Machine & Error Display:**
  * State transitions from `idle` → `loading` → `success`.
  * Progress percentage bar and active counter (`done / total`) during page sweeps.
  * Error status bar with clear troubleshooting guidance when communication fails.
* **Full Application Navigation & Smoke Integration:**
  * Verified rendering and semantic HTML on all core routes:
    * **Home (`/`):** Hero section, 24x7 helpline `1912`, service cards, announcements.
    * **Schemes (`/schemes`):** Welfare catalog, eligibility criteria, 4-step application procedure.
    * **Services (`/services`):** Bill information, connections, grievance mechanisms, consumer charter.
    * **Notices (`/notices`):** Circulars, statutory deadlines, electrical safety guidelines.
    * **Contact (`/contact`):** Department directory, office hours, feedback inquiry form.

---

## 4. Actual Automated Test Results

The automated test suite was executed against the production build environment. Results below are actual runtime measurements:

```bash
$ npm run test

> rajbhasha-ai@0.0.0 test
> vitest run

 RUN  v4.1.12 /Users/uditbhandari/Desktop/SEM3MajorProjectSubmission/Frontend

 ✓ src/tests/TranslationWidget.test.jsx (15 tests) 640ms
   ✓ FAB Rendering & Accessibility (2)
   ✓ LanguageSelector Panel Keyboard & Dialog Behavior (3)
   ✓ Honest Mock Mode Presentation vs Live Mode (2)
   ✓ Translation State Transitions & Error Messages (3)
   ✓ Full Application Page Integration & Navigation Smoke Tests (5)

 ✓ src/tests/translationApi.test.js (18 tests) 1806ms
   ✓ Configuration & Environment Helpers (4)
   ✓ Input Validation (2)
   ✓ FastAPI Backend Integration (Live Mode) (5)
   ✓ Mock Translation Mode (VITE_USE_MOCK_TRANSLATION=true) (3)
   ✓ DOM Translation & Text Restoration (domTranslator.js) (4)

 Test Files  2 passed (2)
      Tests  33 passed (33)
   Duration  2.32s
```

### Static Analysis & Linter Verification

```bash
$ npm run lint

> rajbhasha-ai@0.0.0 lint
> oxlint

Found 0 warnings and 0 errors.
Finished in 23ms on 25 files with 104 rules using 10 threads.
```

### Production Build Verification

```bash
$ npm run build

> rajbhasha-ai@0.0.0 build
> vite build

vite v8.3.8 building client environment for production...
✓ 2109 modules transformed.
rendering chunks (1)...computing gzip size...
dist/index.html                   0.65 kB │ gzip:   0.37 kB
dist/assets/index-Lkul2iNn.css   32.84 kB │ gzip:   6.29 kB
dist/assets/index-NPL7BMQq.js   338.99 kB │ gzip: 104.94 kB
✓ built in 154ms
```

---

## 5. Security & Vulnerability Analysis

| Vulnerability Vector | Risk | Mitigation in RajBhasha AI |
|---|---|---|
| **Stored/Reflected XSS** | Malicious text in translation API response contains `<script>` or event handlers. | `domTranslator.js` uses `textNode.nodeValue = ...`. The DOM engine never parses node values through HTML tokenizer; tags render as literal strings. Verified in unit tests. |
| **Credential & Sensitive Input Leakage** | Passwords, OTPs, or consumer identifiers sent to translation backend. | `TreeWalker` is scoped strictly to `NodeFilter.SHOW_TEXT`. `<input>`, `<textarea>`, and `<select>` nodes have no child text nodes. Ancestor filter immediately skips elements with `type="password"`, `type="hidden"`, `data-sensitive`, or `data-no-translate`. |
| **Stale Async Overwrite** | User rapidly toggles between EN and HI; slow requests land out of order. | Generation counter (`newGeneration()`) discards in-flight requests that do not match the current active generation timestamp. |
| **Silent Mock Deception** | Backend fails, causing app to silently switch to mock mode and present canned text as AI. | Strict architectural separation: network failures in live mode explicitly throw network errors. Mock mode is exclusively activated via explicit `.env` configuration (`VITE_USE_MOCK_TRANSLATION=true`). |

---

## 6. Manual Testing & Demonstration Protocols

### Protocol A: Responsive Breakpoints Check
* **Desktop (1280px+):** Full 3-column service grid, 4-column footer, dual-column contact layout, fixed floating widget at bottom-right (`bottom: 1.75rem, right: 1.75rem`).
* **Tablet (768px – 1024px):** 2-column service grid, responsive cards, 2-column footer.
* **Mobile (< 768px):** Hamburger menu activates, single-column stacked grids, floating widget repositions to bottom margin with touch-friendly targets (minimum 44x44px).

### Protocol B: Backend Offline Simulation
1. Set `VITE_USE_MOCK_TRANSLATION=false` and `VITE_API_BASE_URL=http://localhost:8000` in `.env`.
2. Stop the FastAPI backend (`kill` or do not launch).
3. Open the portal, click the Translation Widget, and select **हिन्दी**.
4. **Expected Result:**
   * Spinner appears briefly.
   * Status bar displays: *"Unable to reach translation server at http://localhost:8000. Please ensure the FastAPI backend is running."*
   * A floating retry button appears: `Retry (N failed)`.
   * Existing English text remains completely readable without layout shift.
   * MOCK label is **NOT** displayed (retaining transparency).

### Protocol C: Live AI Translation with FastAPI
1. Start FastAPI backend (`uvicorn main:app --reload --port 8000`).
2. Verify CORS headers include `http://localhost:5173`.
3. Select **हिन्दी** in widget.
4. **Expected Result:** Progress bar animates; text nodes across Home, Schemes, Services, Notices, and Contact transform to Hindi; Live badge displays in widget footer.
5. Select **English**.
6. **Expected Result:** Instant DOM restoration back to original English text without network requests.

