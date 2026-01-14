import { request } from "./setup.js";
import { User, Event } from "../db.js";

describe("Event Endpoints", () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Create and login a user
    const registerRes = await request.post("/api/auth/register").send({
      firstName: "Event",
      lastName: "Admin",
      email: "event@example.com",
      password: "password123",
      newsletter: false,
    });

    userId = registerRes.body.id;

    const loginRes = await request.post("/api/auth/login").send({
      email: "event@example.com",
      password: "password123",
    });

    authToken = loginRes.body.token;
  });

  beforeEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterAll(async () => {
    await Event.destroy({ truncate: true, cascade: true });
    await User.destroy({ truncate: true, cascade: true });
  });

  describe("GET /api/events", () => {
    it("should list all events with correct response format", async () => {
      const res = await request.get("/api/events");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("results");
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body).toHaveProperty("totalCount");
      expect(res.body).toHaveProperty("currentPage");
    });

    it("should support pagination parameters", async () => {
      const res = await request
        .get("/api/events")
        .query({ page: 1, limit: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("results");
    });
  });

  describe("POST /api/events", () => {
    it("should return 403 when user without admin role tries to create event", async () => {
      const eventData = {
        title: "Community Event",
        description: "A great community event",
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 172800000).toISOString(),
        location: "Community Center",
        capacity: 100,
      };

      const res = await request
        .post("/api/events")
        .set("Authorization", `Bearer ${authToken}`)
        .send(eventData);

      // Regular users cannot create events
      expect(res.statusCode).toBe(403);
    });

    it("should return 401 without authentication", async () => {
      const res = await request.post("/api/events").send({
        title: "Unauthorized Event",
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /api/events/:id", () => {
    it("should return null for non-existent event", async () => {
      const res = await request.get("/api/events/99999");

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeNull();
    });
  });

  describe("Authorization", () => {
    it("should require authentication for PUT operations", async () => {
      const res = await request.put("/api/events/1").send({
        title: "Updated Title",
      });

      expect(res.statusCode).toBe(401);
    });

    it("should require authentication for DELETE operations", async () => {
      const res = await request.delete("/api/events/1");

      expect(res.statusCode).toBe(401);
    });
  });
});
