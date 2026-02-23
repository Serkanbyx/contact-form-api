const { Router } = require("express");
const contactRepository = require("../db/contactRepository");
const { sendAdminNotification } = require("../services/mailService");
const { validateContact } = require("../middlewares/validate");
const { contactLimiter } = require("../middlewares/rateLimiter");

const router = Router();

// POST /api/contacts — submit a new contact message
router.post("/", contactLimiter, validateContact, async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    const ipAddress = req.ip;

    const contact = contactRepository.create({ name, email, message, ipAddress });

    // Fire-and-forget: don't let email failure block the response
    sendAdminNotification({ name, email, message }).catch((err) => {
      console.error("Failed to send admin notification:", err.message);
    });

    res.status(201).json({
      success: true,
      message: "Your message has been received. We will get back to you soon!",
      data: contact,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts — list all contacts (admin endpoint)
router.get("/", (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const result = contactRepository.findAll({ page, limit });

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts/:id — get a single contact
router.get("/:id", (req, res, next) => {
  try {
    const contact = contactRepository.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found.",
      });
    }

    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/contacts/:id — delete a contact
router.delete("/:id", (req, res, next) => {
  try {
    const deleted = contactRepository.deleteById(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Contact not found.",
      });
    }

    res.json({ success: true, message: "Contact deleted successfully." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
