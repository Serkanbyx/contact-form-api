const rateLimit = require("express-rate-limit");
const config = require("../config/env");

const contactLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many submissions. Please try again later.",
  },
});

module.exports = { contactLimiter };
