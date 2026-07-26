const express = require("express");
const authController = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const {
  signupValidator,
  loginValidator,
} = require("../validators/authValidators");

const router = express.Router();

router.post(
  "/signup",
  authLimiter,
  signupValidator,
  validate,
  authController.signup
);
router.post(
  "/login",
  authLimiter,
  loginValidator,
  validate,
  authController.login
);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

module.exports = router;
