/**
 * translation.routes.js
 *
 * Purpose:
 *   Translation, batch-translation, translation history, and review routes.
 *   Mount at /api/v1 in app.js.
 *
 * Controller contract expected (translation.controller exports):
 *   translate(req, res, next)         — single text translation (PUBLIC)
 *   translateBatch(req, res, next)    — batch translation (PUBLIC)
 *   listTranslations(req, res, next)  — paginated history for authenticated user
 *   getTranslation(req, res, next)    — single translation record
 *   reviewTranslation(req, res, next) — REVIEWER/ADMIN approves or rejects
 *
 * req.body / req.params shapes after validation:
 *
 *   POST /translate
 *     req.body = {
 *       text: string,
 *       source_language: 'en'|'hi',   // default 'en'
 *       target_language: 'en'|'hi',   // default 'hi'
 *       website_id: string|null        // numeric id from frontend, stored as string
 *     }
 *     Response (must match frontend contract exactly):
 *       { original_text, translated_text, source_language, target_language, status }
 *       status is lowercase, e.g. "machine"
 *
 *   POST /translate/batch
 *     req.body = {
 *       texts: string[],               // 1–MAX_BATCH_SIZE non-empty strings
 *       source_language: 'en'|'hi',
 *       target_language: 'en'|'hi',
 *       website_id: string|null
 *     }
 *
 *   GET  /translations                 — req.user available; no body
 *   GET  /translations/:translationId  — req.params.translationId (UUID)
 *
 *   POST /translations/:translationId/review
 *     req.body = {
 *       status: 'APPROVED'|'REJECTED',
 *       correctedText?: string,
 *       comments?: string
 *     }
 *
 * Routes:
 *   POST /translate              — PUBLIC — validateTranslate → translate
 *   POST /translate/batch        — PUBLIC — validateTranslateBatch → translateBatch
 *   GET  /translations           — private — authenticate → listTranslations
 *   GET  /translations/:id       — private — authenticate, validateUUID → getTranslation
 *   POST /translations/:id/review — private — authenticate, authorize(REVIEWER,ADMIN),
 *                                             validateUUID, validateReview → reviewTranslation
 *
 * Notes:
 *   - /translate and /translate/batch are PUBLIC: no auth token required.
 *     The frontend sends up to 4 parallel requests and translates both en→hi and hi→en.
 *   - /translate/batch must be declared BEFORE /translations/:translationId to prevent
 *     Express treating "batch" as a UUID.
 *   - Express 5 forwards async rejections automatically — no needless try/catch here.
 */

'use strict';

const express = require('express');

const {
  bindHandlers,
  makeAuth,
  validateUUID,
  validateTranslate,
  validateTranslateBatch,
  validateReview,
} = require('./route.helpers');

// ── Teammate controller ────────────────────────────────────────────────────────
const CONTROLLER_NAME = 'translation.controller';
const CONTROLLER_EXPORTS = [
  'translate',
  'translateBatch',
  'listTranslations',
  'getTranslation',
  'reviewTranslation',
];

let rawController = {};
try {
  rawController = require('../controller/translation.controller');
} catch {
  console.warn(
    `[translation.routes] WARNING: Could not load "${CONTROLLER_NAME}". ` +
    'All translation endpoints will respond 501 until the controller is implemented.'
  );
}

const ctrl = bindHandlers(rawController, CONTROLLER_NAME, CONTROLLER_EXPORTS);

// ── Teammate auth middleware ───────────────────────────────────────────────────
let rawAuthMiddleware = {};
try {
  rawAuthMiddleware = require('../middleware/auth.middleware');
} catch {
  console.warn(
    '[translation.routes] WARNING: Could not load auth.middleware. ' +
    'Protected routes will respond 501 (fail-closed).'
  );
}

const { authenticate, authorize } = makeAuth(rawAuthMiddleware);

// ── Router ────────────────────────────────────────────────────────────────────
const router = express.Router();

// ── Public translation endpoints ──────────────────────────────────────────────

// POST /api/v1/translate
router.post('/translate', validateTranslate, ctrl.translate);

// POST /api/v1/translate/batch
// Must be declared BEFORE /translate/:anything to avoid "batch" matching as a param.
router.post('/translate/batch', validateTranslateBatch, ctrl.translateBatch);

// ── Authenticated translation history ─────────────────────────────────────────

// GET /api/v1/translations
router.get('/translations', authenticate, ctrl.listTranslations);

// GET /api/v1/translations/:translationId
router.get(
  '/translations/:translationId',
  authenticate,
  validateUUID('translationId'),
  ctrl.getTranslation
);

// POST /api/v1/translations/:translationId/review
router.post(
  '/translations/:translationId/review',
  authenticate,
  authorize('REVIEWER', 'ADMIN'),
  validateUUID('translationId'),
  validateReview,
  ctrl.reviewTranslation
);

module.exports = router;

