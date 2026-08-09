const express = require("express");
const authController = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");
const {
  authLimiter,
  sensitiveActionLimiter,
} = require("../middleware/rateLimiter");
const {
  signupValidator,
  loginValidator,
} = require("../validators/authValidators");
const {
  requestOtpValidator,
  verifyOtpValidator,
  resendOtpValidator,
} = require("../validators/otpValidators");

const router = express.Router();

// OTP-based signup flow
router.post(
  "/request-otp",
  authLimiter,
  requestOtpValidator,
  validate,
  authController.requestOtp
);

router.post(
  "/verify-otp",
  sensitiveActionLimiter,
  verifyOtpValidator,
  validate,
  authController.verifyOtp
);

router.post(
  "/resend-otp",
  sensitiveActionLimiter,
  resendOtpValidator,
  validate,
  authController.resendOtp
);

// Legacy direct signup (kept for backward compatibility)
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
