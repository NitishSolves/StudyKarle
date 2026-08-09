const rateLimit = require("express-rate-limit");

/**
 * All thresholds are configurable via environment variables so limits can be
 * tuned per-environment without a code change. Sensible defaults are used
 * when a variable is not set.
 */
function int(name, fallback) {
  const value = parseInt(process.env[name], 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function accountAwareKey(req) {
  // Combine client IP with the account identifier (email) when present so a
  // single account can't be hammered from many IPs, and a single IP can't
  // brute-force many accounts, without needing a hard account lockout.
  const email =
    req.body && req.body.email
      ? String(req.body.email).toLowerCase().trim()
      : "";
  return email ? req.ip + ":" + email : req.ip;
}

// Strict limiter for authentication actions: login, signup.
// skipSuccessfulRequests means legitimate successful logins don't count
// against the window, so only repeated failures trigger backoff.
const authLimiter = rateLimit({
  windowMs: int("AUTH_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  max: int("AUTH_RATE_LIMIT_MAX", 8),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: accountAwareKey,
  message: {
    success: false,
    message:
      "Too many attempts. Please wait a few minutes before trying again.",
  },
});

// Even stricter limiter reserved for the most sensitive account-recovery
// style flows (password reset request, OTP request/verify) if/when those
// routes are added.
const sensitiveActionLimiter = rateLimit({
  windowMs: int("SENSITIVE_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  max: int("SENSITIVE_RATE_LIMIT_MAX", 5),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: accountAwareKey,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

// Moderate limiter for public, unauthenticated read endpoints.
const publicApiLimiter = rateLimit({
  windowMs: int("PUBLIC_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  max: int("PUBLIC_RATE_LIMIT_MAX", 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
});

// Looser limiter for logged-in user actions (browsing notes, saving,
// searching, admin actions). Keyed by user id when available so it scales
// per-account rather than per-IP (useful behind shared NAT/office IPs).
const authenticatedActionLimiter = rateLimit({
  windowMs: int("USER_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  max: int("USER_RATE_LIMIT_MAX", 600),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: function (req) {
    return req.user && req.user.id ? "user:" + req.user.id : req.ip;
  },
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
});

module.exports = {
  authLimiter: authLimiter,
  sensitiveActionLimiter: sensitiveActionLimiter,
  publicApiLimiter: publicApiLimiter,
  authenticatedActionLimiter: authenticatedActionLimiter,
};
