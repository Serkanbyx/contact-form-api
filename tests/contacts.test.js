const request = require("supertest");

const mockSendAdminNotification = jest.fn().mockResolvedValue({ messageId: "test" });
jest.mock("../src/services/mailService", () => ({
  sendAdminNotification: (...args) => mockSendAdminNotification(...args),
}));

const app = require("../src/server");
const { closeDatabase } = require("../src/db/database");

const API_KEY = "test-api-key";

const validPayload = {
  name: "John Doe",
  email: "John@Example.com",
  message: "Hello, I'd like to learn more about your services.",
};

afterAll(() => closeDatabase());

describe("POST /api/contacts", () => {
  it("creates a contact with valid input and normalizes the email", async () => {
    const res = await request(app).post("/api/contacts").send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeGreaterThan(0);
    expect(res.body.data.email).toBe("john@example.com");
    expect(mockSendAdminNotification).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid input with a 400", async () => {
    const res = await request(app)
      .post("/api/contacts")
      .send({ name: "A", email: "not-an-email", message: "short" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/contacts (protected)", () => {
  it("returns 401 without an API key", async () => {
    const res = await request(app).get("/api/contacts");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns a paginated list with a valid API key", async () => {
    const res = await request(app)
      .get("/api/contacts")
      .set("x-api-key", API_KEY);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 20 });
  });
});

describe("GET /api/contacts/:id (protected)", () => {
  it("returns 401 without an API key", async () => {
    const res = await request(app).get("/api/contacts/1");
    expect(res.status).toBe(401);
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app)
      .get("/api/contacts/999999")
      .set("x-api-key", API_KEY);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("DELETE /api/contacts/:id (protected)", () => {
  it("returns 401 without an API key", async () => {
    const res = await request(app).delete("/api/contacts/1");
    expect(res.status).toBe(401);
  });

  it("deletes an existing contact with a valid API key", async () => {
    const created = await request(app).post("/api/contacts").send(validPayload);
    const { id } = created.body.data;

    const res = await request(app)
      .delete(`/api/contacts/${id}`)
      .set("x-api-key", API_KEY);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const after = await request(app)
      .get(`/api/contacts/${id}`)
      .set("x-api-key", API_KEY);
    expect(after.status).toBe(404);
  });
});
