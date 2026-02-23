const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const config = require("./config/env");
const swaggerSpec = require("./config/swagger");
const { getDatabase, closeDatabase } = require("./db/database");
const contactRoutes = require("./routes/contactRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// ── Security & parsing ──────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https://validator.swagger.io"],
      },
    },
  })
);
app.use(cors({ origin: config.cors.origin }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: false }));

// ── Welcome page ────────────────────────────────────
app.get("/", (_req, res) => {
  const version = require("../package.json").version;
  res.send(getWelcomePage(version));
});

// ── Swagger UI ──────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Contact Form API — Docs",
  customCss: ".swagger-ui .topbar { display: none }",
}));

app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     description: Returns the current server status and timestamp.
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-02-23T12:00:00.000Z"
 */
// ── Health check ────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────
app.use("/api/contacts", contactRoutes);

// ── 404 fallback ────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found." });
});

// ── Global error handler ────────────────────────────
app.use(errorHandler);

// ── Start ───────────────────────────────────────────
function start() {
  getDatabase();
  console.log("✅ Database connected");

  app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
  });
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down gracefully...");
  closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", () => {
  closeDatabase();
  process.exit(0);
});

start();

function getWelcomePage(version) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contact Form API</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      background: linear-gradient(160deg, #0f2027 0%, #203a43 40%, #2c5364 100%);
      color: #e2e8f0;
      overflow: hidden;
    }

    body::before {
      content: "";
      position: fixed;
      top: -120px;
      right: -80px;
      width: 380px;
      height: 380px;
      background: radial-gradient(circle, rgba(45, 212, 191, 0.12) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    }

    body::after {
      content: "";
      position: fixed;
      bottom: -100px;
      left: -60px;
      width: 320px;
      height: 320px;
      background: radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    }

    .envelope-deco {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      height: 400px;
      opacity: 0.03;
      pointer-events: none;
    }

    .envelope-deco::before {
      content: "";
      position: absolute;
      inset: 0;
      border: 3px solid #2dd4bf;
      border-radius: 12px;
    }

    .envelope-deco::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 200px;
      border-left: 300px solid transparent;
      border-right: 300px solid transparent;
      border-top: 200px solid #2dd4bf;
      opacity: 0.5;
    }

    .container {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 3rem 2rem;
      max-width: 520px;
      width: 90%;
      background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
      border: 1px solid rgba(45, 212, 191, 0.15);
      border-radius: 20px;
      backdrop-filter: blur(12px);
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }

    .icon {
      width: 64px;
      height: 44px;
      margin: 0 auto 1.5rem;
      position: relative;
    }

    .icon::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #2dd4bf, #14b8a6);
      border-radius: 6px;
      box-shadow: 0 4px 16px rgba(45, 212, 191, 0.3);
    }

    .icon::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 22px;
      border-left: 32px solid transparent;
      border-right: 32px solid transparent;
      border-top: 22px solid rgba(0, 0, 0, 0.15);
      border-radius: 6px 6px 0 0;
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      background: linear-gradient(135deg, #2dd4bf, #5eead4, #99f6e4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: none;
      margin-bottom: 0.5rem;
    }

    .version {
      display: inline-block;
      font-size: 0.85rem;
      color: #94a3b8;
      background: rgba(45, 212, 191, 0.08);
      padding: 0.2rem 0.8rem;
      border-radius: 20px;
      border: 1px solid rgba(45, 212, 191, 0.12);
      margin-bottom: 0.6rem;
    }

    .desc {
      font-size: 0.92rem;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .links {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 2.5rem;
    }

    .links a {
      display: block;
      text-decoration: none;
      padding: 0.8rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      letter-spacing: 0.3px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-primary {
      background: linear-gradient(135deg, #14b8a6, #2dd4bf);
      color: #042f2e;
      box-shadow: 0 4px 16px rgba(45, 212, 191, 0.25);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(45, 212, 191, 0.35);
    }

    .btn-secondary {
      background: transparent;
      color: #5eead4;
      border: 1px solid rgba(45, 212, 191, 0.25);
    }

    .btn-secondary:hover {
      background: rgba(45, 212, 191, 0.08);
      border-color: rgba(45, 212, 191, 0.4);
      transform: translateY(-2px);
    }

    .sign {
      font-size: 0.82rem;
      color: #64748b;
    }

    .sign a {
      color: #2dd4bf;
      text-decoration: none;
      transition: color 0.2s;
    }

    .sign a:hover {
      color: #5eead4;
    }

    @media (max-width: 480px) {
      .container { padding: 2rem 1.2rem; }
      h1 { font-size: 1.5rem; }
    }
  </style>
</head>
<body>
  <div class="envelope-deco"></div>
  <div class="container">
    <div class="icon"></div>
    <h1>Contact Form API</h1>
    <p class="version">v${version}</p>
    <p class="desc">REST API for contact form submissions with email notifications and SQLite storage.</p>
    <div class="links">
      <a href="/api-docs" class="btn-primary">API Documentation</a>
      <a href="/api/health" class="btn-secondary">Health Check</a>
      <a href="/api/contacts" class="btn-secondary">View Contacts</a>
    </div>
    <footer class="sign">
      Created by
      <a href="https://serkanbayraktar.com/" target="_blank" rel="noopener noreferrer">Serkanby</a>
      |
      <a href="https://github.com/Serkanbyx" target="_blank" rel="noopener noreferrer">Github</a>
    </footer>
  </div>
</body>
</html>`;
}

module.exports = app;
