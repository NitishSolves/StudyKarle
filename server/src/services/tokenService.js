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

function setAuthCookie(res, token) {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    maxAge: cookieMaxAgeMs(),
    path: '/'
  });
}

function clearAuthCookie(res) {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    path: '/'
  });
}

module.exports = {
  signToken: signToken,
  verifyToken: verifyToken,
  setAuthCookie: setAuthCookie,
  clearAuthCookie: clearAuthCookie
};
