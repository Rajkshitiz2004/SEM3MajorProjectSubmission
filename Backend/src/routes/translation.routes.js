
const router = require("express").Router();

const authenticate = require("../middleware/auth.middleware");

const {
  translate,
  getHistory
} = require("../controllers/translation.controller");

// Authenticated endpoints for dashboard / history
router.post("/", authenticate, translate);
router.get("/history", authenticate, getHistory);

module.exports = router;
