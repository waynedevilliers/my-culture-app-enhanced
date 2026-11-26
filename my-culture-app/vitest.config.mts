import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const alias = { '@': path.resolve(__dirname, './src') };

export default defineConfig({
  resolve: { alias },
  // Same JSX transform as Next.js and the old Vite React plugin: no
  // `import React` needed in components.
  esbuild: { jsx: 'automatic' },
  test: {
    globals: true,
    // Tests never touch a real database: Prisma is mocked per test file.
    env: {
      JWT_SECRET: 'test-secret-that-is-at-least-32-characters-long',
      DATABASE_URL: 'postgresql://test:test@127.0.0.1:1/never-used',
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'api',
          environment: 'node',
          include: ['tests/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'ui',
          environment: 'jsdom',
          include: ['src/tests/**/*.test.{js,jsx}'],
          setupFiles: ['./src/tests/setup.js'],
        },
      },
    ],
  },
});
