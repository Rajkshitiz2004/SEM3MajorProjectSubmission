# RajBhasha AI (राजभाषा AI)
> **AI-Powered Localized Translation Prototype for Government Citizen Portals**  
> *Academic Major Project — Semester 3 Submission*

---

## 📌 Project Overview

**RajBhasha AI** is a real-time, in-place DOM translation system tailored for Indian digital governance portals (demonstrated on the **Ministry of Power - National Electricity Services Portal**). It allows seamless on-the-fly toggling between English and Hindi (`en` ↔ `hi`) directly in the browser while preserving DOM hierarchies, dynamic React state, accessibility attributes, and official government terminologies.

The architecture combines a fast, accurate **Government Glossary Service** for official departments and civic terms with a local machine-learning pipeline powered by `@huggingface/transformers` (`opus-mt-en-hi`) for arbitrary text translation.

---

## 🏛️ Key Features

- **In-Place DOM Text Translation**: Walks the DOM using `TreeWalker` to translate visible text nodes without corrupting event listeners or re-rendering entire components.
- **Official Terminology Glossary**: Instant, standardized translations for official government terms (e.g. *Ministry of Power*, *PM Surya Ghar*, *DISCOM*, *Tariff*).
- **On-Device / Local AI Model**: Integrates Hugging Face Transformers (`Xenova/opus-mt-en-hi`) for automatic neural machine translation with local memory caching.
- **Infinite Loop & Mutation Guard**: Custom `MutationObserver` filtering prevents recursive re-translations caused by widget DOM changes.
- **Fail-Safe & Restoration**: One-click restore to original English text using a zero-overhead `WeakMap` cache without requiring network requests.
- **RESTful Architecture**: Secure Node.js & Express backend with PostgreSQL/Prisma ORM for managing multi-tenant websites, translation reviews, and audit trails.

---

## 📂 Project Directory Structure

```text
SEM3MajorProjectSubmission/
├── Backend/                      # Node.js + Express + Prisma API
│   ├── prisma/                   # Prisma schema (PostgreSQL models)
│   ├── src/
│   │   ├── config/               # Prisma client and environment setups
│   │   ├── controllers/          # Translation, auth, and website controllers
│   │   ├── middleware/           # JWT authentication middleware
│   │   ├── routes/               # Express route declarations
│   │   ├── services/             # AI service (Transformers) & Glossary service
│   │   └── app.js                # Express app entrypoint & CORS setup
│   ├── .env.example              # Example environment configuration for Backend
│   └── package.json
│
├── Frontend/                     # Vite + React Portal Demonstration
│   ├── src/
│   │   ├── components/           # Navbar, Header, Hero, LanguageSelector, TranslationWidget
│   │   ├── data/                 # Language options and mock translation dictionaries
│   │   ├── hooks/                # usePageTranslation, useTranslation
│   │   ├── pages/                # Home, Schemes, Services, Notices, Contact
│   │   ├── services/             # translationApi.js, mockTranslationApi.js
│   │   ├── styles/               # CSS styles for portal and floating widget
│   │   ├── tests/                # Vitest suite (33 unit & integration tests)
│   │   └── utils/                # domTranslator.js (TreeWalker, WeakMap, Semaphore)
│   ├── .env.example              # Example environment configuration for Frontend
│   └── package.json
│
├── .gitignore                    # Project-level git ignore rules
├── .env.example                  # Root environment template
└── README.md                     # Project documentation
```

---

## ⚙️ Prerequisites

- **Node.js**: `v18.0.0` or higher (`v20+` recommended)
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: (Optional for basic translation demo, required for full auth & website management)

---

## 🚀 Quick Start & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Rajkshitiz2004/SEM3MajorProjectSubmission.git
cd SEM3MajorProjectSubmission
```

### 2. Backend Setup
1. Open a terminal in the `Backend` directory:
   ```bash
   cd Backend
   npm install
   ```

2. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   > **Note on macOS**: Port `5001` is configured by default because port `5000` is reserved by macOS AirPlay / ControlCenter.

3. (Optional) Run Prisma migrations if connecting to PostgreSQL:
   ```bash
   npx prisma db push
   ```

4. Start the backend server:
   ```bash
   npm start
   # or with auto-reload:
   npm run dev
   ```
   The backend will be live at `http://localhost:5001`.

---

### 3. Frontend Setup
1. Open a new terminal in the `Frontend` directory:
   ```bash
   cd Frontend
   npm install
   ```

2. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Ensure `Frontend/.env` has:
   ```env
   VITE_API_BASE_URL=http://localhost:5001
   VITE_USE_MOCK_TRANSLATION=false
   VITE_TRANSLATION_TIMEOUT_MS=15000
   VITE_DEFAULT_WEBSITE_ID=1
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🧪 Testing

To run the complete automated test suite (DOM walker tests, widget unit tests, and API contract mocks):

```bash
cd Frontend
npm test
```

Expected result:
```text
✓ src/tests/TranslationWidget.test.jsx (15 tests)
✓ src/tests/translationApi.test.js (18 tests)
Test Files  2 passed (2)
Tests       33 passed (33)
```

---

## 🔌 API Reference (Translation Contract)

### Public Translation Endpoint
- **URL**: `POST /api/v1/translate`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "website_id": 1,
    "text": "Ministry of Power",
    "source_language": "en",
    "target_language": "hi"
  }
  ```
- **Response**:
  ```json
  {
    "website_id": 1,
    "original_text": "Ministry of Power",
    "translated_text": "विद्युत मंत्रालय",
    "source_language": "en",
    "target_language": "hi",
    "status": "machine"
  }
  ```

---

## 🛡️ License

Academic Project Demonstration — Developed for Semester 3 Major Project Submission.
