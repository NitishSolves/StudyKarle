require("dotenv").config();

function required(name, fallback) {
  const value = process.env[name] || fallback;
  if (value === undefined) {
    throw new Error("Missing required environment variable: " + name);
  }
  return value;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  jwtSecret: required("JWT_SECRET", "dev_secret_change_me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  cookieName: process.env.COOKIE_NAME || "studykarle_token",

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || "",
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/oauth2callback",
    driveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || "",
  },

  // Google Drive sync scheduler. Interval of 0 disables the periodic run
  // (the initial sync on boot still runs when DRIVE_SYNC_ON_START !== "false").
  driveSync: {
    intervalMs: Number(process.env.DRIVE_SYNC_INTERVAL_MS) || 0,
    onStart: process.env.DRIVE_SYNC_ON_START !== "false",
  },

  // FIXED: Proper default value with angle brackets
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "StudyKarle <onboarding@resend.dev>",

  otp: {
    expiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES) || 10,
    maxResendAttempts: Number(process.env.OTP_MAX_RESEND) || 3,
  },

  isProduction: (process.env.NODE_ENV || "development") === "production",
};
