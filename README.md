# RajBhasha AI — English-to-Hindi Government Website Translator

> **Academic Demonstration Project — Third Semester College Project**
> This is **not** an official government website. All content is fictional and used solely for demonstrating translation functionality.

---

## 📋 Project Overview

**RajBhasha AI** is a full-stack web application that demonstrates English-to-Hindi translation on a realistic Indian government-style electricity services portal.

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8, React Router v7, Lucide React icons |
| Translation Widget | Vanilla JS DOM walker + React hooks |
| Backend (separate repo / folder) | Python FastAPI + AI translation engine |
| Testing | Vitest 4, React Testing Library, jsdom |
| Linting | oxlint |

---

## 👥 Team Members & Responsibilities

| Member | Prompts | Deliverables |
|--------|---------|-------------|
| Member 1 | Prompt 1 & 4 | Website layout, navigation, government pages (Schemes, Services, Notices, Contact) |
| Member 2 | Prompt 2 & 5 | Translation widget UI, language selector, page-level DOM translation |
| **Member 3 (you)** | **Prompt 3 & 6** | **API client, final integration, automated tests, documentation** |

---

## 🗂️ Project Structure

```
SEM3MajorProjectSubmission-main/
├── src/
│   ├── components/
│   │   ├── Header.jsx            # Top government information bar
│   │   ├── Navbar.jsx            # Responsive navigation
│   │   ├── Footer.jsx            # Government-style footer
│   │   ├── Hero.jsx              # Homepage hero section
│   │   ├── ServiceCard.jsx       # Reusable service card
│   │   ├── TranslationWidget.jsx # Floating language-switcher FAB
│   │   └── LanguageSelector.jsx  # Language options panel
│   ├── pages/
│   │   ├── Home.jsx              # Homepage with services grid
│   │   ├── Schemes.jsx           # Government schemes page
│   │   ├── Services.jsx          # Electricity services page
│   │   ├── Notices.jsx           # Circulars & public notices
│   │   └── Contact.jsx           # Contact & FAQ page
│   ├── hooks/
│   │   ├── useTranslation.js     # Translation state + API health check
│   │   └── usePageTranslation.js # DOM translation + MutationObserver
│   ├── services/
│   │   ├── translationApi.js     # Real FastAPI client (fetch-based)
│   │   └── mockTranslationApi.js # In-memory mock adapter for dev/test
│   ├── utils/
│   │   └── domTranslator.js      # TreeWalker-based safe DOM translator
│   ├── data/
│   │   ├── governmentContent.js  # Static page content arrays
│   │   └── mockTranslations.js   # Mock Hindi dictionary & language config
│   ├── styles/
│   │   ├── global.css            # Site-wide styles
│   │   └── translation-widget.css # Widget styles
│   ├── tests/
│   │   ├── setup.js                   # Vitest + jest-dom setup
│   │   ├── translationApi.test.js     # API client unit tests (40+ cases)
│   │   ├── TranslationWidget.test.jsx # Widget UI tests (24 cases)
│   │   └── domTranslator.test.js      # DOM translator unit tests (20 cases)
│   ├── App.jsx
│   └── main.jsx
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── vite.config.js
├── .env.example                  # Environment variable template
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- *(Optional for live translation)* Python ≥ 3.10 and the FastAPI backend

### 1. Clone & install

```bash
git clone <your-repo-url>
cd SEM3MajorProjectSubmission-main
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env as needed (see Environment Configuration section below)
```

### 3. Run the frontend (development mode)

```bash
npm run dev
# → http://localhost:5173
```

### 4. Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## 🌐 API Contract

The frontend communicates with the FastAPI backend over a single endpoint:

### `POST /api/v1/translate`

**Request body:**
```json
{
  "website_id": 1,
  "text": "Apply for electricity subsidy",
  "source_language": "en",
  "target_language": "hi"
}
```

**Success response (200):**
```json
{
  "original_text": "Apply for electricity subsidy",
  "translated_text": "बिजली सब्सिडी के लिए आवेदन करें",
  "source_language": "en",
  "target_language": "hi",
  "status": "machine"
}
```

**Error response (4xx / 5xx):**
```json
{
  "detail": "Human-readable error description"
}
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` and set the values:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL of the FastAPI backend | `http://localhost:8000` |
| `VITE_USE_MOCK_TRANSLATION` | Set `true` to use the in-memory mock dictionary instead of the real API | `false` |
| `VITE_TRANSLATION_TIMEOUT_MS` | Request timeout in milliseconds (default: 8000) | `8000` |
| `VITE_DEFAULT_WEBSITE_ID` | Website identifier forwarded to the backend | `1` |

