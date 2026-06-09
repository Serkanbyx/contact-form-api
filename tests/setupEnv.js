// Runs before any module is required by the test files.
// Set env vars here so config/env.js picks them up (dotenv does not override
// values that are already present in process.env).
process.env.NODE_ENV = "test";
process.env.DB_PATH = ":memory:";
process.env.ADMIN_API_KEY = "test-api-key";
process.env.RATE_LIMIT_MAX = "1000";
