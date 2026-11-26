import { describe, expect, it } from "vitest";
import { readSeedAdminConfig } from "@/lib/seed/config";

describe("readSeedAdminConfig", () => {
  it("reads the password and email from the environment", () => {
    expect(
      readSeedAdminConfig({ SEED_ADMIN_PASSWORD: "a-long-password-123", SEED_ADMIN_EMAIL: "me@example.com" })
    ).toEqual({ email: "me@example.com", password: "a-long-password-123" });
  });

  it("uses the default admin email when none is given", () => {
    expect(readSeedAdminConfig({ SEED_ADMIN_PASSWORD: "a-long-password-123" }).email).toBe("admin@myculture.app");
  });

  it("refuses to seed without a password, instead of using a default", () => {
    expect(() => readSeedAdminConfig({})).toThrow("SEED_ADMIN_PASSWORD must be set");
  });

  it("refuses a short password", () => {
    expect(() => readSeedAdminConfig({ SEED_ADMIN_PASSWORD: "admin@123" })).toThrow("at least 12 characters");
  });
});
