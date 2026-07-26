require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] || fallback;
  if (value === undefined) {
    throw new Error('Missing required environment variable: ' + name);
  }
  return value;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  // Only fall back to a convenience default outside production. In
  // production, a missing JWT_SECRET must crash the server on boot rather
  // than silently sign tokens with a value anyone can read in this file.
  jwtSecret: required(
    "JWT_SECRET",
    process.env.NODE_ENV === "production" ? undefined : "dev_secret_change_me"
  ),
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

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 20,
  },

  isProduction: (process.env.NODE_ENV || "development") === "production",
};
