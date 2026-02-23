# Contact Form API

A REST API that receives contact form submissions, stores them in SQLite, and sends admin email notifications via Nodemailer.

## Tech Stack

- **Express** — web framework
- **better-sqlite3** — synchronous SQLite driver
- **Nodemailer** — email delivery
- **express-rate-limit** — request throttling
- **Helmet** — HTTP security headers
- **CORS** — cross-origin resource sharing

## Project Structure

```
src/
├── config/
│   └── env.js            # Environment variables & configuration
├── db/
│   ├── database.js        # SQLite connection & migrations
│   └── contactRepository.js # Data access layer
├── middlewares/
│   ├── errorHandler.js    # Global error handler
│   ├── rateLimiter.js     # Rate limiting
│   └── validate.js        # Input validation
├── routes/
│   └── contactRoutes.js   # /api/contacts endpoints
├── services/
│   └── mailService.js     # Nodemailer email service
├── utils/
│   └── ApiError.js        # Custom error class
└── server.js              # App entry point
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your SMTP credentials. Leave `SMTP_USER` and `SMTP_PASS` empty to auto-generate an [Ethereal](https://ethereal.email/) test account (great for development).

### 3. Run the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server starts at `http://localhost:3000`.

## API Endpoints

### Health Check

```
GET /api/health
```

### Submit Contact

```
POST /api/contacts
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'd like to learn more about your services."
}
```

**Response (201):**

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

### List Contacts

```
GET /api/contacts?page=1&limit=20
```

### Get Single Contact

```
GET /api/contacts/:id
```

### Delete Contact

```
DELETE /api/contacts/:id
```

## Rate Limiting

The `POST /api/contacts` endpoint is rate-limited to **10 requests per 15 minutes** per IP. Configure via `.env`:

```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=10
```

## Flow

```
Frontend Form  →  POST /api/contacts  →  Validate Input
                                             ↓
                                     Save to SQLite DB
                                             ↓
                                  Send Admin Email (async)
                                             ↓
                                    Return JSON Response
```
