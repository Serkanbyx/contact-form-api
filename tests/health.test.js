const request = require("supertest");

jest.mock("../src/services/mailService", () => ({
  sendAdminNotification: jest.fn().mockResolvedValue({ messageId: "test" }),
}));

const app = require("../src/server");
const { closeDatabase } = require("../src/db/database");

afterAll(() => closeDatabase());

describe("GET /api/health", () => {
  it("returns ok status with a timestamp", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.timestamp).toBe("string");
  });
});

describe("unknown routes", () => {
  it("returns a 404 JSON error", async () => {
    const res = await request(app).get("/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
