# DBMS Major Project Viva — Video Presentation Script
**Project Title:** RajBhasha AI (राजभाषा AI) — Bilingual Website Localization Platform  
**Demonstration Portal:** National Electricity Services Portal (Ministry of Power Citizen Prototype)  
**Course:** Data Engineering (DE) Major Project — Third Semester  
**Target Video Duration:** 8 to 12 minutes  
**Format:** Screen Recording with Voiceover (Screen showing Schema, Code, Database Console & Application)

---

## Instructions for the Student Before Recording
> [!IMPORTANT]
> 1. **Keep your screen visible at all times:** Do not just show presentation slides. Have your **VS Code (`schema.prisma`)**, your **PostgreSQL CLI (`psql`) or pgAdmin / Prisma Studio**, and your **Running Web Application (`http://localhost:5173`)** ready in open windows.
> 2. **Practice the transitions:** Alternate smoothly between explaining the theory and demonstrating the actual code/schema on screen.
> 3. **Tone:** Confident, structured, and technically precise. Avoid generic textbook definitions; use your exact table names (`User`, `Website`, `Translation`, `TranslationReview`, `GlossaryTerm`).

---

## Video Scene Breakdown & Timestamps

```mermaid
timeline
    title DBMS Viva Video Presentation Roadmap
    section 00:00 - 02:00
      Q1 : Database Choice & Data Characteristics : Show Architecture & Live Translation Query
    section 02:00 - 04:30
      Q2 : Schema Walkthrough & ER Modeling : Show schema.prisma & Migration SQL
    section 04:30 - 06:45
      Q3 : Normalization (BCNF/3NF) & Denormalization : Explain FDs & sourceLanguage Decision
    section 06:45 - 09:15
      Q4 : Data Integrity, Constraints & Transactions : Demonstrate Unique Violations & Rollback
    section 09:15 - 11:30
      Q5 : Indexing, Performance & 100x Scalability : Show Indexes & Explain Table Partitioning
```

---

## [00:00 – 02:00] Question 1: Why Did You Choose This Database?

### What to Display on Screen:
* Start with your VS Code showing `Backend/prisma/schema.prisma` (lines 6–9: `provider = "postgresql"`).
* Switch briefly to your running browser at `http://localhost:5173` demonstrating a live translation event.
* Switch to your terminal or database console showing `psql` connected to `rajbhasha_ai`.

### Spoken Script:
> *"Hello respected evaluators. My name is [Your Full Name], and today I am presenting the database architecture and engineering for our Data Engineering Major Project: **RajBhasha AI**.*
>
> *For our project, we chose **PostgreSQL**, an enterprise-grade Object-Relational Database Management System (RDBMS), integrated via the Prisma ORM.*
>
> *Let us look at why PostgreSQL is specifically suited for our project’s data characteristics and usage:*
>
> 1. ***Data Structure:** Our application data is strictly structured and relational. We manage distinct entities including registered administrative Users, government Portal Websites, persistent Translation audit logs, Reviewer feedback, and Portal-specific Glossary dictionaries. Every record requires strict type constraints and predefined enumeration types, such as our `Role` enum (`ADMIN`, `REVIEWER`, `USER`) and `TranslationStatus` enum (`MACHINE`, `APPROVED`, `REJECTED`).*
>
> 2. ***Read and Write Patterns:** Our workload exhibits dual operational patterns:*
>    * *First, **high-frequency read bursts** during page localization, where the portal queries custom domain glossaries and checks for previously cached machine translations.*
>    * *Second, **write-heavy audit trails** where every translated sentence segment, reviewer correction, and user interaction is written to persistent storage for governmental compliance.*
>    * *In our initial deployment we handle thousands of translation segments, designed to scale across multiple state electricity DISCOM portals.*
>
> 3. ***Strict ACID Consistency:** In a public-sector governance application, strong consistency is mandatory. If an authorized reviewer marks a translation as `APPROVED` or amends a legal term, that state must be instantaneously visible across the entire platform. Partial writes or dirty reads are unacceptable.*
>
> 4. ***Alternatives Considered and Rejected:** We evaluated **MongoDB**, a popular document database. However, MongoDB was rejected because translation reviews and glossary management require multi-entity relational integrity. In MongoDB, embedding reviews inside translation documents causes unbounded document growth, while referencing them lacks native declarative foreign key constraints and cascade safety. We also considered **Redis**, but chose to reserve it strictly for transient in-memory caching because it lacks the complex relational indexing, multi-table joins, and long-term durability our compliance records require.*
>
> *Let me demonstrate our primary query pattern in the PostgreSQL console."*

