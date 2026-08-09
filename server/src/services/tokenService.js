const jwt = require("jsonwebtoken");
const env = require("../config/env");

function signToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

function cookieMaxAgeMs() {
  return 7 * 24 * 60 * 60 * 1000;
}

// The frontend (Vercel) and API (Render) are cross-site, so modern browsers
// block the cookie unless it is partitioned (CHIPS). cookie@0.4.1 bundled with
// Express 4.18.2 does not support the `partitioned` option, so we serialize the
// Set-Cookie header manually. `Partitioned` requires `Secure`, so it is only
// applied in production (HTTPS) contexts.
function buildAuthCookie(value, maxAgeSeconds) {
  const parts = [`${env.cookieName}=${value}`, "Path=/", "HttpOnly"];
  if (maxAgeSeconds != null) {
    parts.push(`Max-Age=${maxAgeSeconds}`);
  }
  if (env.isProduction) {
    parts.push("SameSite=None", "Secure", "Partitioned");
  } else {
    parts.push("SameSite=Lax");
  }
  return parts.join("; ");
}

function setAuthCookie(res, token) {
  res.append(
    "Set-Cookie",
    buildAuthCookie(token, Math.floor(cookieMaxAgeMs() / 1000))
  );
}

function clearAuthCookie(res) {
  res.append(
    "Set-Cookie",
    `${buildAuthCookie("", 0)}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );
}

module.exports = {
  signToken,
  verifyToken,
  setAuthCookie,
  clearAuthCookie,
};
