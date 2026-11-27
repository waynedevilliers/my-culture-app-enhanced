// User routes: list, super admin edit/delete, own profile and password.

import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock('@/lib/prisma', () => ({ prisma: db }));

import { GET as list } from '@/app/api/users/route';
import { PUT as edit, DELETE as remove } from '@/app/api/users/[id]/route';
import { PUT as updateOwn } from '@/app/api/users/update/route';
import { hashPassword, comparePassword } from '@/lib/auth';
import { asUser, jsonRequest, params } from './helpers/requests';

const STORED = {
  id: 4,
  firstName: 'Ada',
  lastName: 'Admin',
  email: 'ada@example.com',
  phone: null,
  role: 'ADMIN',
  organizationId: 5,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('GET /api/users', () => {
  it('super admins see every user, with UI role names and no password', async () => {
    db.user.findUnique.mockResolvedValue({
      id: 1,
      role: 'SUPER_ADMIN',
      organizationId: null,
    });
    db.user.findMany.mockResolvedValue([STORED]);
    db.user.count.mockResolvedValue(1);

    const res = await list(
      jsonRequest(
        '/api/users?page=1&limit=10',
        'GET',
        undefined,
        asUser('SUPER_ADMIN')
      )
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(db.user.findMany.mock.calls[0][0].where).toEqual({});
    expect(db.user.findMany.mock.calls[0][0].select).not.toHaveProperty(
      'password'
    );
    expect(body.results[0]).toMatchObject({ role: 'admin', phoneNumber: null });
    expect(body.totalCount).toBe(1);
  });

  it('organisation admins see only their organisation', async () => {
    db.user.findUnique.mockResolvedValue({
      id: 4,
      role: 'ADMIN',
      organizationId: 5,
    });
    db.user.findMany.mockResolvedValue([]);
    db.user.count.mockResolvedValue(0);

    await list(jsonRequest('/api/users', 'GET', undefined, asUser('ADMIN', 4)));

    expect(db.user.findMany.mock.calls[0][0].where).toEqual({
      organizationId: 5,
    });
  });

  it('refuses a USER', async () => {
    const res = await list(
      jsonRequest('/api/users', 'GET', undefined, asUser('USER'))
    );
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/users/:id (super admin)', () => {
  const body = {
    firstName: 'Ada',
    lastName: 'Admin',
    email: 'ADA@example.com',
    role: 'admin',
  };

  it('updates and maps the UI role', async () => {
    db.user.update.mockResolvedValue(STORED);
    const res = await edit(
      jsonRequest('/api/users/4', 'PUT', body, asUser('SUPER_ADMIN', 1)),
      params(4)
    );
    expect(res.status).toBe(202);
    expect(db.user.update.mock.calls[0][0].data).toMatchObject({
      email: 'ada@example.com',
      role: 'ADMIN',
    });
  });

  it('removes the organisation when the user is no longer an organisation admin', async () => {
    db.user.update.mockResolvedValue({
      ...STORED,
      role: 'USER',
      organizationId: null,
    });
    await edit(
      jsonRequest(
        '/api/users/4',
        'PUT',
        { ...body, role: 'user' },
        asUser('SUPER_ADMIN', 1)
      ),
      params(4)
    );
    expect(db.user.update.mock.calls[0][0].data).toMatchObject({
      role: 'USER',
      organizationId: null,
    });
  });

  it.each(['ADMIN', 'USER'] as const)('refuses %s', async (role) => {
    const res = await edit(
      jsonRequest('/api/users/4', 'PUT', body, asUser(role, 4)),
      params(4)
    );
    expect(res.status).toBe(403);
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it('a super admin cannot remove their own super admin role', async () => {
    const res = await edit(
      jsonRequest('/api/users/1', 'PUT', body, asUser('SUPER_ADMIN', 1)),
      params(1)
    );
    expect(res.status).toBe(400);
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it('rejects an unknown role', async () => {
    const res = await edit(
      jsonRequest(
        '/api/users/4',
        'PUT',
        { ...body, role: 'god' },
        asUser('SUPER_ADMIN', 1)
      ),
      params(4)
    );
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/users/:id (super admin)', () => {
  it('deletes another user', async () => {
    db.user.delete.mockResolvedValue(STORED);
    const res = await remove(
      jsonRequest(
        '/api/users/4',
        'DELETE',
        undefined,
        asUser('SUPER_ADMIN', 1)
      ),
      params(4)
    );
    expect(res.status).toBe(200);
  });

  it('cannot delete their own account', async () => {
    const res = await remove(
      jsonRequest(
        '/api/users/1',
        'DELETE',
        undefined,
        asUser('SUPER_ADMIN', 1)
      ),
      params(1)
    );
    expect(res.status).toBe(400);
    expect(db.user.delete).not.toHaveBeenCalled();
  });

  it('refuses an organisation admin', async () => {
    const res = await remove(
      jsonRequest('/api/users/5', 'DELETE', undefined, asUser('ADMIN', 4)),
      params(5)
    );
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/users/update (own profile)', () => {
  it('updates name, email and phone of the caller only', async () => {
    db.user.update.mockResolvedValue({ ...STORED, phone: '+49 30 1' });
    const res = await updateOwn(
      jsonRequest(
        '/api/users/update',
        'PUT',
        {
          firstName: 'Ada',
          lastName: 'Admin',
          email: 'ada@example.com',
          phoneNumber: '+49 30 1',
          role: 'superAdmin',
          organizationId: 9,
        },
        asUser('ADMIN', 4)
      )
    );
    expect(res.status).toBe(200);
    const call = db.user.update.mock.calls[0][0];
    expect(call.where).toEqual({ id: 4 });
    expect(call.data).toEqual({
      firstName: 'Ada',
      lastName: 'Admin',
      email: 'ada@example.com',
      phone: '+49 30 1',
    });
    expect((await res.json()).phoneNumber).toBe('+49 30 1');
  });

  it('changes the password when the current one is right', async () => {
    db.user.findUnique.mockResolvedValue({
      password: await hashPassword('Old-Password-1'),
    });
    const res = await updateOwn(
      jsonRequest(
        '/api/users/update',
        'PUT',
        { password: 'Old-Password-1', newPassword: 'New-Password-123' },
        asUser('ADMIN', 4)
      )
    );
    expect(res.status).toBe(200);
    const saved = db.user.update.mock.calls[0][0].data.password;
    expect(await comparePassword('New-Password-123', saved)).toBe(true);
  });

  it('refuses a wrong current password', async () => {
    db.user.findUnique.mockResolvedValue({
      password: await hashPassword('Old-Password-1'),
    });
    const res = await updateOwn(
      jsonRequest(
        '/api/users/update',
        'PUT',
        { password: 'wrong', newPassword: 'New-Password-123' },
        asUser('ADMIN', 4)
      )
    );
    expect(res.status).toBe(400);
    expect((await res.json()).message).toBe(
      'The current password is not correct'
    );
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it('refuses a short new password', async () => {
    const res = await updateOwn(
      jsonRequest(
        '/api/users/update',
        'PUT',
        { password: 'x', newPassword: 'short' },
        asUser('ADMIN', 4)
      )
    );
    expect(res.status).toBe(400);
    expect((await res.json()).message).toMatch(/at least 10/);
  });

  it('needs a login', async () => {
    const res = await updateOwn(
      jsonRequest('/api/users/update', 'PUT', { firstName: 'A' })
    );
    expect(res.status).toBe(401);
  });
});
