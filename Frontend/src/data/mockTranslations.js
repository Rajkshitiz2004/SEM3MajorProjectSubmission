/**
 * mockTranslations.js
 * Local mock translation dictionary for English → Hindi demo.
 * Structured to mirror what a real translation API response would return,
 * so swapping to a live API later requires only a data-fetch change.
 *
 * Shape: { [languageCode]: { [englishKey]: translatedString } }
 */

export const SUPPORTED_LANGUAGES = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    flag: '🇬🇧',
    dir: 'ltr',
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    flag: '🇮🇳',
    dir: 'ltr',
  },
];

export const DEFAULT_LANGUAGE = 'en';

/**
 * Returns language metadata by code.
 * @param {string} code - ISO language code
 */
export function getLanguageByCode(code) {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) ?? SUPPORTED_LANGUAGES[0];
}

/**
 * Simulates an async translation lookup with a realistic delay.
 * Returns the translated string or falls back to the original text.
 *
 * @param {string} text - English source text key or phrase
 * @param {string} targetLang - Target language code
 * @returns {Promise<{ translatedText: string; sourceLang: string; targetLang: string; isMock: true }>}
 */
export async function mockTranslate(text, targetLang) {
  // Simulate network delay (300–700 ms)
  const delay = 300 + Math.random() * 400;
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (targetLang === 'en') {
    return {
      translatedText: text,
      sourceLang: 'hi',
      targetLang: 'en',
      isMock: true,
    };
  }

  const translation = MOCK_DICTIONARY_HI[text] ?? null;

  return {
    translatedText: translation ?? `[अनुवाद उपलब्ध नहीं: ${text}]`,
    sourceLang: 'en',
    targetLang: 'hi',
    isMock: true,
  };
}

/**
 * Hindi mock translation dictionary.
 * Keys are English UI strings; values are their Hindi equivalents.
 */
export const MOCK_DICTIONARY_HI = {
  // Navigation
  Home: 'होम',
  Schemes: 'योजनाएँ',
  Services: 'सेवाएँ',
  Notices: 'सूचनाएँ',
  Contact: 'संपर्क',

  // Header / Branding
  'National Electricity Services Portal': 'राष्ट्रीय विद्युत सेवा पोर्टल',
  'Ministry of Power': 'विद्युत मंत्रालय',
  'Government of India': 'भारत सरकार',
  'Toll-Free Electricity Helpline': 'टोल-फ्री विद्युत हेल्पलाइन',
  'Centralized Electricity Services & Citizen Redressal — Government of India (Demo)':
    'केंद्रीकृत विद्युत सेवाएँ एवं नागरिक निवारण — भारत सरकार (डेमो)',

  // Hero Section
  'Your Electricity Rights, Online & Accessible':
    'आपके विद्युत अधिकार, ऑनलाइन एवं सुलभ',
  'Manage connections, bills, and complaints through one transparent digital window — available 24×7 for all citizens.':
    'एक पारदर्शी डिजिटल खिड़की के माध्यम से कनेक्शन, बिल और शिकायतें प्रबंधित करें — सभी नागरिकों के लिए 24×7 उपलब्ध।',
  'Apply for Connection': 'कनेक्शन के लिए आवेदन करें',
  'Pay Electricity Bill': 'बिजली बिल भुगतान करें',
  'Report Power Outage': 'बिजली कटौती की सूचना दें',

  // Services
  'New Connection & Load Extension': 'नया कनेक्शन एवं लोड विस्तार',
  'Instant Bill Payment & Tariff Rates': 'तत्काल बिल भुगतान एवं टैरिफ दरें',
  'PM Surya Ghar: Solar Rooftop Subsidy':
    'पीएम सूर्य घर: सौर रूफटॉप सब्सिडी',
  'Feeder Outage & Fault Reporting': 'फीडर आउटेज एवं खराबी रिपोर्टिंग',
  'Smart Prepaid Meter Management': 'स्मार्ट प्रीपेड मीटर प्रबंधन',
  'Consumer Rights & Charter Dispute': 'उपभोक्ता अधिकार एवं चार्टर विवाद',

  // Schemes
  'PM Surya Ghar: Muft Bijli Yojana': 'पीएम सूर्य घर: मुफ्त बिजली योजना',
  'Revamped Distribution Sector Scheme (RDSS)':
    'संशोधित वितरण क्षेत्र योजना (आरडीएसएस)',
  'PM-KUSUM Scheme': 'पीएम-कुसुम योजना',

  // Widget UI strings
  'Select Language': 'भाषा चुनें',
  'Currently selected': 'वर्तमान में चुनी गई',
  'Translation active': 'अनुवाद सक्रिय',
  'Translating…': 'अनुवाद हो रहा है…',
  'Translation failed. Please try again.':
    'अनुवाद विफल। कृपया पुनः प्रयास करें।',
  'Mock mode active — using local sample translations.':
    'मॉक मोड सक्रिय — स्थानीय नमूना अनुवाद उपयोग हो रहे हैं।',
  Close: 'बंद करें',
  'Change Language': 'भाषा बदलें',
};
