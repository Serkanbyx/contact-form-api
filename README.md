# 📬 Contact Form API

A production-ready REST API that receives contact form submissions, stores them in SQLite, and sends admin email notifications via Nodemailer. Built with Express.js 5, designed with clean architecture and security best practices.

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

## Features

- **RESTful API Design**: Full CRUD endpoints for contact form submissions following REST conventions
- **SQLite Database**: Lightweight, zero-configuration database with WAL mode for optimal performance
- **Email Notifications**: Automatic admin email alerts on new submissions via Nodemailer (HTML & plain text)
- **Rate Limiting**: IP-based request throttling to prevent spam and abuse (10 requests per 15 minutes)
- **Input Validation**: Server-side validation for name, email format, and message length with sanitization
- **Security Headers**: Helmet.js integration for HTTP security headers protection
- **CORS Support**: Configurable cross-origin resource sharing for frontend integration
- **Pagination**: Built-in pagination for listing contact submissions
- **Graceful Shutdown**: Clean server shutdown with proper database connection closing
- **Ethereal Email Support**: Auto-generated test email accounts for development environment

## Live Demo

[🌐 View Live API](https://contact-form-api-woaf.onrender.com/)

> **Note:** The API is deployed on Render's free tier. The first request may take a few seconds due to cold start.

## Technologies

- **Node.js**: JavaScript runtime environment
- **Express.js v5**: Modern, fast web framework for Node.js
- **better-sqlite3**: Synchronous SQLite3 driver with WAL mode support
- **Nodemailer**: Email sending library with SMTP transport
- **Helmet**: HTTP security headers middleware
- **express-rate-limit**: IP-based rate limiting middleware
- **CORS**: Cross-Origin Resource Sharing middleware
- **dotenv**: Environment variable management
- **Nodemon**: Development auto-reload tool

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Local Development

1. **Clone the repository**

```bash
git clone https://github.com/Serkanbyx/s3.5_Contact-Form-API.git
cd s3.5_Contact-Form-API
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your SMTP credentials. Leave `SMTP_USER` and `SMTP_PASS` empty to auto-generate an [Ethereal](https://ethereal.email/) test account for development.

4. **Start the server**

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server starts at `http://localhost:3000`.

## Usage

1. Send a `POST` request to `/api/contacts` with a JSON body containing `name`, `email`, and `message` fields
2. The API validates the input, stores the submission in SQLite, and sends an email notification to the admin
3. Use `GET /api/contacts` to retrieve all submissions with pagination
4. Use `GET /api/contacts/:id` to retrieve a specific submission
5. Use `DELETE /api/contacts/:id` to remove a submission

## API Endpoints

### Health Check

```
GET /api/health
```

Returns the server status.

### Submit Contact Form

```
POST /api/contacts
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'd like to learn more about your services."
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Your message has been received. We will get back to you soon!",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello, I'd like to learn more about your services.",
    "ip_address": "::1",
    "created_at": "2026-02-23 12:00:00"
  }
}
```

### List All Contacts

```
GET /api/contacts?page=1&limit=20
```

Returns paginated list of all contact submissions.

### Get Single Contact

```
GET /api/contacts/:id
```

Returns a specific contact submission by ID.

### Delete Contact

```
DELETE /api/contacts/:id
```

Removes a contact submission from the database.

## How It Works?

### Request Flow

```
Client Request  →  POST /api/contacts  →  Rate Limiter Check
                                                 ↓
                                         Input Validation
                                                 ↓
                                        Save to SQLite DB
                                                 ↓
                                     Send Admin Email (async)
                                                 ↓
                                      Return JSON Response
```

### Database Schema

The API uses a single `contacts` table with the following structure:

```sql
CREATE TABLE contacts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  message    TEXT    NOT NULL,
  ip_address TEXT,
  created_at TEXT    DEFAULT (datetime('now'))
);
```

### Validation Rules

| Field     | Rules                                    |
| --------- | ---------------------------------------- |
| `name`    | Required, 2–100 characters               |
| `email`   | Required, valid email format, max 254 chars |
| `message` | Required, 10–5,000 characters             |

All fields are trimmed and email is converted to lowercase before storage.

### Email Service

- Uses Nodemailer with configurable SMTP transport
- Sends both HTML and plain text versions
- In development, auto-creates [Ethereal](https://ethereal.email/) test accounts
- Email sending is fire-and-forget — failures don't block the API response

## Customization

### Change Rate Limiting

Adjust rate limiting settings via environment variables:

```env
RATE_LIMIT_WINDOW_MS=900000   # 15 minutes in milliseconds
RATE_LIMIT_MAX=10              # Maximum requests per window
```

### Configure CORS

Set allowed origins in your `.env` file:

```env
CORS_ORIGIN=*                  # Allow all origins
CORS_ORIGIN=https://example.com  # Restrict to specific domain
```

### SMTP Configuration

Configure your own SMTP provider:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

## Project Structure

```
src/
├── config/
│   └── env.js                # Environment variables & configuration
├── db/
│   ├── database.js           # SQLite connection & migrations
│   └── contactRepository.js  # Data access layer (CRUD)
├── middlewares/
│   ├── errorHandler.js       # Global error handler
│   ├── rateLimiter.js        # Rate limiting middleware
│   └── validate.js           # Input validation
├── routes/
│   └── contactRoutes.js      # /api/contacts endpoints
├── services/
│   └── mailService.js        # Nodemailer email service
├── utils/
│   └── ApiError.js           # Custom error class
└── server.js                 # App entry point
```

## Features in Detail

### Completed Features

- ✅ RESTful CRUD API for contact submissions
- ✅ SQLite database with WAL mode
- ✅ Async email notifications with Nodemailer
- ✅ IP-based rate limiting
- ✅ Input validation and sanitization
- ✅ Security headers with Helmet
- ✅ CORS configuration
- ✅ Pagination support
- ✅ Graceful shutdown handling
- ✅ Ethereal email for development testing
- ✅ Render.com deployment configuration

### Future Features

- [ ] Authentication for admin endpoints (JWT)
- [ ] Dashboard UI for viewing submissions
- [ ] Webhook support for third-party integrations
- [ ] File attachment support
- [ ] Spam detection with honeypot fields

## Contributing

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feat/amazing-feature`)
3. **Commit** your changes using conventional commits:
   - `feat:` — new feature
   - `fix:` — bug fix
   - `refactor:` — code refactoring
   - `docs:` — documentation changes
   - `chore:` — maintenance tasks
4. **Push** to the branch (`git push origin feat/amazing-feature`)
5. **Open** a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Developer

**Serkanby**

- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)
- GitHub: [@Serkanbyx](https://github.com/Serkanbyx)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)

## Acknowledgments

- [Express.js](https://expressjs.com/) — Fast, unopinionated web framework
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — The fastest and simplest SQLite3 library
- [Nodemailer](https://nodemailer.com/) — Email sending for Node.js
- [Ethereal Email](https://ethereal.email/) — Fake SMTP service for testing
- [Render](https://render.com/) — Cloud hosting platform
- [Helmet](https://helmetjs.github.io/) — Security middleware for Express

## Contact

- [Open an Issue](https://github.com/Serkanbyx/s3.5_Contact-Form-API/issues)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)
- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)

---

⭐ If you like this project, don't forget to give it a star!
