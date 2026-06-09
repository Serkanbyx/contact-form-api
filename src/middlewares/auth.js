const crypto = require("crypto");
const config = require("../config/env");
const ApiError = require("../utils/ApiError");

/**
 * Compares two strings in constant time to avoid timing attacks.
 * Returns false when lengths differ instead of leaking via early exit.
 */
function safeEqual(a, b) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

/**
 * Protects admin-only endpoints with an API key passed via the `x-api-key`
 * header. When no key is configured, access is denied by default so that
 * sensitive data is never exposed unintentionally.
 */
function requireApiKey(req, _res, next) {
  const expectedKey = config.admin.apiKey;

  if (!expectedKey) {
    return next(ApiError.internal("Admin API key is not configured on the server."));
  }

  const providedKey = req.get("x-api-key") || "";

  if (!providedKey || !safeEqual(providedKey, expectedKey)) {
    return next(ApiError.unauthorized("A valid API key is required."));
  }

  next();
}

module.exports = { requireApiKey };
