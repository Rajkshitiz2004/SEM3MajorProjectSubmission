-- =============================================================================
-- RajBhasha AI — Data Engineering (DE) Major Project
-- Realistic Sample Seed Data Population Script
-- =============================================================================

-- Clear existing data (in dependency order)
TRUNCATE TABLE "TranslationReview", "GlossaryTerm", "Translation", "Website", "User" CASCADE;

-- -----------------------------------------------------------------------------
-- 1. Populate Entity: User
-- -----------------------------------------------------------------------------
INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt") VALUES
('usr-001-admin', 'Rajesh Sharma (Director)', 'admin@powermin.gov.in', '$2b$12$e8xL47Hj4N.9mQqS61cO0uA0vGkWwK2vF7s3N5m9O1vX4.2gL1a5K', 'ADMIN', '2026-10-01 09:00:00'),
('usr-002-reviewer', 'Dr. Meenakshi Verma (Senior Hindi Officer)', 'reviewer@cstt.gov.in', '$2b$12$w3mK89Jn1P.8lPpR52bN9tZ9uFjVvJ1uE6r2M4l8N0uW3.1fK0z4J', 'REVIEWER', '2026-10-02 10:15:00'),
('usr-003-citizen', 'Amit Patel (Citizen Consumer)', 'amit.patel@gmail.com', '$2b$12$p1bN45Lm8K.2xYyT98zP3qX1wAzZzK9uY4t1K2m7N9uT1.8jK9x2L', 'USER', '2026-10-05 14:30:00'),
('usr-004-reviewer2', 'Sunita Rao (Linguist Analyst)', 'sunita.rao@rajbhasha.gov.in', '$2b$12$a7bC12De3F.4gHhI56jK7lM8nOpQrStUvWxYz012345678901234a', 'REVIEWER', '2026-10-06 11:20:00');

-- -----------------------------------------------------------------------------
-- 2. Populate Entity: Website
-- -----------------------------------------------------------------------------
INSERT INTO "Website" ("id", "name", "domain", "userId", "createdAt") VALUES
('web-001-electricity', 'National Electricity Services Portal', 'powermin.gov.in', 'usr-001-admin', '2026-10-10 11:00:00'),
('web-002-solar', 'PM Surya Ghar Muft Bijli Portal', 'pmsuryaghar.gov.in', 'usr-001-admin', '2026-10-12 12:30:00'),
('web-003-discom', 'Delhi State Electricity Regulatory Portal', 'derc.gov.in', 'usr-001-admin', '2026-10-15 15:45:00');

-- -----------------------------------------------------------------------------
-- 3. Populate Entity: GlossaryTerm
-- -----------------------------------------------------------------------------
INSERT INTO "GlossaryTerm" ("id", "englishTerm", "hindiTerm", "websiteId") VALUES
('glo-001', 'Ministry of Power', 'विद्युत मंत्रालय', 'web-001-electricity'),
('glo-002', 'Power Distribution', 'विद्युत वितरण', 'web-001-electricity'),
('glo-003', 'Toll-Free Helpline', 'टोल-फ्री हेल्पलाइन', 'web-001-electricity'),
('glo-004', 'Application Status', 'आवेदन की स्थिति', 'web-001-electricity'),
('glo-005', 'Solar Rooftop Subsidy', 'सौर रूफटॉप सब्सिडी', 'web-002-solar'),
('glo-006', 'Grid Connectivity', 'ग्रिड कनेक्टिविटी', 'web-002-solar'),
('glo-007', 'Tariff Revision', 'टैरिफ पुनरीक्षण', 'web-003-discom');

-- -----------------------------------------------------------------------------
-- 4. Populate Entity: Translation
-- -----------------------------------------------------------------------------
INSERT INTO "Translation" ("id", "sourceText", "translatedText", "sourceLanguage", "targetLanguage", "status", "createdAt", "userId", "websiteId") VALUES
('tra-001', 'Welcome to the National Electricity Services Portal.', 'राष्ट्रीय विद्युत सेवा पोर्टल में आपका स्वागत है।', 'en', 'hi', 'APPROVED', '2026-11-01 08:30:00', 'usr-003-citizen', 'web-001-electricity'),
('tra-002', 'Apply online for new domestic electricity connection.', 'नए घरेलू बिजली कनेक्शन के लिए ऑनलाइन आवेदन करें।', 'en', 'hi', 'APPROVED', '2026-11-01 09:15:00', 'usr-003-citizen', 'web-001-electricity'),
('tra-003', 'Check your smart prepaid meter balance and download previous electricity bills.', 'अपने स्मार्ट प्रीपेड मीटर बैलेंस की जाँच करें और पिछले बिजली बिल डाउनलोड करें।', 'en', 'hi', 'MACHINE', '2026-11-02 11:20:00', 'usr-003-citizen', 'web-001-electricity'),
('tra-004', 'Subsidies under PM Surya Ghar Yojana updated for financial year 2026-27.', 'वित्तीय वर्ष 2026-27 के लिए पीएम सूर्य घर योजना के तहत सब्सिडी अद्यतन की गई।', 'en', 'hi', 'APPROVED', '2026-11-03 14:10:00', 'usr-003-citizen', 'web-002-solar'),
('tra-005', 'Consumer grievance portal operates 24x7 across all states without interruption.', 'उपभोक्ता शिकायत पोर्टल सभी राज्यों में बिना किसी बाधा के 24x7 संचालित होता है।', 'en', 'hi', 'REJECTED', '2026-11-04 16:45:00', 'usr-003-citizen', 'web-001-electricity'),
('tra-006', 'Register dispute regarding agricultural feeder outage and high voltage fluctuation.', 'कृषि फीडर आउटेज और उच्च वोल्टेज उतार-चढ़ाव के संबंध में विवाद दर्ज करें।', 'en', 'hi', 'MACHINE', '2026-11-05 10:05:00', 'usr-003-citizen', 'web-003-discom');

-- -----------------------------------------------------------------------------
-- 5. Populate Entity: TranslationReview
-- -----------------------------------------------------------------------------
INSERT INTO "TranslationReview" ("id", "translationId", "reviewerId", "correctedText", "comments", "createdAt") VALUES
('rev-001', 'tra-001', 'usr-002-reviewer', 'राष्ट्रीय विद्युत सेवा पोर्टल में आपका स्वागत है।', 'Formal Rajbhasha register verified. Accurate terminology.', '2026-11-01 10:00:00'),
('rev-002', 'tra-002', 'usr-002-reviewer', 'नए घरेलू बिजली कनेक्शन के लिए ऑनलाइन आवेदन करें।', 'Approved without modifications. Clear citizen-facing Hindi.', '2026-11-01 11:30:00'),
('rev-003', 'tra-004', 'usr-004-reviewer2', 'वित्तीय वर्ष 2026-27 के लिए पीएम सूर्य घर योजना के अंतर्गत सब्सिडी अद्यतन की गई।', 'Replaced "के तहत" with formal administrative "के अंतर्गत".', '2026-11-03 15:40:00'),
('rev-004', 'tra-005', 'usr-002-reviewer', 'उपभोक्ता निवारण पोर्टल 1912 समस्त राज्यों में चौबीसों घंटे सक्रिय रहता है।', 'Rejected machine text: Machine translation missed the helpline code 1912 and used awkward literal phrasing.', '2026-11-04 17:15:00');