### Screen Action & Demonstration:
* In terminal/console, run:
```sql
-- Query 1: Fetching portal-specific glossary terms for instant domain matching
SELECT "englishTerm", "hindiTerm" 
FROM "GlossaryTerm" 
WHERE "websiteId" = 'YOUR_SAMPLE_WEBSITE_ID';

-- Query 2: Fetching user translation history with pagination
SELECT id, "sourceText", "translatedText", status, "createdAt" 
FROM "Translation" 
WHERE "userId" = 'YOUR_SAMPLE_USER_ID' 
ORDER BY "createdAt" DESC 
LIMIT 10;
```
* Point to the query execution and output columns.

---

## [02:00 – 04:30] Question 2: Walk Us Through Your Schema or Data Model

### What to Display on Screen:
* Open `Backend/prisma/migrations/20261112185134_rajbhasha_ai/migration.sql` and `schema.prisma`.
* Display the **Entity-Relationship Diagram** from `docs/database_er_modeling.md`.

### Spoken Script:
> *"Now, let us examine our schema and data model.*
>
> *Our relational model consists of five core entities:*
> 1. ***User Table:** Stores citizen and administrative identities with attributes: `id` as primary key (using UUID v4 for distributed uniqueness), `name`, unique `email`, hashed `password`, system `role`, and registration timestamp.*
> 2. ***Website Table:** Represents individual localized digital portals. Attributes include `id` (PK), portal `name`, unique `domain` (such as `energy.gov.in`), foreign key `userId` referencing the administrator who registered the portal, and `createdAt`.*
> 3. ***Translation Table:** Stores persistent localized records. Attributes include `id` (PK), `sourceText` and `translatedText` mapped as PostgreSQL `TEXT` types, `sourceLanguage` and `targetLanguage` with defaults to English and Hindi, `status` enum, creation timestamp, `userId` (FK), and nullable `websiteId` (FK).*
> 4. ***GlossaryTerm Table:** Stores domain-specific administrative vocabulary overrides. Attributes include `id` (PK), `englishTerm`, `hindiTerm`, and `websiteId` (FK).*
> 5. ***TranslationReview Table:** Captures human-in-the-loop audit logs where linguists verify machine outputs. Attributes include `id` (PK), `translationId` (FK), `reviewerId` (FK), `correctedText`, reviewer `comments`, and `createdAt`.*
>
> *Let us look at the cardinalities and relationships:*
> * *`User` to `Website` is a **1-to-Many (1:N)** relationship: One administrator can manage multiple government portals.*
> * *`Website` to `GlossaryTerm` is **1-to-Many (1:N)**: Each website maintains its dedicated glossary.*
> * *`Website` to `Translation` is **1-to-Many (1:N)**: One portal can log thousands of translated text nodes.*
> * *`Translation` to `TranslationReview` is **1-to-Many (1:N)**: A single translation can receive multiple iterative reviews.*
>
> ***How We Resolved Many-to-Many (M:N) Relationships:***
> *Between `Translation` and `User` (in their capacity as certified Reviewers), there exists a natural Many-to-Many relationship: one reviewer reviews many translations, and a disputed translation can be audited by multiple independent reviewers.*
>
> *We resolved this M:N relationship by introducing **`TranslationReview`** as an associative entity (junction table). It decomposes the M:N relationship into two clean 1-to-Many relationships: `Translation` 1:N `TranslationReview`, and `User` 1:N `TranslationReview`, while maintaining payload attributes like `correctedText` and `comments`.*
>
> *Let me demonstrate a cross-table JOIN query that retrieves a translation segment together with its portal domain and reviewer remarks."*

### Screen Action & Demonstration:
* In terminal/console, run the multi-table JOIN query:
```sql
SELECT 
    t.id AS translation_id,
    w.domain AS portal_domain,
    t."sourceText",
    t."translatedText",
    t.status,
    u.name AS reviewer_name,
    tr."correctedText",
    tr.comments
FROM "Translation" t
LEFT JOIN "Website" w ON t."websiteId" = w.id
LEFT JOIN "TranslationReview" tr ON t.id = tr."translationId"
LEFT JOIN "User" u ON tr."reviewerId" = u.id
LIMIT 5;
```
* Highlight the output showing data joined across 4 relational tables.

---

## [04:30 – 06:45] Question 3: What Normal Form is Your Design In, and Where Did You Break It?

### What to Display on Screen:
* Open `Backend/src/services/ai.service.js` or `Backend/src/services/glossary.service.js`.
* Highlight lines showing `sourceLanguage`, `targetLanguage`, and the in-memory glossary object.

