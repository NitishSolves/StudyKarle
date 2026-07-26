const authService = require('../services/authService');
const tokenService = require('../services/tokenService');
const userModel = require('../models/userModel');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

module.exports = {
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
      throw ApiError.notFound('User not found');
    }
    return ApiResponse.ok(res, user);
  })
};
