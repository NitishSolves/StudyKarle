const express = require("express");
const searchController = require("../controllers/searchController");
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");
const { authenticatedActionLimiter } = require("../middleware/rateLimiter");
const { searchValidator } = require("../validators/noteValidators");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authenticatedActionLimiter,
  searchValidator,
  validate,
  searchController.search
);

module.exports = router;
