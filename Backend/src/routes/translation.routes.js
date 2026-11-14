
const router = require("express").Router();

const authenticate = require("../middleware/auth.middleware");

const {
  translate,
  translatePublic,
  getHistory
} = require("../controllers/translation.controller");

// Public translation endpoint for website DOM translation
router.post("/public", translatePublic);

// Authenticated endpoints for dashboard / history
router.post("/", authenticate, translate);
router.get("/history", authenticate, getHistory);

module.exports = router;
