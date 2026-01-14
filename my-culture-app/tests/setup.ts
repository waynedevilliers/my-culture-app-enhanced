// Test setup utilities
// Configure test environment and provide helper functions

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

/**
 * Clean up test data after tests
 */
export async function cleanupTestData() {
  try {
    // Delete in correct order (respect foreign keys)
    await prisma.certificateRecipient.deleteMany({});
    await prisma.certificate.deleteMany({});
    await prisma.imageGallery.deleteMany({});
    await prisma.image.deleteMany({});
    await prisma.blog.deleteMany({});
    await prisma.gallery.deleteMany({});
    await prisma.eventCategory.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.location.deleteMany({});
    await prisma.organization.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.subscriber.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (error) {
    console.error("Cleanup error:", error);
  }
}

/**
 * Create test user
 */
export async function createTestUser(data = {}) {
  const { hashPassword } = await import("@/lib/auth");
  
  return prisma.user.create({
    data: {
      email: "test@example.com",
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

/**
 * Create admin test user
 */
export async function createAdminUser(data = {}) {
  const { hashPassword } = await import("@/lib/auth");
  
  return prisma.user.create({
    data: {
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      password: await hashPassword("password123"),
      role: "ADMIN",
      verified: true,
      newsletter: false,
      ...data,
    },
  });
}

/**
 * Get auth token for test user
 */
export async function getTestToken(user: any) {
  const { generateToken } = await import("@/lib/auth");
  return generateToken(user);
}

/**
 * Mock fetch for API testing
 */
export async function fetchApi(url: string, options: RequestInit = {}) {
  const baseUrl = process.env.VITEST_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();
  return {
    status: response.status,
    body: data,
    headers: response.headers,
  };
}

export { describe, it, expect, beforeAll, afterAll, beforeEach };
