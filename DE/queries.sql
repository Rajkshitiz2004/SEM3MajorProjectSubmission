-- =============================================================================
-- RajBhasha AI — Data Engineering (DE) Major Project
-- 12 Mandatory Project-Specific SQL Queries with Explanations
-- Database: PostgreSQL 14+ / 16+
-- =============================================================================

-- =============================================================================
-- QUERY 1: INSERT Operation (Citizen & System Onboarding)
-- Concept: Data Manipulation (INSERT INTO ... VALUES)
-- Business Use Case: Registers a new government portal administrator with Bcrypt hashed credentials.
-- =============================================================================
INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt")
VALUES (
    'usr-005-poweradmin',
    'Vikram Malhotra (Executive Engineer, DISCOM)',
    'vikram.malhotra@discom.gov.in',
    '$2b$12$k8xL90Pq1M.2yZzW87vN4tX2wAzZzK8uY3t0K1m6N8uS0.7jK8x1M',
    'ADMIN',
    NOW()
);

-- =============================================================================
-- QUERY 2: UPDATE Operation (Quality Review & Status Transition)
-- Concept: Data Manipulation (UPDATE ... SET ... WHERE)
-- Business Use Case: A Certified Reviewer approves a pending machine translation,
--                   updating its state from 'MACHINE' to 'APPROVED'.
-- =============================================================================
UPDATE "Translation"
SET "status" = 'APPROVED'
WHERE "id" = 'tra-003' 
  AND "status" = 'MACHINE';

-- =============================================================================
-- QUERY 3: DELETE Operation (Maintaining Referential Safety)
-- Concept: Data Manipulation (DELETE FROM ... WHERE)
-- Business Use Case: Decommissioning an obsolete or disputed terminology override
--                   from a specific state portal glossary.
-- =============================================================================
DELETE FROM "GlossaryTerm"
WHERE "id" = 'glo-007' 
  AND "websiteId" = 'web-003-discom';

-- =============================================================================
-- QUERY 4: SELECT with Filtering, Case-Insensitive Search & Sorting
-- Concept: Basic Query Formulation (SELECT, WHERE, ILIKE, ORDER BY, LIMIT)
-- Business Use Case: Citizen portal search retrieving all electricity and solar
--                   translations created after Nov 1, 2026, sorted chronologically.
-- =============================================================================
SELECT 
    "id", 
    "sourceText", 
    "translatedText", 
    "status", 
    "createdAt"
FROM "Translation"
WHERE ("sourceText" ILIKE '%electricity%' OR "sourceText" ILIKE '%solar%')
  AND "createdAt" >= '2026-11-01 00:00:00'
ORDER BY "createdAt" DESC
LIMIT 5;

-- =============================================================================
-- QUERY 5: Aggregate Functions (Platform Operational Summary)
-- Concept: Summary Statistics (COUNT, AVG, MIN, MAX, SUM)
-- Business Use Case: Computes comprehensive platform volume metrics: total translations,
--                   distinct websites served, and average sentence character length.
-- =============================================================================
SELECT 
    COUNT(*) AS total_translations,
    COUNT(DISTINCT "websiteId") AS active_portals_count,
    ROUND(AVG(LENGTH("sourceText")), 2) AS avg_source_char_length,
    MIN(LENGTH("sourceText")) AS min_source_char_length,
    MAX(LENGTH("sourceText")) AS max_source_char_length,
    MIN("createdAt") AS earliest_translation,
    MAX("createdAt") AS latest_translation
FROM "Translation";

-- =============================================================================
-- QUERY 6: GROUP BY with HAVING Clause (High-Activity Portal Analysis)
-- Concept: Data Aggregation with Filtered Grouping (GROUP BY, HAVING)
-- Business Use Case: Identifies high-traffic public service portals that have generated
--                   more than 1 translation, calculating their approval rate.
-- =============================================================================
SELECT 
    w.id AS website_id,
    w.name AS portal_name,
    w.domain AS portal_domain,
    COUNT(t.id) AS total_requests,
    COUNT(CASE WHEN t.status = 'APPROVED' THEN 1 END) AS approved_count,
    ROUND(
        (COUNT(CASE WHEN t.status = 'APPROVED' THEN 1 END)::numeric / COUNT(t.id)::numeric) * 100, 
        2
    ) AS approval_percentage
FROM "Website" w
INNER JOIN "Translation" t ON w.id = t."websiteId"
GROUP BY w.id, w.name, w.domain
HAVING COUNT(t.id) > 1
ORDER BY total_requests DESC;

