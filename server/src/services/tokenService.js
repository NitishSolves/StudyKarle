const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

function cookieMaxAgeMs() {
  return 7 * 24 * 60 * 60 * 1000;
}

// Shared between set and clear so the cookie's attributes always match - a
// clearCookie call whose attributes differ from how the cookie was
// originally set (secure/sameSite/path) can silently fail to remove it.
function authCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    path: '/'
  };
}

function setAuthCookie(res, token) {
  res.cookie(env.cookieName, token, Object.assign({ maxAge: cookieMaxAgeMs() }, authCookieOptions()));
}

function clearAuthCookie(res) {
  res.clearCookie(env.cookieName, authCookieOptions());
}

module.exports = {
  signToken: signToken,
  verifyToken: verifyToken,
  setAuthCookie: setAuthCookie,
  clearAuthCookie: clearAuthCookie
};
