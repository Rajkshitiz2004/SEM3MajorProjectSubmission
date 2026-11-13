/**
 * auth.routes.js
 *
 * Purpose:
 *   Authentication routes. Mount at /api/v1/auth in app.js.
 *
 * Controller contract expected (auth.controller exports):
 *   register(req, res, next)  — creates a new user account
 *   login(req, res, next)     — validates credentials, returns JWT
 *   me(req, res, next)        — returns the authenticated user's profile
 *
 * req.body shapes after validation:
 *   POST /register  { name: string, email: string (lower+trimmed), password: string }
 *   POST /login     { email: string, password: string }
 *   GET  /me        — no body; req.user populated by authenticate middleware
 *
 * Routes:
 *   POST /register  — public  — validateRegister → controller.register
 *   POST /login     — public  — validateLogin    → controller.login
 *   GET  /me        — private — authenticate     → controller.me
 *
 * Security:
 *   - Passwords are NEVER logged.
 *   - If authenticate is missing from auth.middleware the /me route responds
 *     501 (fail-closed) rather than being left open.
 */

'use strict';

const express = require('express');

const {
  bindHandlers,
  makeAuth,
  validateRegister,
  validateLogin,
} = require('./route.helpers');

// ── Teammate controller (names expected from auth.controller) ─────────────────
const CONTROLLER_NAME = 'auth.controller';
const CONTROLLER_EXPORTS = ['register', 'login', 'me'];

let rawController = {};
try {
  rawController = require('../controller/auth.controller');
} catch {
  console.warn(
    `[auth.routes] WARNING: Could not load "${CONTROLLER_NAME}". ` +
    'All auth endpoints will respond 501 until the controller is implemented.'
  );
}

const ctrl = bindHandlers(rawController, CONTROLLER_NAME, CONTROLLER_EXPORTS);

// ── Teammate auth middleware ───────────────────────────────────────────────────
let rawAuthMiddleware = {};
try {
  rawAuthMiddleware = require('../middleware/auth.middleware');
} catch {
  console.warn(
    '[auth.routes] WARNING: Could not load auth.middleware. ' +
    'Protected routes will respond 501 (fail-closed).'
  );
}

const { authenticate } = makeAuth(rawAuthMiddleware);

// ── Router ────────────────────────────────────────────────────────────────────
const router = express.Router();

// POST /api/v1/auth/register
router.post('/register', validateRegister, ctrl.register);

// POST /api/v1/auth/login
router.post('/login', validateLogin, ctrl.login);

// GET /api/v1/auth/me  (protected)
router.get('/me', authenticate, ctrl.me);

module.exports = router;
