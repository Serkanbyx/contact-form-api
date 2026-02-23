const ApiError = require("../utils/ApiError");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContact(req, res, next) {
  const { name, email, message } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name is required and must be at least 2 characters.");
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    errors.push("A valid email address is required.");
  }

  if (!message || typeof message !== "string" || message.trim().length < 10) {
    errors.push("Message is required and must be at least 10 characters.");
  }

  if (name && name.length > 100) {
    errors.push("Name must not exceed 100 characters.");
  }

  if (email && email.length > 254) {
    errors.push("Email must not exceed 254 characters.");
  }

  if (message && message.length > 5000) {
    errors.push("Message must not exceed 5000 characters.");
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest(errors.join(" ")));
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.message = message.trim();

  next();
}

module.exports = { validateContact };
