import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
// Import the setupApp function
import setupApp from '../app.js'; // Adjust path if necessary, assuming app.js is in the same level as index.js

let app; // Declare app globally for supertest

beforeAll(async () => {
  app = await setupApp(); // Initialize the full Express app
});

// No need for afterAll app.close() if the test setup.js handles sequelize.close()
// and no other resources are being explicitly opened here.

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/login', () => {
    test('should validate required fields', async () => {
      const response = await request(app) // Use the initialized app
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      // The error body structure is changing, so we should check for what's actually returned.
      // Assuming error messages are now nested under 'error.message' or similar based on previous test failures.
      expect(response.body).toHaveProperty('error.message');
    });

    test('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('valid email');
    });

    test('should validate password length', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: '123', // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('8 characters');
    });
  });

  describe('POST /api/auth/register', () => {
    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error.message');
    });

    test('should validate password complexity', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password', // Missing uppercase and number
          newsletter: true,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('uppercase');
    });

    test('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email',
          password: 'Password123',
          newsletter: true,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('valid email');
    });
  });

  describe('Rate Limiting', () => {
    // This test might still be flaky if not properly isolated from other tests
    // or if the rate limiter isn't reset between test runs.
    test('should apply rate limiting to login endpoint', async () => {
      const concurrentRequests = 6;
      const responses = [];
      for (let i = 0; i < concurrentRequests; i++) {
        responses.push(
          await request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'password123',
            })
        );
      }
      
      // At least one should be rate limited (status 429)
      expect(responses.some(res => res.status === 429)).toBe(true);
      
      // Optionally, check that not all were 429, meaning some requests passed before rate limiting
      expect(responses.some(res => res.status !== 429 && res.status !== 400)).toBe(true);
    });
  });
});