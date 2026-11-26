import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { generateToken } from "@/lib/auth";
import type { Role } from "@/lib/types";

const tokenFor = (role: Role, id = 5) =>
  generateToken({ id, email: `${role.toLowerCase()}@example.com`, role });

const makeRequest = (path: string, headers: Record<string, string> = {}) =>
  new NextRequest(new URL(path, "http://localhost:3000"), { headers });

/** Headers the proxy forwards to the route handler. */
const forwarded = (res: Response, name: string) =>
  res.headers.get(`x-middleware-request-${name}`);

describe("proxy", () => {
  describe("public routes", () => {
    it.each(["/api/health", "/api/auth/login"])("lets %s through without a token", (path) => {
      const res = proxy(makeRequest(path));
      expect(res.status).toBe(200);
      expect(res.headers.get("x-middleware-next")).toBe("1");
    });

    it("strips user headers a client tries to send", () => {
      const res = proxy(
        makeRequest("/api/health", { "x-user-id": "1", "x-user-role": "SUPER_ADMIN", "x-user-email": "x@example.com" })
      );
      expect(forwarded(res, "x-user-id")).toBeNull();
      expect(forwarded(res, "x-user-role")).toBeNull();
      expect(forwarded(res, "x-user-email")).toBeNull();
    });
  });

  describe("protected routes", () => {
    it("returns 401 without a token", async () => {
      const res = proxy(makeRequest("/api/auth/me"));
      expect(res.status).toBe(401);
      await expect(res.json()).resolves.toEqual({ error: "Unauthorized - Missing token" });
    });

    it("returns 401 with an invalid token", () => {
      const res = proxy(makeRequest("/api/auth/me", { Authorization: "Bearer not.a.token" }));
      expect(res.status).toBe(401);
    });

    it("forwards the user to the route handler on the request, not the response", () => {
      const res = proxy(makeRequest("/api/auth/me", { Authorization: `Bearer ${tokenFor("ADMIN", 42)}` }));

      expect(res.status).toBe(200);
      expect(forwarded(res, "x-user-id")).toBe("42");
      expect(forwarded(res, "x-user-email")).toBe("admin@example.com");
      expect(forwarded(res, "x-user-role")).toBe("ADMIN");
      // Not exposed to the browser.
      expect(res.headers.get("x-user-id")).toBeNull();
      expect(res.headers.get("x-user-role")).toBeNull();
    });

    it("replaces spoofed user headers with the token's values", () => {
      const res = proxy(
        makeRequest("/api/auth/me", {
          Authorization: `Bearer ${tokenFor("ADMIN", 42)}`,
          "x-user-id": "1",
          "x-user-role": "SUPER_ADMIN",
        })
      );
      expect(forwarded(res, "x-user-id")).toBe("42");
      expect(forwarded(res, "x-user-role")).toBe("ADMIN");
    });

    it("returns 403 when the role is not allowed", async () => {
      const res = proxy(makeRequest("/api/admin/users", { Authorization: `Bearer ${tokenFor("USER")}` }));
      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toEqual({ error: "Forbidden - Insufficient permissions" });
    });

    it.each<Role>(["ADMIN", "SUPER_ADMIN"])("allows %s on admin routes", (role) => {
      const res = proxy(makeRequest("/api/admin/users", { Authorization: `Bearer ${tokenFor(role)}` }));
      expect(res.status).toBe(200);
    });

    it.each(["/api/users", "/api/users/3", "/api/events", "/api/organizations/1", "/api/certificates"])(
      "protects %s",
      (path) => {
        expect(proxy(makeRequest(path)).status).toBe(401);
      }
    );

    it("does not treat a longer path as the same prefix", () => {
      expect(proxy(makeRequest("/api/administrator")).status).toBe(200);
    });
  });
});