-- =============================================================================
-- QUERY 7: Multi-Table JOIN Operation (Complete Audit Trail Reconstruction)
-- Concept: Relational Join across 4 entities (INNER JOIN, LEFT OUTER JOIN)
-- Business Use Case: Generates a complete administrative audit trail linking the
--                   original English text, localized Hindi text, originating portal,
--                   and the certifying linguist's feedback and corrections.
-- =============================================================================
SELECT 
    t.id AS translation_id,
    w.name AS portal_name,
    w.domain AS portal_domain,
    t."sourceText" AS english_source,
    t."translatedText" AS initial_hindi,
    t.status AS current_status,
    u.name AS reviewer_name,
    tr."correctedText" AS linguist_correction,
    tr.comments AS review_notes,
    tr."createdAt" AS review_timestamp
FROM "Translation" t
INNER JOIN "Website" w ON t."websiteId" = w.id
LEFT JOIN "TranslationReview" tr ON t.id = tr."translationId"
LEFT JOIN "User" u ON tr."reviewerId" = u.id
ORDER BY t."createdAt" ASC;

-- =============================================================================
-- QUERY 8: Scalar Subquery (Long-Sentence Outlier Detection)
-- Concept: Subquery in WHERE clause returning a single scalar value
-- Business Use Case: Finds translation segments whose character length exceeds
--                   the overall system average, flagging them for human review.
-- =============================================================================
SELECT 
    "id", 
    "sourceText", 
    LENGTH("sourceText") AS char_length,
    "status",
    "createdAt"
FROM "Translation"
WHERE LENGTH("sourceText") > (
    SELECT AVG(LENGTH("sourceText")) 
    FROM "Translation"
)
ORDER BY char_length DESC;

-- =============================================================================
-- QUERY 9: Correlated Subquery with EXISTS (Audit Compliance Verification)
-- Concept: Correlated Subquery (EXISTS)
-- Business Use Case: Retrieves all websites that have at least one audited review
--                   on record, verifying regulatory compliance.
-- =============================================================================
SELECT 
    w.id, 
    w.name, 
    w.domain, 
    w."createdAt"
FROM "Website" w
WHERE EXISTS (
    SELECT 1 
    FROM "Translation" t
    INNER JOIN "TranslationReview" tr ON t.id = tr."translationId"
    WHERE t."websiteId" = w.id
);

-- =============================================================================
-- QUERY 10: Advanced Window Function with CTE (Top Recent Segment per Portal)
-- Concept: Common Table Expressions (WITH), Window Functions (ROW_NUMBER() OVER PARTITION)
-- Business Use Case: Returns the single most recent translation request logged
--                   for every registered public portal, avoiding full-table grouping.
-- =============================================================================
WITH RankedTranslations AS (
    SELECT 
        t.id,
        t."websiteId",
        w.name AS website_name,
        t."sourceText",
        t."translatedText",
        t.status,
        t."createdAt",
        ROW_NUMBER() OVER (
            PARTITION BY t."websiteId" 
            ORDER BY t."createdAt" DESC
        ) AS recency_rank
    FROM "Translation" t
    INNER JOIN "Website" w ON t."websiteId" = w.id
)
SELECT 
    website_name,
    "sourceText",
    "translatedText",
    status,
    "createdAt" AS latest_activity_time
FROM RankedTranslations
WHERE recency_rank = 1;

-- =============================================================================
-- QUERY 11: Pivot & Conditional Aggregation (Status Dashboard Breakdown)
-- Concept: CASE Expression inside Aggregate Function
-- Business Use Case: Generates a single-row executive dashboard displaying total,
--                   machine-generated, approved, and rejected segments.
-- =============================================================================
SELECT 
    COUNT(*) AS total_segments,
    COUNT(CASE WHEN "status" = 'MACHINE' THEN 1 END) AS pending_machine_count,
    COUNT(CASE WHEN "status" = 'APPROVED' THEN 1 END) AS validated_approved_count,
    COUNT(CASE WHEN "status" = 'REJECTED' THEN 1 END) AS rejected_count,
    ROUND(
        (COUNT(CASE WHEN "status" = 'APPROVED' THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 
        2
    ) AS overall_quality_score_pct
FROM "Translation";

-- =============================================================================
-- QUERY 12: Set Operation (Linguist Productivity Analysis)
-- Concept: Set Difference / Set Operations (EXCEPT / UNION ALL)
-- Business Use Case: Identifies all registered users with the 'REVIEWER' role who have
--                   NOT yet submitted any audit reviews in the current evaluation cycle.
-- =============================================================================
SELECT "id", "name", "email"
FROM "User"
WHERE "role" = 'REVIEWER'
EXCEPT
SELECT DISTINCT u.id, u.name, u.email
FROM "User" u
INNER JOIN "TranslationReview" tr ON u.id = tr."reviewerId";