### Spoken Script:
> *"Addressing Question 3: our relational database design strictly achieves **Boyce-Codd Normal Form (BCNF)**, which is an advanced specialization of Third Normal Form (3NF).*
>
> *Let us trace the formal normalization steps:*
>
> 1. ***First Normal Form (1NF):** Every column holds atomic, indivisible values. There are no multi-valued attributes, repeating groups, or comma-separated lists. Primary keys are defined on every table.*
>
> 2. ***Second Normal Form (2NF):** The schema satisfies 1NF, and there are no partial functional dependencies. In our `GlossaryTerm` table, we have a composite candidate key on `(websiteId, englishTerm)`. The non-key attribute `hindiTerm` is functionally dependent on the **entire** composite key—not just on `websiteId` or `englishTerm` alone. Hence, 2NF holds.*
>
> 3. ***Third Normal Form (3NF) & BCNF:** A table is in BCNF if for every non-trivial functional dependency $X \rightarrow Y$, the determinant $X$ is a superkey.*
>    * *Take our **`Website`** table:*
>      * *Dependency 1: `id -> {name, domain, userId, createdAt}` (Here `id` is the primary key).*
>      * *Dependency 2: `domain -> {id, name, userId, createdAt}` (Here `domain` has a `UNIQUE` constraint and is a valid candidate key).*
>    * *Because every determinant is a candidate key, there are zero transitive dependencies, and the table satisfies BCNF.*
>    * *The exact same property holds for the **`User`** table where both `id` and `email` are candidate keys.*
>
> ***Deliberate Denormalization & Engineering Trade-offs:***
> *Where did we deliberately break textbook normalization?*
>
> *1. **Language Code Storage:** In strict textbook normalization, we would create a separate `Language` lookup table (`id`, `iso_code`, `language_name`) and store a foreign key in `Translation`. However, our platform is purpose-built for bidirectional Indian administrative localization between English and Hindi (`SUPPORTED_LANGUAGES = ['en', 'hi']`). Storing `'en'` and `'hi'` directly as strings with database defaults avoids costly table joins across millions of translation records, saving significant join overhead and memory I/O without any update anomaly risk.*
>
> *2. **In-Memory Caching Layer:** In `glossary.service.js`, we maintain a pre-compiled in-memory dictionary of core government terminology. When a citizen visits the electricity portal, common labels like 'Ministry of Power' or 'Application Status' are resolved directly in memory in sub-millisecond time, avoiding repetitive database queries while keeping the PostgreSQL database authoritative for custom portal glossaries."*

---

## [06:45 – 09:15] Question 4: How Does Your Database Protect Data Correctness?

### What to Display on Screen:
* Show constraints in `migration.sql` (`CREATE UNIQUE INDEX`, `ALTER TABLE ... ADD CONSTRAINT`).
* Open your terminal and demonstrate a **Constraint Violation** by attempting to insert a duplicate email or invalid foreign key.

### Spoken Script:
> *"Moving to Question 4: data correctness is preserved at both the database engine level and the application logic level.*
>
> ***1. Database Constraints:***
> * *`PRIMARY KEY`: Enforced via UUID v4 on all 5 tables to guarantee global uniqueness.*
> * *`NOT NULL`: Enforced on all required attributes (`email`, `password`, `sourceText`, `translatedText`, `englishTerm`, `hindiTerm`).*
> * *`UNIQUE Constraints`:*
>   * *`User_email_key` prevents duplicate accounts.*
>   * *`Website_domain_key` prevents two tenants from claiming the same portal domain.*
>   * *`GlossaryTerm_websiteId_englishTerm_key` is a composite unique index preventing duplicate terminology mappings within the same portal.*
> * *`CHECK & ENUM`: PostgreSQL native enums restrict roles to `'ADMIN' | 'REVIEWER' | 'USER'` and statuses to `'MACHINE' | 'APPROVED' | 'REJECTED'`.*
> * *`FOREIGN KEY Referential Integrity`:*
>   * *`Website.userId -> User.id` uses `ON DELETE RESTRICT`: you cannot delete a user if active registered websites depend on them.*
>   * *`Translation.websiteId -> Website.id` uses `ON DELETE SET NULL`: if a portal registration is decommissioned, citizen translation records are preserved for audit purposes with the foreign key set to null.*
>
> ***2. Transaction Management & Atomicity:***
> *When a reviewer approves a translation with corrected text, we must atomically update the `Translation` status to `APPROVED`, insert a new audit entry into `TranslationReview`, and update any associated glossary terms. We wrap this in a Prisma `$transaction` block:*
>
> *If an unexpected server failure or constraint violation occurs halfway through, the database issues an automatic `ROLLBACK`, guaranteeing that orphaned reviews or half-updated statuses can never persist.*
>
> ***3. Concurrency and Isolation:***
> *PostgreSQL operates under the **Read Committed** isolation level by default. When concurrent translation batches arrive from the same webpage (up to 4 parallel HTTP calls), each transaction sees only committed data, eliminating dirty reads. For concurrent glossary term inserts, our composite unique constraint acts as a synchronization barrier, preventing race conditions.*
>
> *Let me demonstrate PostgreSQL actively rejecting invalid data right now."*

