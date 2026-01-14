// Authentication endpoint tests

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "vitest";
import { prisma } from "@/lib/prisma";
import { generateToken, hashPassword } from "@/lib/auth";

/**
 * Clean up test data
 */
async function cleanupTestData() {
  try {
    await prisma.user.deleteMany({});
  } catch (error) {
    console.error("Cleanup error:", error);
  }
}

/**
 * Create test user
 */
async function createTestUser(data = {}) {
  return prisma.user.create({
    data: {
      email: "existing@example.com",
      firstName: "Test",
      lastName: "User",
      password: await hashPassword("password123"),
      role: "USER",
      verified: false,
      newsletter: false,
      ...data,
    },
  });
}

describe("Authentication Endpoints", () => {
  beforeAll(async () => {
    // Clean up before running tests
    await cleanupTestData();
  });

  afterAll(async () => {
    // Clean up after tests
    await cleanupTestData();
  });

  beforeEach(async () => {
    // Clean between each test
    await cleanupTestData();
  });

  // ===== REGISTRATION TESTS =====
  describe("POST /api/auth/register", () => {
    it("should register a new user with valid data", async () => {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "newuser@example.com",
          firstName: "John",
          lastName: "Doe",
          password: "password123",
          confirmPassword: "password123",
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("token");
      expect(data.data.user.email).toBe("newuser@example.com");
      expect(data.data.user.firstName).toBe("John");
    });

    it("should reject registration with invalid email", async () => {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalid",
          firstName: "John",
          lastName: "Doe",
          password: "password123",
          confirmPassword: "password123",
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should reject registration with password mismatch", async () => {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "newuser@example.com",
          firstName: "John",
          lastName: "Doe",
          password: "password123",
          confirmPassword: "password456",
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should reject short password", async () => {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "newuser@example.com",
          firstName: "John",
          lastName: "Doe",
          password: "short",
          confirmPassword: "short",
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should reject duplicate email", async () => {
      // Create existing user first
      await createTestUser({ email: "duplicate@example.com" });

      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "duplicate@example.com",
          firstName: "John",
          lastName: "Doe",
          password: "password123",
          confirmPassword: "password123",
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.success).toBe(false);
    });

    it("should not return password in response", async () => {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "newuser@example.com",
          firstName: "John",
          lastName: "Doe",
          password: "password123",
          confirmPassword: "password123",
        }),
      });

      const data = await res.json();

      expect(data.data.user).not.toHaveProperty("password");
    });
  });

  // ===== LOGIN TESTS =====
  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      // Create test user first
      await createTestUser();

      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "existing@example.com",
          password: "password123",
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("token");
      expect(data.data.user.email).toBe("existing@example.com");
    });

    it("should reject login with invalid email", async () => {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "password123",
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("should reject login with wrong password", async () => {
      // Create test user first
      await createTestUser();

      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "existing@example.com",
          password: "wrongpassword",
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("should reject login with invalid email format", async () => {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalid",
          password: "password123",
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should not return password in response", async () => {
      // Create test user first
      await createTestUser();

      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "existing@example.com",
          password: "password123",
        }),
      });

      const data = await res.json();

      expect(data.data.user).not.toHaveProperty("password");
    });
  });

  // ===== GET ME TESTS =====
  describe("GET /api/auth/me", () => {
    it("should return current user profile with valid token", async () => {
      // Create test user
      const user = await createTestUser();
      const token = generateToken(user);

      const res = await fetch("http://localhost:3000/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe("existing@example.com");
      expect(data.data.firstName).toBe("Test");
    });

    it("should reject request without token", async () => {
      const res = await fetch("http://localhost:3000/api/auth/me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("should reject request with invalid token", async () => {
      const res = await fetch("http://localhost:3000/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer invalid.token.here",
        },
      });

      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("should not return password in response", async () => {
      // Create test user
      const user = await createTestUser();
      const token = generateToken(user);

      const res = await fetch("http://localhost:3000/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      expect(data.data).not.toHaveProperty("password");
    });

    it("should return user with correct role", async () => {
      // Create test user
      const user = await createTestUser({ role: "ADMIN" });
      const token = generateToken(user);

      const res = await fetch("http://localhost:3000/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      expect(data.data.role).toBe("ADMIN");
    });
  });
});
