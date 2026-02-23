const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  db: {
    path: process.env.DB_PATH || path.resolve(__dirname, "../../data/contacts.db"),
  },

  mail: {
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.MAIL_FROM || "noreply@contactform.local",
    adminEmail: process.env.ADMIN_EMAIL || "admin@contactform.local",
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 10,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "*",
  },
};

module.exports = config;
