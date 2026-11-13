/**
 * route.helpers.js
 *
 * Purpose:
 *   Shared utilities used by all route files.
 *
 *   - bindHandlers(controllerModule, controllerName, names)
 *       Wraps every named export so that if a teammate's controller function is
 *       missing at startup, the slot emits a 501 instead of crashing, while all
 *       other exports work normally. A console.warn fires once per missing name.
 *
 *   - makeAuth(middlewareModule)
 *       Wraps authenticate and authorize from auth.middleware. If either helper
 *       is absent the route responds 501 (fail-closed — never left open).
 *
 *   Validators (Express middleware, respond 400 { error } and normalise req.body):
 *   - validateRegister
 *   - validateLogin
 *   - validateWebsite
 *   - validateGlossaryTerm
 *   - validateTranslate
 *   - validateTranslateBatch
 *   - validateReview
 *   - validateUUID(paramName)   – returns a middleware for a specific :param
 *
 * Controller contract expected (names only — not imported here):
 *   auth.controller     : register, login, me
 *   website.controller  : listWebsites, createWebsite, getWebsite,
 *                         updateWebsite, deleteWebsite, listGlossaryTerms,
 *                         addGlossaryTerm, deleteGlossaryTerm
 *   translation.controller: translate, translateBatch, listTranslations,
 *                           getTranslation, reviewTranslation
 *
 * req.body shapes after validation:
 *   POST /register   { name: string, email: string (lower+trimmed), password: string }
 *   POST /login      { email: string, password: string }
 *   POST /websites   { name: string, domain: string (bare hostname, lowercase) }
 *   PUT  /websites   { name?: string, domain?: string }
 *   POST /glossary   { englishTerm: string, hindiTerm: string }
 *   POST /translate  { text: string, source_language: 'en'|'hi',
 *                      target_language: 'en'|'hi', website_id: string|null }
 *   POST /translate/batch  { texts: string[], source_language, target_language,
 *                            website_id: string|null }
 *   POST /review     { status: 'APPROVED'|'REJECTED', correctedText?: string,
 *                      comments?: string }
 *
 * Security:
 *   - Request bodies and passwords are NEVER logged.
 *   - Auth is fail-closed: missing middleware → 501, never 200/open.
 */

'use strict';

const { normalizeLanguage, MAX_TEXT_LENGTH, MAX_BATCH_SIZE } =
  require('../services/ai.services');

// ---------------------------------------------------------------------------
// UUID validation
// ---------------------------------------------------------------------------

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Returns a middleware that validates req.params[paramName] as a UUID v4.
 * @param {string} paramName  e.g. 'websiteId'
 * @returns {import('express').RequestHandler}
 */
function validateUUID(paramName) {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!UUID_RE.test(value)) {
      return res.status(400).json({
        error: `Invalid ${paramName}: must be a valid UUID.`,
      });
    }
    next();
  };
}

// ---------------------------------------------------------------------------
// bindHandlers
// ---------------------------------------------------------------------------

/**
 * Returns a proxy object where every name in `names` is a bound Express
 * handler. If the original export is missing, a 501 handler is substituted
 * and a one-time warning is printed at startup.
 *
 * @param {object} controllerModule  require()'d controller object
 * @param {string} controllerName    Human-readable name for warnings/responses
 * @param {string[]} names           Expected exported function names
 * @returns {Record<string, import('express').RequestHandler>}
 */
function bindHandlers(controllerModule, controllerName, names) {
  const bound = {};
  for (const name of names) {
    if (typeof controllerModule[name] === 'function') {
      bound[name] = controllerModule[name];
    } else {
      const label = `${controllerName}.${name}`;
      console.warn(
        `[route.helpers] WARNING: "${label}" is not exported by the controller. ` +
        `Requests to this endpoint will receive 501 until implemented.`
      );
      bound[name] = (_req, res) => {
        res.status(501).json({ error: `Not implemented: ${label}` });
      };
    }
  }
  return bound;
}

// ---------------------------------------------------------------------------
// makeAuth  — fail-closed auth wrapper
// ---------------------------------------------------------------------------

/**
 * Builds { authenticate, authorize } from the auth middleware module.
 * If either helper is missing, every protected route responds 501 — never open.
 *
 * @param {object} middlewareModule  require()'d auth middleware object
 * @returns {{ authenticate: Function, authorize: Function }}
 */