### Screen Action & Demonstration (Constraint Rejection):
* In `psql` console, run:
```sql
-- Attempting to insert a duplicate email (Demonstrating Unique Constraint violation)
INSERT INTO "User" (id, name, email, password, role, "createdAt") 
VALUES (gen_random_uuid()::text, 'Duplicate User', 'test@example.com', 'hashedpassword', 'USER', NOW());

-- Run the same INSERT a second time to trigger the error:
INSERT INTO "User" (id, name, email, password, role, "createdAt") 
VALUES (gen_random_uuid()::text, 'Duplicate User', 'test@example.com', 'hashedpassword', 'USER', NOW());
```
* **Show the error output clearly on screen:**
  `ERROR: duplicate key value violates unique constraint "User_email_key"`
* Point to the terminal: *"As you can see, PostgreSQL immediately rejects the transaction with error code 23505."*

---

## [09:15 – 11:30] Question 5: How Did You Make Your Database Usage Efficient?

### What to Display on Screen:
* Show migration file lines 67–75 (`CREATE UNIQUE INDEX` statements).
* Run `\di` in PostgreSQL or show index definitions.
* Show the 100x Growth Architecture diagram from `docs/database_er_modeling.md`.

### Spoken Script:
> *"Finally, Question 5: Database efficiency, indexing strategy, and long-term scalability.*
>
> ***1. Indexes Created & Queries Supported:***
> * *`User_email_key` (B-Tree): Supports $O(\log N)$ point lookups during citizen and administrative authentication (`WHERE email = $1`).*
> * *`Website_domain_key` (B-Tree): Supports instant lookups when the frontend widget initiates localization by identifying the domain hostname.*
> * *`GlossaryTerm_websiteId_englishTerm_key` (Composite B-Tree): Directly accelerates the most frequent operational query: checking whether an English term on a specific website has an official pre-approved Hindi glossary entry.*
> * *Primary key indexes on `id` across all tables facilitate instant relational joins.*
>
> ***2. Indexes Considered but Deliberately Rejected:***
> *We explicitly considered adding a B-Tree index on `Translation(sourceText)`. However, we **decided against it**.*
> *Why? `sourceText` can be up to 5,000 characters long. Creating a B-Tree index on unbounded long text causes massive index bloat, consumes immense RAM, and inflicts severe write amplification on every single translation insert. Instead, exact phrase matching is handled through the in-memory glossary, and if full-text search is required in future iterations, a PostgreSQL GIN (Generalized Inverted Index) on `to_tsvector()` will be implemented rather than a standard B-Tree.*
>
> ***3. Scalability Plan for 100x User Growth:***
> *If our user base grows 100 times—serving hundreds of state government portals with millions of daily translation queries—the first component to experience strain would be the **`Translation` table**, due to table size, disk I/O contention, and slower index traversal.*
>
> *Here is our three-tier scalability strategy to handle 100x volume:*
> 1. ***Declarative Table Partitioning:** We will partition the `Translation` table by date range (`PARTITION BY RANGE (createdAt)`), splitting data into monthly or quarterly partitions. Queries for recent activity only scan the active partition, while historical compliance data is archived.*
> 2. ***Read/Write Splitting with Read Replicas:** 90% of portal traffic consists of read queries (glossary checks and history queries). We will implement PostgreSQL streaming replication with one primary writer and multiple read replicas behind a PgBouncer connection pool.*
> 3. ***Distributed Redis Caching:** Frequently translated paragraphs will be cached in Redis with a 24-hour TTL, intercepting 85% of queries before they ever touch PostgreSQL.*
>
> *This concludes my demonstration of the database design, normalization, constraints, and optimization for RajBhasha AI. Thank you."*

---

## Summary Checklist for Recording

- [ ] Chrome / Browser open with `http://localhost:5173`
- [ ] VS Code open with `schema.prisma` and `migration.sql`
- [ ] PostgreSQL terminal (`psql`) open with database `rajbhasha_ai`
- [ ] Screen recorder set to record both screen and clear microphone audio
- [ ] Demonstrated duplicate key error rejection live on screen
- [ ] Multi-table JOIN query executed and results displayed live
