-- =============================================================================
-- RajBhasha AI — Data Engineering (DE) Major Project
-- Final PostgreSQL Database Schema DDL
-- Database Engine: PostgreSQL 14+ / 16+
-- =============================================================================

-- 1. Create Custom Enumeration Types
CREATE TYPE "Role" AS ENUM ('ADMIN', 'REVIEWER', 'USER');
CREATE TYPE "TranslationStatus" AS ENUM ('MACHINE', 'APPROVED', 'REJECTED');

-- 2. Create Entity: User
-- Stores citizen, linguist reviewer, and portal administrator identities
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- 3. Create Entity: Website
-- Represents multi-tenant public-service portals localized by the platform
CREATE TABLE "Website" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);

-- 4. Create Entity: Translation
-- Stores persistent bilingual translation audit records
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "sourceLanguage" TEXT NOT NULL DEFAULT 'en',
    "targetLanguage" TEXT NOT NULL DEFAULT 'hi',
    "status" "TranslationStatus" NOT NULL DEFAULT 'MACHINE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "websiteId" TEXT,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- 5. Create Entity: TranslationReview
-- Associative junction table resolving M:N between Translation and User (Reviewers)
CREATE TABLE "TranslationReview" (
    "id" TEXT NOT NULL,
    "translationId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "correctedText" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranslationReview_pkey" PRIMARY KEY ("id")
);

-- 6. Create Entity: GlossaryTerm
-- Standardized departmental vocabulary overrides per portal
CREATE TABLE "GlossaryTerm" (
    "id" TEXT NOT NULL,
    "englishTerm" TEXT NOT NULL,
    "hindiTerm" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,

    CONSTRAINT "GlossaryTerm_pkey" PRIMARY KEY ("id")
);

-- =============================================================================
-- Integrity Constraints & Secondary B-Tree Indexes
-- =============================================================================

-- Unique constraint on User email to prevent duplicate registration
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Unique constraint on Website domain to prevent tenant domain collisions
CREATE UNIQUE INDEX "Website_domain_key" ON "Website"("domain");

-- Composite unique constraint on (websiteId, englishTerm) to eliminate conflicting portal translations
CREATE UNIQUE INDEX "GlossaryTerm_websiteId_englishTerm_key" ON "GlossaryTerm"("websiteId", "englishTerm");

-- =============================================================================
-- Foreign Key Relationships & Referential Action Specifications
-- =============================================================================

-- Website -> User: One User registers many Websites (ON DELETE RESTRICT protects active sites)
ALTER TABLE "Website" 
    ADD CONSTRAINT "Website_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Translation -> User: User triggers translation (ON DELETE RESTRICT protects audit logs)
ALTER TABLE "Translation" 
    ADD CONSTRAINT "Translation_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Translation -> Website: Optional portal association.
-- ON DELETE SET NULL guarantees historical translation logs are preserved if a portal is unregistered.
ALTER TABLE "Translation" 
    ADD CONSTRAINT "Translation_websiteId_fkey" 
    FOREIGN KEY ("websiteId") REFERENCES "Website"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

-- TranslationReview -> Translation: Review belongs to translation (ON DELETE RESTRICT)
ALTER TABLE "TranslationReview" 
    ADD CONSTRAINT "TranslationReview_translationId_fkey" 
    FOREIGN KEY ("translationId") REFERENCES "Translation"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- TranslationReview -> User (Reviewer): Review links to linguist (ON DELETE RESTRICT)
ALTER TABLE "TranslationReview" 
    ADD CONSTRAINT "TranslationReview_reviewerId_fkey" 
    FOREIGN KEY ("reviewerId") REFERENCES "User"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- GlossaryTerm -> Website: Term belongs to portal (ON DELETE RESTRICT)
ALTER TABLE "GlossaryTerm" 
    ADD CONSTRAINT "GlossaryTerm_websiteId_fkey" 
    FOREIGN KEY ("websiteId") REFERENCES "Website"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;
