import { afterEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import {
  comparePassword,
  extractTokenFromHeader,
  generateToken,
  getJwtSecret,
  hashPassword,
  verifyToken,
} from "@/lib/auth";

const USER = { id: 7, email: "admin@example.com", role: "ADMIN" as const };

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getJwtSecret", () => {
  it("returns the configured secret", () => {
    expect(getJwtSecret()).toBe(process.env.JWT_SECRET);
  });

  it("throws when the secret is missing, instead of using a default", () => {
    vi.stubEnv("JWT_SECRET", "");
    expect(() => getJwtSecret()).toThrow("JWT_SECRET must be set");
  });

  it("throws when the secret is too short", () => {
    vi.stubEnv("JWT_SECRET", "short");
    expect(() => getJwtSecret()).toThrow("at least 32 characters");
  });
});

describe("generateToken and verifyToken", () => {
  it("round-trips the user id, email and role", () => {
    const decoded = verifyToken(generateToken(USER));
    expect(decoded).toMatchObject({ userId: 7, email: "admin@example.com", role: "ADMIN" });
  });

  it("sets a 7 day expiry", () => {
    const decoded = verifyToken(generateToken(USER))!;
    expect(decoded.exp - decoded.iat).toBe(7 * 24 * 60 * 60);
  });

  it("refuses to sign when the secret is missing", () => {
    vi.stubEnv("JWT_SECRET", "");
    expect(() => generateToken(USER)).toThrow("JWT_SECRET must be set");
  });

  it("rejects a token signed with a different secret", () => {
    const forged = jwt.sign({ userId: 1, email: "x@example.com", role: "SUPER_ADMIN" }, "your-secret-key-change-in-production");
    expect(verifyToken(forged)).toBeNull();
  });

  it("rejects an unsigned token", () => {
    const unsigned = jwt.sign({ userId: 1, email: "x@example.com", role: "SUPER_ADMIN" }, "", { algorithm: "none" });
    expect(verifyToken(unsigned)).toBeNull();
  });

  it("rejects an expired token", () => {
    const expired = jwt.sign({ userId: 1, email: "x@example.com", role: "ADMIN" }, getJwtSecret(), { expiresIn: -10 });
    expect(verifyToken(expired)).toBeNull();
  });

  it("returns null instead of throwing when the secret is missing", () => {
    const token = generateToken(USER);
    vi.stubEnv("JWT_SECRET", "");
    expect(verifyToken(token)).toBeNull();
  });

  it("returns null for garbage", () => {
    expect(verifyToken("not.a.token")).toBeNull();
  });
});

describe("hashPassword and comparePassword", () => {
  it("matches the right password and rejects a wrong one", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(hash).not.toContain("correct horse battery");
    await expect(comparePassword("correct horse battery", hash)).resolves.toBe(true);
    await expect(comparePassword("wrong", hash)).resolves.toBe(false);
  });
});

describe("extractTokenFromHeader", () => {
  it.each([
    ["Bearer abc.def.ghi", "abc.def.ghi"],
    [undefined, null],
    [null, null],
    ["", null],
    ["Bearer", null],
    ["Bearer ", null],
    ["Basic abc", null],
    ["Bearer a b", null],
  ])("%p -> %p", (header, expected) => {
    expect(extractTokenFromHeader(header)).toBe(expected);
  });
});
