import { request } from "./setup.js";

describe("Health & App Endpoints", () => {
  describe("GET /", () => {
    it("should respond with 418 status (I am a teapot)", async () => {
      const res = await request.get("/");

      expect(res.statusCode).toBe(418);
      expect(res.text).toContain("teapot");
    });
  });

  describe("GET /health", () => {
    it("should return healthy status", async () => {
      const res = await request.get("/health");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("status", "healthy");
      expect(res.body).toHaveProperty("timestamp");
      expect(res.body).toHaveProperty("environment");
    });

    it("should have valid timestamp format", async () => {
      const res = await request.get("/health");

      expect(res.statusCode).toBe(200);
      const timestamp = new Date(res.body.timestamp);
      expect(timestamp.toString()).not.toBe("Invalid Date");
    });
  });

  describe("404 Handling", () => {
    it("should return 404 for non-existent routes", async () => {
      const res = await request.get("/api/nonexistent/route");

      expect(res.statusCode).toBe(404);
    });

    it("should return 404 for undefined endpoints", async () => {
      const res = await request.get("/api/invalid");

      expect(res.statusCode).toBe(404);
    });
  });

  describe("CORS Configuration", () => {
    it("should allow localhost origin", async () => {
      const res = await request
        .get("/health")
        .set("Origin", "http://localhost:3000");

      expect(res.statusCode).toBe(200);
    });

    it("should handle OPTIONS requests", async () => {
      const res = await request
        .options("/api/auth/login")
        .set("Origin", "http://localhost:3000");

      expect([200, 204]).toContain(res.statusCode);
    });
  });

  describe("Request Methods", () => {
    it("should handle GET requests", async () => {
      const res = await request.get("/health");

      expect(res.statusCode).toBe(200);
    });

    it("should reject invalid methods on endpoints", async () => {
      const res = await request.delete("/health");

      expect([404, 405, 500]).toContain(res.statusCode);
    });
  });
});
