import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { validateLogin, validateRegister } from '../middlewares/validator.js';
import { login, register } from '../controllers/user.js';
import { errorHandler } from '../middlewares/errorHandler.js';

// Mock the database
jest.mock('../db.js', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    scope: jest.fn(() => ({
      findOne: jest.fn(),
    })),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/auth/login', authLimiter, validateLogin, login);
app.use('/api/auth/register', authLimiter, validateRegister, register);
app.use(errorHandler);

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/login', () => {
    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('valid email');
    });

    test('should validate password length', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: '123', // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('8 characters');
    });
  });

  describe('POST /api/auth/register', () => {
    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
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
      expect(response.body.message).toContain('uppercase');
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
      expect(response.body.message).toContain('valid email');
    });
  });

  describe('Rate Limiting', () => {
    test('should apply rate limiting to login endpoint', async () => {
      // Make multiple requests to trigger rate limit
      const promises = Array(6).fill().map(() => 
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123',
          })
      );

      const responses = await Promise.all(promises);
      
      // At least one should be rate limited
      expect(responses.some(res => res.status === 429)).toBe(true);
    });
  });
});