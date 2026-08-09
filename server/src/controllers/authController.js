const authService = require("../services/authService");
const otpService = require("../services/otpService");
const tokenService = require("../services/tokenService");
const userModel = require("../models/userModel");
const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

module.exports = {
  requestOtp: asyncHandler(async function (req, res) {
    const { name, email, password } = req.body;

    const existing = await userModel.findByEmail(email);
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const passwordHash = await require("bcryptjs").hash(password, 10);

    // This awaits sendMail — response only returns after email is sent or fails
    const result = await otpService.requestOtp(email, name, passwordHash);

    return ApiResponse.ok(res, {
      message: "Verification code sent to your email",
      email: result.email,
      expiresAt: result.expiresAt,
    });
  }),

  verifyOtp: asyncHandler(async function (req, res) {
    const { email, otp } = req.body;

    const otpData = await otpService.verifyOtp(email, otp);
    const user = await authService.createUserFromOtp(otpData);

    await otpService.cleanup(email);

    const token = tokenService.signToken(user.id);
    tokenService.setAuthCookie(res, token);

    return ApiResponse.created(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }),

  resendOtp: asyncHandler(async function (req, res) {
    const { email } = req.body;

    const result = await otpService.resendOtp(email);

    return ApiResponse.ok(res, {
      message: "New verification code sent to your email",
      email: result.email,
      expiresAt: result.expiresAt,
      remainingAttempts: result.remainingAttempts,
    });
  }),

  signup: asyncHandler(async function (req, res) {
    const user = await authService.signup(req.body);
    const token = tokenService.signToken(user.id);
    tokenService.setAuthCookie(res, token);
    return ApiResponse.created(res, user);
  }),

  login: asyncHandler(async function (req, res) {
    const user = await authService.login(req.body.email, req.body.password);
    const token = tokenService.signToken(user.id);
    tokenService.setAuthCookie(res, token);
    return ApiResponse.ok(res, user);
  }),

  logout: asyncHandler(async function (req, res) {
    tokenService.clearAuthCookie(res);
    return ApiResponse.ok(res, { loggedOut: true });
  }),

  me: asyncHandler(async function (req, res) {
    const user = await userModel.findPublicById(req.user.id);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return ApiResponse.ok(res, user);
  }),
};
