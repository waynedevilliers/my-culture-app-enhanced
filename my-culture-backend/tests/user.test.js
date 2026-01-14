
import { request } from './setup.js';
import { User } from '../db.js';

describe('User Endpoints', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Create and login a user for subsequent tests
    const registerRes = await request.post('/api/auth/register').send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      newsletter: true,
    });

    userId = registerRes.body.id;

    const loginRes = await request.post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'password123',
    });

    authToken = loginRes.body.token;
  });

  beforeEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
  });

  describe('GET /api/auth/profile', () => {
    it('should get current user profile with valid token', async () => {
      const res = await request
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', userId);
      expect(res.body).toHaveProperty('email', 'john@example.com');
    });

    it('should return 401 without authentication', async () => {
      const res = await request.get('/api/auth/profile');

      expect(res.statusCode).toEqual(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('User GET endpoints with auth', () => {
    it('should return 401 when accessing /api/users without token', async () => {
      const res = await request.get('/api/users').query({ page: 1, limit: 10 });

      expect(res.statusCode).toEqual(401);
    });

    it('should return 401 when accessing /api/users/:id without token', async () => {
      const res = await request.get(`/api/users/${userId}`);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('PUT operations', () => {
    it('should return 403 (insufficient permissions) when updating own user', async () => {
      const res = await request
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Jane',
        });

      // User cannot update their own profile without admin role
      expect(res.statusCode).toEqual(403);
    });

    it('should return 401 without authentication', async () => {
      const res = await request.put(`/api/users/${userId}`).send({
        firstName: 'Jane',
      });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('DELETE operations', () => {
    it('should return 401 without authentication', async () => {
      const res = await request.delete(`/api/users/${userId}`);

      expect(res.statusCode).toEqual(401);
    });

    it('should return 403 when user tries to delete themselves', async () => {
      const res = await request
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // User cannot delete their own account without admin role
      expect(res.statusCode).toEqual(403);
    });
  });
});
