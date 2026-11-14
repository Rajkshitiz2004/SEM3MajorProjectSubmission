import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Vitest configuration
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.js'],
    include: ['src/tests/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      // Only measure coverage for files that have dedicated unit tests.
      // Page-level UI components (Header, Footer, Hero, Navbar, ServiceCard)
      // are excluded because they are integration-tested manually.
      include: [
        'src/services/translationApi.js',
        'src/hooks/useTranslation.js',
        'src/hooks/usePageTranslation.js',
        'src/utils/domTranslator.js',
        'src/components/TranslationWidget.jsx',
        'src/components/LanguageSelector.jsx',
      ],
      thresholds: {
        lines: 75,
        functions: 70,
        branches: 65,
        statements: 75,
      },
    },
  },
})