function makeAuth(middlewareModule) {
  const { authenticate: rawAuthenticate, authorize: rawAuthorize } =
    middlewareModule || {};

  const authenticate =
    typeof rawAuthenticate === 'function'
      ? rawAuthenticate
      : (_req, res) => {
          console.warn(
            '[route.helpers] WARNING: auth.middleware.authenticate is missing. ' +
            'Failing closed (501).'
          );
          res.status(501).json({ error: 'Not implemented: auth.middleware.authenticate' });
        };

  const authorize =
    typeof rawAuthorize === 'function'
      ? rawAuthorize
      : (..._roles) =>
          (_req, res) => {
            console.warn(
              '[route.helpers] WARNING: auth.middleware.authorize is missing. ' +
              'Failing closed (501).'
            );
            res.status(501).json({ error: 'Not implemented: auth.middleware.authorize' });
          };

  return { authenticate, authorize };
}

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

/** Simple email format check (no external deps). */
function isValidEmail(value) {
  return (
    typeof value === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  );
}

/**
 * Normalises a user-supplied domain to a bare lowercase hostname.
 * "https://example.com/path/" → "example.com"
 * "example.com"               → "example.com"
 * Returns null if the result is empty or clearly invalid.
 */
function normalizeDomain(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  let str = raw.trim().toLowerCase();
  // Strip protocol
  str = str.replace(/^https?:\/\//, '');
  // Strip path, query, fragment
  str = str.split('/')[0].split('?')[0].split('#')[0];
  // Strip trailing dot
  str = str.replace(/\.$/, '');
  // Must contain at least one dot or be a localhost-like name
  if (!str) return null;
  return str;
}

// ── POST /register ──────────────────────────────────────────────────────────
/**
 * Validates and normalises registration fields.
 * Sets req.body = { name, email (lower+trim), password }
 */
function validateRegister(req, res, next) {
  const { name, email, password } = req.body || {};

  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
    return res.status(400).json({
      error: 'name is required and must be 1–100 characters.',
    });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (
    typeof password !== 'string' ||
    password.length < 8 ||
    password.length > 128
  ) {
    return res.status(400).json({
      error: 'password must be 8–128 characters.',
    });
  }

  req.body = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  };
  next();
}

// ── POST /login ─────────────────────────────────────────────────────────────
/**
 * Validates login fields.
 * Sets req.body = { email, password }
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'email is required.' });
  }
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'password is required.' });
  }

  req.body = { email: email.trim().toLowerCase(), password };
  next();
}

// ── POST/PUT /websites ──────────────────────────────────────────────────────
/**
 * Validates website fields. For PUT, fields are optional — only validates
 * what is present.
 *
 * Sets req.body = { name?: string, domain?: string (bare hostname) }
 */
function validateWebsite(req, res, next) {
  const { name, domain } = req.body || {};
  const isPut = req.method === 'PUT';

  const result = {};

  if (!isPut || name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name must be a non-empty string.' });
    }
    result.name = name.trim();
  }

  if (!isPut || domain !== undefined) {
    const normalized = normalizeDomain(domain);
    if (!normalized) {
      return res.status(400).json({
        error: 'domain must be a valid hostname (e.g. "example.com").',
      });
    }
    result.domain = normalized;
  }

  req.body = result;
  next();
}

// ── POST /glossary ───────────────────────────────────────────────────────────
/**
 * Validates glossary term fields.
 * Sets req.body = { englishTerm: string, hindiTerm: string }
 */
function validateGlossaryTerm(req, res, next) {
  const { englishTerm, hindiTerm } = req.body || {};

  if (
    typeof englishTerm !== 'string' ||
    !englishTerm.trim() ||
    englishTerm.trim().length > 200
  ) {
    return res.status(400).json({
      error: 'englishTerm is required and must be 1–200 characters.',
    });
  }
  if (
    typeof hindiTerm !== 'string' ||
    !hindiTerm.trim() ||
    hindiTerm.trim().length > 200
  ) {
    return res.status(400).json({
      error: 'hindiTerm is required and must be 1–200 characters.',
    });
  }

  req.body = { englishTerm: englishTerm.trim(), hindiTerm: hindiTerm.trim() };
  next();
}

// ── POST /translate ──────────────────────────────────────────────────────────
/**
 * Validates single-translate request (matches frontend contract exactly).
 *
 * Accepts:
 *   { text, source_language?, target_language?, website_id? }
 *   website_id may be a number OR a string; both are accepted and stored as
 *   a string (or null if absent).
 *   source_language defaults to "en", target_language defaults to "hi".
 *
 * Sets req.body = {
 *   text: string,
 *   source_language: 'en'|'hi',
 *   target_language: 'en'|'hi',
 *   website_id: string|null
 * }
 */
