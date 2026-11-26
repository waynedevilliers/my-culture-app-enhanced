import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Tests never touch a real database: Prisma is mocked per test file.
    env: {
      JWT_SECRET: "test-secret-that-is-at-least-32-characters-long",
      DATABASE_URL: "postgresql://test:test@127.0.0.1:1/never-used",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
