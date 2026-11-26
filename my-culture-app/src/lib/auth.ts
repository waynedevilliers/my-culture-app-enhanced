// Authentication utilities
// Provides JWT token generation, verification, and password hashing

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { JwtPayload, User } from "./types";

const BCRYPT_ROUNDS = 10;
const TOKEN_LIFETIME = "7d";
const MIN_SECRET_LENGTH = 32;

/**
 * Read the JWT secret. Fails closed: there is no default, so a missing or
 * weak secret stops token creation instead of signing with a known value.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be set to at least ${MIN_SECRET_LENGTH} characters`
    );
  }
  return secret;
}

/**
 * Generate JWT token
 */
export function generateToken(user: Pick<User, "id" | "email" | "role">): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, getJwtSecret(), {
    algorithm: "HS256",
    expiresIn: TOKEN_LIFETIME,
  });
}

/**
 * Verify JWT token. Returns null for any invalid, expired or unverifiable
 * token, including when the secret is not configured.
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    }) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string | null): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
    return null;
  }

  return parts[1];
}

/**
 * Create Authorization header
 */
export function createAuthHeader(token: string): string {
  return `Bearer ${token}`;
}
