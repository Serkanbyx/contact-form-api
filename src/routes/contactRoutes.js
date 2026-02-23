const { Router } = require("express");
const contactRepository = require("../db/contactRepository");
const { sendAdminNotification } = require("../services/mailService");
const { validateContact } = require("../middlewares/validate");
const { contactLimiter } = require("../middlewares/rateLimiter");

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         message:
 *           type: string
 *           example: "Hello, I'd like to learn more about your services."
 *         ip_address:
 *           type: string
 *           example: "::1"
 *         created_at:
 *           type: string
 *           example: "2026-02-23 12:00:00"
 *     ContactInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - message
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 254
 *           example: "john@example.com"
 *         message:
 *           type: string
 *           minLength: 10
 *           maxLength: 5000
 *           example: "Hello, I'd like to learn more about your services."
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 20
 *         total:
 *           type: integer
 *           example: 50
 *         totalPages:
 *           type: integer
 *           example: 3
 */

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: Submit a new contact message
 *     tags: [Contacts]
 *     description: Receives a contact form submission, validates the input, stores it in the database, and sends an admin email notification asynchronously.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactInput'
 *     responses:
 *       201:
 *         description: Contact message received successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Your message has been received. We will get back to you soon!"
 *                     data:
 *                       $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many requests — rate limit exceeded
 */
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

/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: List all contacts
 *     tags: [Contacts]
 *     description: Returns a paginated list of all contact form submissions ordered by newest first.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Paginated list of contacts
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Contact'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
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

/**
 * @swagger
 * /api/contacts/{id}:
 *   get:
 *     summary: Get a single contact
 *     tags: [Contacts]
 *     description: Returns a specific contact form submission by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Contact'
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/contacts/{id}:
 *   delete:
 *     summary: Delete a contact
 *     tags: [Contacts]
 *     description: Permanently removes a contact form submission from the database.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Contact deleted successfully."
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
