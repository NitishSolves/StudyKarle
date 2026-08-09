const { body } = require("express-validator");

const requestOtpValidator = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Name must be 2-120 characters"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
];

const verifyOtpValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),
  body("otp")
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
];

const resendOtpValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),
];

module.exports = {
  requestOtpValidator: requestOtpValidator,
  verifyOtpValidator: verifyOtpValidator,
  resendOtpValidator: resendOtpValidator,
};