> **Important:** Never set `VITE_USE_MOCK_TRANSLATION=true` in a live demo — mock translations use a limited dictionary and must never be presented as real AI translation.

---

## 🐍 Running the FastAPI Backend

The Python backend lives in the `backend/` folder (separate from this frontend). To run it:

```bash
# From the project root
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Then set `VITE_API_BASE_URL=http://localhost:8000` in your `.env` and restart `npm run dev`.

### Running Frontend + Backend Together

Open **two terminals**:

| Terminal 1 — Backend | Terminal 2 — Frontend |
|----------------------|----------------------|
| `cd backend && uvicorn app.main:app --reload` | `cd SEM3MajorProjectSubmission-main && npm run dev` |

The widget will automatically detect the backend at `http://localhost:8000` and use live translation.

---

## 🧪 Testing

### Run all tests (single pass)

```bash
npm run test:run
```

### Run tests in watch mode (during development)

```bash
npm test
```

### Run tests with coverage report

```bash
npm run test:coverage
```

Coverage is collected for `src/services/`, `src/hooks/`, `src/utils/`, and `src/components/`.

### Run linter

```bash
npm run lint
```

### Test file overview

| Test File | What It Covers |
|-----------|---------------|
| `translationApi.test.js` | `translateText()` — input validation, successful calls, HTTP errors, malformed responses, network failures, AbortSignal cancellation, mock mode |
| `TranslationWidget.test.jsx` | FAB rendering & ARIA attributes, panel open/close, language options, loading state, mock/live badge, progress bar, retry button |
| `domTranslator.test.js` | `collectTextNodes()` skip rules, `newGeneration()`, `translateDom()` success/error/abort/progress, `restoreDom()` |

---

## ✅ Manual Testing Checklist

Work through these on `http://localhost:5173` before the college demo:

### Translation Widget
- [ ] Floating button (FAB) appears in the bottom-right corner on all pages
- [ ] Clicking the FAB opens the language selector panel
- [ ] Pressing **Escape** closes the panel
- [ ] Clicking outside the panel closes it

### English → Hindi Translation
- [ ] Select **Hindi** in the panel — page content translates
- [ ] Progress bar appears during translation
- [ ] Status message changes from "Translating…" to "हिन्दी में स्विच किया गया"
- [ ] Widget controls (FAB label, panel text) are **not** translated

### Hindi → English Restoration
- [ ] Select **English** in the panel — original English text is fully restored
- [ ] No garbled or missing text after switching back

### Navigation (Multi-Page)
- [ ] Translate on **Home** page, then navigate to **Schemes** — translation re-applies automatically
- [ ] Repeat for **Services**, **Notices**, **Contact** pages

### Error Handling
- [ ] Stop the FastAPI backend (`Ctrl+C`) — widget shows an error message
- [ ] Retry button appears when translation fails partially
- [ ] Clicking **Retry** re-attempts failed segments

### Mock Mode
- [ ] Set `VITE_USE_MOCK_TRANSLATION=true` — widget shows **MOCK** badge (not LIVE)
- [ ] Translation works offline using the sample dictionary

### Responsiveness
- [ ] Mobile (375 px) — widget does not overflow; panel is usable
- [ ] Tablet (768 px) — layout adjusts correctly
- [ ] Desktop (1280 px+) — full layout displayed

### Accessibility
- [ ] Tab through the page — widget FAB is reachable via keyboard
- [ ] FAB `aria-expanded` changes between `true` / `false`
- [ ] Progress bar has `role="progressbar"` with `aria-valuenow`
- [ ] Screen reader announces status changes (status bar has `aria-live="polite"`)

### Security
- [ ] Form fields (name, email, message on Contact page) are **not** translated
- [ ] API responses cannot inject executable HTML (text nodes are written to `nodeValue`, not `innerHTML`)

---

## 🔒 Sensitive Input Protection

The `domTranslator.js` skips the following elements entirely, so their values are **never sent to the translation API**:

- `<input>`, `<textarea>`, `<select>`, `<option>`
- `<script>`, `<style>`, `<code>`, `<pre>`
- Any element with `contenteditable="true"`
- Any element (or its subtree) with `data-no-translate`
- The translation widget itself (identified by `.tw-fab`, `.tw-panel`, `#tw-language-panel`)

---

## 📝 Notes for the College Demo

1. **Start the FastAPI backend first**, then start the frontend.
2. If the backend is unavailable, enable mock mode (`VITE_USE_MOCK_TRANSLATION=true`) for a local demo.
3. All page content is **fictional** — do not present it as real government information.
4. The project is labelled "College Project Demonstration — Not an Official Government Website" in the site header.

---

## 📄 License

This project is submitted as part of the **Third Semester Major Project** (Academic Year 2026–27) and is intended for educational purposes only.
