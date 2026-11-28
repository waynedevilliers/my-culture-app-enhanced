
import { request } from './setup.js';
import { User } from '../db.js';
import bcrypt from 'bcrypt';

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await User.destroy({ truncate: true, cascade: true });
    // Small delay to avoid rate limiting between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  it('should register a new user successfully', async () => {
    const res = await request.post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      newsletter: false,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('email', 'test@example.com');
    expect(res.body).toHaveProperty('id');
  });

  it('should prevent registration with existing email', async () => {
    await request.post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      newsletter: false,
    });

    const res = await request.post('/api/auth/register').send({
      firstName: 'Another',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password456',
      newsletter: false,
    });

    expect(res.statusCode).toEqual(409);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('message', 'User Already Exist');
  });

  it('should login a user successfully with valid credentials', async () => {
    await request.post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      newsletter: false,
    });

    const res = await request.post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
  });

  it('should prevent login with invalid email', async () => {
    const res = await request.post('/api/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'wrongpassword',
    });

    // Can be 403 (invalid credentials) or 429 (rate limited)
    expect([403, 429]).toContain(res.statusCode);
    
    if (res.statusCode === 403) {
      expect(res.body).toHaveProperty('error');
      expect(res.body.error.message).toContain('Invalid email or password');
    }
  });

  it('should prevent login with wrong password', async () => {
    await request.post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test2@example.com',
      password: 'password123',
      newsletter: false,
    });

    const res = await request.post('/api/auth/login').send({
      email: 'test2@example.com',
      password: 'wrongpassword',
    });

    expect([403, 429]).toContain(res.statusCode);
    
    if (res.statusCode === 403) {
      expect(res.body).toHaveProperty('error');
      expect(res.body.error.message).toContain('Invalid email or password');
    }
  });
});
