const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const config = require("./config/env");
const { getDatabase, closeDatabase } = require("./db/database");
const contactRoutes = require("./routes/contactRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// ── Security & parsing ──────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.cors.origin }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: false }));

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

module.exports = app;
