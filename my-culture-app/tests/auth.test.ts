// Auth endpoint tests. Prisma is mocked, so no database or server is needed.

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ prisma: { user: { findUnique } } }));

import { POST as loginRoute } from '@/app/api/auth/login/route';
import { GET as meRoute } from '@/app/api/auth/me/route';
import { hashPassword, verifyToken } from '@/lib/auth';

const PASSWORD = 'Correct-Horse-1';
let passwordHash: string;

const dbUser = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  email: 'admin@example.com',
  firstName: 'Ada',
  lastName: 'Admin',
  password: passwordHash,
  role: 'ADMIN',
  verified: true,
  newsletter: false,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  ...overrides,
});

const loginRequest = (body: unknown) =>
  new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

beforeAll(async () => {
  passwordHash = await hashPassword(PASSWORD);
});

beforeEach(() => {
  findUnique.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('POST /api/auth/login', () => {
  it.each(['ADMIN', 'SUPER_ADMIN'])(
    'logs in a %s and returns a valid token',
    async (role) => {
      findUnique.mockResolvedValue(dbUser({ role }));

      const res = await loginRoute(
        loginRequest({ email: 'admin@example.com', password: PASSWORD })
      );
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(verifyToken(body.data.token)).toMatchObject({ userId: 1, role });
      expect(body.data.user.email).toBe('admin@example.com');
      expect(body.data.user).not.toHaveProperty('password');
      expect(findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@example.com' },
      });
    }
  );

  it('rejects a wrong password with 401', async () => {
    findUnique.mockResolvedValue(dbUser());

    const res = await loginRoute(
      loginRequest({ email: 'admin@example.com', password: 'Wrong-Password-1' })
    );

    expect(res.status).toBe(401);
    expect((await res.json()).data).toBeUndefined();
  });

  it('gives the same answer for an unknown email and a wrong password', async () => {
    findUnique.mockResolvedValue(null);
    const unknown = await loginRoute(
      loginRequest({ email: 'nobody@example.com', password: PASSWORD })
    );

    findUnique.mockResolvedValue(dbUser());
    const wrong = await loginRoute(
      loginRequest({ email: 'admin@example.com', password: 'Wrong-Password-1' })
    );

    expect(unknown.status).toBe(401);
    expect(await unknown.json()).toEqual(await wrong.json());
  });

  it.each(['USER', 'MODERATOR'])(
    'refuses a %s account, even with the right password',
    async (role) => {
      findUnique.mockResolvedValue(dbUser({ role }));

      const res = await loginRoute(
        loginRequest({ email: 'admin@example.com', password: PASSWORD })
      );

      expect(res.status).toBe(401);
      expect((await res.json()).message).toBe('Invalid email or password');
    }
  );

  it.each([
    ['an invalid email', { email: 'invalid', password: PASSWORD }],
    ['a missing password', { email: 'admin@example.com' }],
    ['an empty body', {}],
  ])('returns 400 for %s, not 500', async (_label, body) => {
    const res = await loginRoute(loginRequest(body));

    expect(res.status).toBe(400);
    expect((await res.json()).success).toBe(false);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('returns 400 for a body that is not JSON', async () => {
    const res = await loginRoute(loginRequest('not json'));
    expect(res.status).toBe(400);
  });

  it('returns 500 without details when the database fails', async () => {
    findUnique.mockRejectedValue(new Error('connection refused at 10.0.0.5'));

    const res = await loginRoute(
      loginRequest({ email: 'admin@example.com', password: PASSWORD })
    );
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain('10.0.0.5');
  });
});

describe('GET /api/auth/me', () => {
  const meRequest = (headers: Record<string, string> = {}) =>
    new Request('http://localhost:3000/api/auth/me', { headers });

  const proxyHeaders = {
    'x-user-id': '1',
    'x-user-email': 'admin@example.com',
    'x-user-role': 'ADMIN',
  };

  it('returns the profile of the user the proxy forwarded', async () => {
    const { password: _password, ...profile } = dbUser();
    findUnique.mockResolvedValue(profile);

    const res = await meRoute(meRequest(proxyHeaders));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.email).toBe('admin@example.com');
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } })
    );
    expect(findUnique.mock.calls[0][0].select).not.toHaveProperty('password');
  });

  it('returns 401 when the proxy forwarded no user', async () => {
    const res = await meRoute(meRequest());
    expect(res.status).toBe(401);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('returns 404 when the user no longer exists', async () => {
    findUnique.mockResolvedValue(null);
    const res = await meRoute(meRequest(proxyHeaders));
    expect(res.status).toBe(404);
  });
});

describe('removed endpoints', () => {
  it('has no public sign-up route', async () => {
    await expect(
      import('@/app/api/auth/register/route' as string)
    ).rejects.toThrow();
  });
});
