const crypto = require("crypto");
const driveShareModel = require("../models/driveShareModel");
const ApiError = require("../utils/ApiError");

const TOKEN_BYTES = 32; // 32 bytes -> 43-char base64url string
const DEFAULT_EXPIRY_DAYS = 7;

function generateToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString("base64url");
}

function nowIso() {
  return new Date().toISOString();
}

function isExpired(share) {
  return !!share.expires_at && new Date(share.expires_at).getTime() <= Date.now();
}

function isRevoked(share) {
  return !!share.revoked_at;
}

function isActive(share) {
  return !isRevoked(share) && !isExpired(share);
}

// Returns the share only if the token is valid and the link has not been
// revoked or expired. Invalid/expired/revoked tokens all resolve to a 404 so
// the API never reveals whether a token merely does not exist.
async function resolveActiveToken(token) {
  if (!token || typeof token !== "string") {
    throw ApiError.notFound("Share link is invalid or has expired");
  }
  const share = await driveShareModel.findByToken(token);
  if (!share || !isActive(share)) {
    throw ApiError.notFound("Share link is invalid or has expired");
  }
  return share;
}

async function createShare({ driveId, createdBy, permission, expiresInDays }) {
  const permissionValue = permission === "preview" ? "preview" : "download";
  let expiresAt = null;
  if (Number.isFinite(expiresInDays) && expiresInDays > 0) {
    const ms =
      expiresInDays > 90 ? 90 : expiresInDays; // cap at 90 days
    expiresAt = new Date(Date.now() + ms * 24 * 60 * 60 * 1000).toISOString();
  }

  const share = await driveShareModel.create({
    driveId,
    token: generateToken(),
    permission: permissionValue,
    createdBy,
    expiresAt,
  });

  return {
    shareId: share.id,
    token: share.token,
    permission: share.permission,
    expiresAt: share.expires_at,
    createdAt: share.created_at,
  };
}

module.exports = {
  generateToken,
  isExpired,
  isRevoked,
  isActive,
  resolveActiveToken,
  createShare,
  DEFAULT_EXPIRY_DAYS,
};
