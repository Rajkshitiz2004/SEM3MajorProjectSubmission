
const router = require("express").Router();

const authenticate = require("../middleware/auth.middleware");

const {
  createWebsite,
  getWebsites
} = require("../controllers/website.controller");

router.post("/", authenticate, createWebsite);
router.get("/", authenticate, getWebsites);

module.exports = router;
