const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const otpVerificationModel = require("../models/otpVerificationModel");
const ApiError = require("../utils/ApiError");

const SALT_ROUNDS = 10;

module.exports = {
  async signup(data) {
    const existing = await userModel.findByEmail(data.email);
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await userModel.create({
      name: data.name,
      email: data.email,
      passwordHash: passwordHash,
      role: "student",
    });
    return user;
  },

  async createUserFromOtp(otpData) {
    const existing = await userModel.findByEmail(otpData.email);
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const user = await userModel.create({
      name: otpData.name,
      email: otpData.email,
      passwordHash: otpData.passwordHash,
      role: "student",
    });

    return user;
  },

  async login(email, password) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      course: user.course,
      current_year: user.current_year,
      created_at: user.created_at,
    };
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw ApiError.badRequest("Current password is incorrect");
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userModel.updatePassword(userId, newHash);
  },
};
