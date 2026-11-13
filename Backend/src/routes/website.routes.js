/**
 * website.routes.js
 *
 * Purpose:
 *   Website and glossary management routes. Mount at /api/v1/websites in app.js.
 *   Every route is protected by authenticate.
 *
 * Controller contract expected (website.controller exports):
 *   listWebsites(req, res, next)    — returns all websites for req.user
 *   createWebsite(req, res, next)   — creates a new website
 *   getWebsite(req, res, next)      — returns a single website by req.params.websiteId
 *   updateWebsite(req, res, next)   — updates name and/or domain
 *   deleteWebsite(req, res, next)   — deletes a website
 *   listGlossaryTerms(req, res, next)  — returns glossary for a website
 *   addGlossaryTerm(req, res, next)    — adds a glossary term to a website
 *   deleteGlossaryTerm(req, res, next) — deletes a single glossary term
 *
 * req.body / req.params shapes after validation:
 *   GET    /                            — no body; req.user available
 *   POST   /                            { name: string, domain: string (bare hostname) }
 *   GET    /:websiteId                  — req.params.websiteId (UUID)
 *   PUT    /:websiteId                  { name?: string, domain?: string } (at least one expected by controller)
 *   DELETE /:websiteId                  — req.params.websiteId (UUID)
 *   GET    /:websiteId/glossary         — req.params.websiteId (UUID)
 *   POST   /:websiteId/glossary         { englishTerm: string, hindiTerm: string }
 *   DELETE /:websiteId/glossary/:termId — req.params.websiteId, req.params.termId (both UUIDs)
 *
 * Routes:
 *   GET    /                           authenticate → listWebsites
 *   POST   /                           authenticate, validateWebsite → createWebsite
 *   GET    /:websiteId                 authenticate, validateUUID(websiteId) → getWebsite
 *   PUT    /:websiteId                 authenticate, validateUUID(websiteId), validateWebsite → updateWebsite
 *   DELETE /:websiteId                 authenticate, validateUUID(websiteId) → deleteWebsite
 *   GET    /:websiteId/glossary        authenticate, validateUUID(websiteId) → listGlossaryTerms
 *   POST   /:websiteId/glossary        authenticate, validateUUID(websiteId), validateGlossaryTerm → addGlossaryTerm
 *   DELETE /:websiteId/glossary/:termId authenticate, validateUUID(websiteId), validateUUID(termId) → deleteGlossaryTerm
 */

'use strict';

const express = require('express');

const {
  bindHandlers,
  makeAuth,
  validateUUID,
  validateWebsite,
  validateGlossaryTerm,
} = require('./route.helpers');

// ── Teammate controller ────────────────────────────────────────────────────────
const CONTROLLER_NAME = 'website.controller';
const CONTROLLER_EXPORTS = [
  'listWebsites',
  'createWebsite',
  'getWebsite',
  'updateWebsite',
  'deleteWebsite',
  'listGlossaryTerms',
  'addGlossaryTerm',
  'deleteGlossaryTerm',
];

let rawController = {};
try {
  rawController = require('../controller/website.controller');
} catch {
  console.warn(
    `[website.routes] WARNING: Could not load "${CONTROLLER_NAME}". ` +
    'All website endpoints will respond 501 until the controller is implemented.'
  );
}

const ctrl = bindHandlers(rawController, CONTROLLER_NAME, CONTROLLER_EXPORTS);

// ── Teammate auth middleware ───────────────────────────────────────────────────
let rawAuthMiddleware = {};
try {
  rawAuthMiddleware = require('../middleware/auth.middleware');
} catch {
  console.warn(
    '[website.routes] WARNING: Could not load auth.middleware. ' +
    'All routes will respond 501 (fail-closed).'
  );
}

const { authenticate } = makeAuth(rawAuthMiddleware);

// ── Router ────────────────────────────────────────────────────────────────────
const router = express.Router();

// GET  /api/v1/websites
router.get('/', authenticate, ctrl.listWebsites);

// POST /api/v1/websites
router.post('/', authenticate, validateWebsite, ctrl.createWebsite);

// GET  /api/v1/websites/:websiteId
router.get('/:websiteId', authenticate, validateUUID('websiteId'), ctrl.getWebsite);

// PUT  /api/v1/websites/:websiteId
router.put('/:websiteId', authenticate, validateUUID('websiteId'), validateWebsite, ctrl.updateWebsite);

// DELETE /api/v1/websites/:websiteId
router.delete('/:websiteId', authenticate, validateUUID('websiteId'), ctrl.deleteWebsite);

// GET  /api/v1/websites/:websiteId/glossary
router.get('/:websiteId/glossary', authenticate, validateUUID('websiteId'), ctrl.listGlossaryTerms);

// POST /api/v1/websites/:websiteId/glossary
router.post(
  '/:websiteId/glossary',
  authenticate,
  validateUUID('websiteId'),
  validateGlossaryTerm,
  ctrl.addGlossaryTerm
);

// DELETE /api/v1/websites/:websiteId/glossary/:termId
router.delete(
  '/:websiteId/glossary/:termId',
  authenticate,
  validateUUID('websiteId'),
  validateUUID('termId'),
  ctrl.deleteGlossaryTerm
);

module.exports = router;