function validateTranslate(req, res, next) {
  const { text, source_language, target_language, website_id } = req.body || {};

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required and must be a non-empty string.' });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({
      error: `text must not exceed ${MAX_TEXT_LENGTH} characters.`,
    });
  }

  const srcLang = normalizeLanguage(source_language ?? 'en');
  if (!srcLang) {
    return res.status(400).json({
      error: `source_language "${source_language}" is not supported. Use "en" or "hi".`,
    });
  }

  const tgtLang = normalizeLanguage(target_language ?? 'hi');
  if (!tgtLang) {
    return res.status(400).json({
      error: `target_language "${target_language}" is not supported. Use "en" or "hi".`,
    });
  }

  // website_id: accept string or number, store as string or null
  let normalizedWebsiteId = null;
  if (website_id !== undefined && website_id !== null && website_id !== '') {
    const asStr = String(website_id).trim();
    if (asStr) normalizedWebsiteId = asStr;
  }

  req.body = {
    text: text, // do NOT trim text — whitespace may be meaningful
    source_language: srcLang,
    target_language: tgtLang,
    website_id: normalizedWebsiteId,
  };
  next();
}

// ── POST /translate/batch ────────────────────────────────────────────────────
/**
 * Validates batch-translate request.
 *
 * Accepts:
 *   { texts: string[], source_language?, target_language?, website_id? }
 *
 * Sets req.body = {
 *   texts: string[],
 *   source_language: 'en'|'hi',
 *   target_language: 'en'|'hi',
 *   website_id: string|null
 * }
 */
function validateTranslateBatch(req, res, next) {
  const { texts, source_language, target_language, website_id } = req.body || {};

  if (!Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({
      error: 'texts must be a non-empty array of strings.',
    });
  }
  if (texts.length > MAX_BATCH_SIZE) {
    return res.status(400).json({
      error: `texts array must not exceed ${MAX_BATCH_SIZE} items.`,
    });
  }

  const invalidIndex = texts.findIndex(
    (t) => typeof t !== 'string' || !t.trim() || t.length > MAX_TEXT_LENGTH
  );
  if (invalidIndex !== -1) {
    return res.status(400).json({
      error:
        `texts[${invalidIndex}] is invalid: each item must be a non-empty string ` +
        `of at most ${MAX_TEXT_LENGTH} characters.`,
    });
  }

  const srcLang = normalizeLanguage(source_language ?? 'en');
  if (!srcLang) {
    return res.status(400).json({
      error: `source_language "${source_language}" is not supported. Use "en" or "hi".`,
    });
  }

  const tgtLang = normalizeLanguage(target_language ?? 'hi');
  if (!tgtLang) {
    return res.status(400).json({
      error: `target_language "${target_language}" is not supported. Use "en" or "hi".`,
    });
  }

  let normalizedWebsiteId = null;
  if (website_id !== undefined && website_id !== null && website_id !== '') {
    const asStr = String(website_id).trim();
    if (asStr) normalizedWebsiteId = asStr;
  }

  req.body = {
    texts,
    source_language: srcLang,
    target_language: tgtLang,
    website_id: normalizedWebsiteId,
  };
  next();
}

// ── POST /translations/:id/review ────────────────────────────────────────────
/**
 * Validates review submission.
 * Sets req.body = { status: 'APPROVED'|'REJECTED', correctedText?, comments? }
 */
function validateReview(req, res, next) {
  const { status, correctedText, comments } = req.body || {};

  if (status !== 'APPROVED' && status !== 'REJECTED') {
    return res.status(400).json({
      error: 'status must be "APPROVED" or "REJECTED".',
    });
  }

  const result = { status };

  if (correctedText !== undefined) {
    if (typeof correctedText !== 'string') {
      return res.status(400).json({ error: 'correctedText must be a string.' });
    }
    result.correctedText = correctedText;
  }
  if (comments !== undefined) {
    if (typeof comments !== 'string') {
      return res.status(400).json({ error: 'comments must be a string.' });
    }
    result.comments = comments;
  }

  req.body = result;
  next();
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  bindHandlers,
  makeAuth,
  validateUUID,
  validateRegister,
  validateLogin,
  validateWebsite,
  validateGlossaryTerm,
  validateTranslate,
  validateTranslateBatch,
  validateReview,
};

