// Organisation routes. Prisma and storage are mocked; no database needed.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@prisma/client';

const db = vi.hoisted(() => ({
  organization: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
  image: { findUnique: vi.fn(), create: vi.fn() },
}));
vi.mock('@/lib/prisma', () => ({ prisma: db }));

const storage = vi.hoisted(() => ({ storeImage: vi.fn() }));
vi.mock('@/lib/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/storage')>()),
  storeImage: storage.storeImage,
}));

import { GET as listPublished } from '@/app/api/organizations/published/route';
import { GET as listAll, POST as create } from '@/app/api/organizations/route';
import {
  DELETE as remove,
  GET as getOne,
  PUT as update,
} from '@/app/api/organizations/[id]/route';
import { POST as apply } from '@/app/api/organizations/apply/route';
import { GET as listApplications } from '@/app/api/organizations/applications/route';
import { POST as approve } from '@/app/api/organizations/applications/[id]/approve/route';
import { POST as reject } from '@/app/api/organizations/applications/[id]/reject/route';
import { ImageUploadError } from '@/lib/storage';
import {
  asUser,
  formRequest,
  jsonRequest,
  params,
  PNG_BYTES,
} from './helpers/requests';

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('db error', {
    code,
    clientVersion: '6.19.2',
  });

const ORG = {
  id: 1,
  name: 'Kulturverein',
  description: 'Beschreibung',
  website: null,
  phone: null,
  email: 'info@example.com',
  published: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  logo: { id: 'img1', url: '/uploads/organizations/a.png' },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('GET /api/organizations/published', () => {
  it('returns only approved, published organisations, with the logo as Image', async () => {
    db.organization.findMany.mockResolvedValue([ORG]);

    const res = await listPublished();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body[0].Image).toEqual({
      id: 'img1',
      url: '/uploads/organizations/a.png',
    });
    expect(body[0]).not.toHaveProperty('logo');
    const query = db.organization.findMany.mock.calls[0][0];
    expect(query.where).toEqual({
      published: true,
      approvalStatus: 'approved',
    });
    expect(query.select).not.toHaveProperty('adminEmail');
    expect(query.select).not.toHaveProperty('applicationDetails');
  });

  it('returns 500 without internal details', async () => {
    db.organization.findMany.mockRejectedValue(
      new Error('connect ECONNREFUSED 10.0.0.1')
    );
    const res = await listPublished();
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain('10.0.0.1');
  });
});

describe('GET /api/organizations/:id', () => {
  it('returns a published organisation', async () => {
    db.organization.findFirst.mockResolvedValue(ORG);
    const res = await getOne(
      jsonRequest('/api/organizations/1', 'GET'),
      params(1)
    );
    expect(res.status).toBe(200);
    expect((await res.json()).name).toBe('Kulturverein');
    expect(db.organization.findFirst.mock.calls[0][0].where).toEqual({
      id: 1,
      published: true,
      approvalStatus: 'approved',
    });
  });

  it('returns 404 for pending applications and unknown ids', async () => {
    db.organization.findFirst.mockResolvedValue(null);
    const res = await getOne(
      jsonRequest('/api/organizations/9', 'GET'),
      params(9)
    );
    expect(res.status).toBe(404);
  });

  it.each(['abc', '0', '-1', '1.5'])(
    'returns 404 for the id %s without a query',
    async (id) => {
      const res = await getOne(
        jsonRequest(`/api/organizations/${id}`, 'GET'),
        params(id)
      );
      expect(res.status).toBe(404);
      expect(db.organization.findFirst).not.toHaveBeenCalled();
    }
  );
});

describe('dashboard routes need a dashboard role', () => {
  const calls = {
    'GET /api/organizations': (h: Record<string, string>) =>
      listAll(jsonRequest('/api/organizations', 'GET', undefined, h)),
    'POST /api/organizations': (h: Record<string, string>) =>
      create(jsonRequest('/api/organizations', 'POST', { name: 'X' }, h)),
    'PUT /api/organizations/1': (h: Record<string, string>) =>
      update(
        jsonRequest('/api/organizations/1', 'PUT', { published: true }, h),
        params(1)
      ),
    'DELETE /api/organizations/1': (h: Record<string, string>) =>
      remove(
        jsonRequest('/api/organizations/1', 'DELETE', undefined, h),
        params(1)
      ),
  };

  for (const [name, call] of Object.entries(calls)) {
    it(`${name}: 401 without a user`, async () => {
      expect((await call({})).status).toBe(401);
    });
    it(`${name}: 403 for a USER`, async () => {
      expect((await call(asUser('USER'))).status).toBe(403);
    });
  }

  it('does not trust a role header without a user id', async () => {
    const res = await listAll(
      jsonRequest('/api/organizations', 'GET', undefined, {
        'x-user-role': 'SUPER_ADMIN',
      })
    );
    expect(res.status).toBe(401);
  });
});

describe('GET /api/organizations (dashboard list)', () => {
  it('paginates approved organisations', async () => {
    db.organization.findMany.mockResolvedValue([ORG]);
    db.organization.count.mockResolvedValue(23);

    const res = await listAll(
      jsonRequest(
        '/api/organizations?page=2',
        'GET',
        undefined,
        asUser('ADMIN')
      )
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      totalCount: 23,
      totalPages: 3,
      currentPage: 2,
      hasNextPage: true,
      hasPreviousPage: true,
    });
    expect(body.results[0].Image.url).toBe('/uploads/organizations/a.png');
    expect(db.organization.findMany.mock.calls[0][0]).toMatchObject({
      where: { approvalStatus: 'approved' },
      skip: 10,
      take: 10,
    });
  });

  it('falls back to page 1 for a bad page value', async () => {
    db.organization.findMany.mockResolvedValue([]);
    db.organization.count.mockResolvedValue(0);
    await listAll(
      jsonRequest(
        '/api/organizations?page=abc&limit=xyz',
        'GET',
        undefined,
        asUser('ADMIN')
      )
    );
    expect(db.organization.findMany.mock.calls[0][0]).toMatchObject({
      skip: 0,
      take: 10,
    });
  });
});

describe('POST /api/organizations', () => {
  it('creates an approved organisation owned by the admin', async () => {
    db.image.findUnique.mockResolvedValue({ id: 'img1' });
    db.organization.create.mockResolvedValue(ORG);

    const res = await create(
      jsonRequest(
        '/api/organizations',
        'POST',
        {
          name: 'Kulturverein',
          email: 'INFO@example.com',
          website: 'https://example.com',
          imageId: 'img1',
          approvalStatus: 'rejected',
          userId: 99,
        },
        asUser('ADMIN', 7)
      )
    );

    expect(res.status).toBe(201);
    const data = db.organization.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      name: 'Kulturverein',
      email: 'info@example.com',
      approvalStatus: 'approved',
      published: false,
      logoId: 'img1',
      userId: 7,
    });
  });

  it.each([
    ['no name', { name: '' }],
    [
      'a website without http',
      { name: 'Verein', website: 'javascript:alert(1)' },
    ],
    ['a bad email', { name: 'Verein', email: 'nope' }],
  ])('returns 400 for %s', async (_label, body) => {
    const res = await create(
      jsonRequest('/api/organizations', 'POST', body, asUser('ADMIN'))
    );
    expect(res.status).toBe(400);
    expect(db.organization.create).not.toHaveBeenCalled();
  });

  it('returns 400 for an image that does not exist', async () => {
    db.image.findUnique.mockResolvedValue(null);
    const res = await create(
      jsonRequest(
        '/api/organizations',
        'POST',
        { name: 'Verein', imageId: 'nope' },
        asUser('ADMIN')
      )
    );
    expect(res.status).toBe(400);
  });

  it('returns 409 for a duplicate email', async () => {
    db.organization.create.mockRejectedValue(prismaError('P2002'));
    const res = await create(
      jsonRequest(
        '/api/organizations',
        'POST',
        { name: 'Verein', email: 'a@b.de' },
        asUser('ADMIN')
      )
    );
    expect(res.status).toBe(409);
  });
});

describe('PUT /api/organizations/:id', () => {
  it('toggles published', async () => {
    db.organization.update.mockResolvedValue(ORG);
    const res = await update(
      jsonRequest(
        '/api/organizations/1',
        'PUT',
        { name: 'Kulturverein', published: false },
        asUser('ADMIN')
      ),
      params(1)
    );
    expect(res.status).toBe(202);
    expect(db.organization.update.mock.calls[0][0]).toMatchObject({
      where: { id: 1 },
      data: { name: 'Kulturverein', published: false },
    });
  });

  it('cannot change the approval status or owner', async () => {
    db.organization.update.mockResolvedValue(ORG);
    await update(
      jsonRequest(
        '/api/organizations/1',
        'PUT',
        { approvalStatus: 'approved', userId: 99, adminEmail: 'x@y.de' },
        asUser('ADMIN')
      ),
      params(1)
    );
    const data = db.organization.update.mock.calls[0][0].data;
    expect(data).not.toHaveProperty('approvalStatus');
    expect(data).not.toHaveProperty('userId');
    expect(data).not.toHaveProperty('adminEmail');
  });

  it('returns 404 when the organisation does not exist', async () => {
    db.organization.update.mockRejectedValue(prismaError('P2025'));
    const res = await update(
      jsonRequest(
        '/api/organizations/5',
        'PUT',
        { published: true },
        asUser('ADMIN')
      ),
      params(5)
    );
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/organizations/:id', () => {
  it('deletes', async () => {
    db.organization.delete.mockResolvedValue(ORG);
    const res = await remove(
      jsonRequest(
        '/api/organizations/1',
        'DELETE',
        undefined,
        asUser('SUPER_ADMIN')
      ),
      params(1)
    );
    expect(res.status).toBe(200);
    expect(db.organization.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('returns 404 when missing', async () => {
    db.organization.delete.mockRejectedValue(prismaError('P2025'));
    const res = await remove(
      jsonRequest('/api/organizations/1', 'DELETE', undefined, asUser('ADMIN')),
      params(1)
    );
    expect(res.status).toBe(404);
  });
});

describe('POST /api/organizations/apply', () => {
  const validForm = () => {
    const form = new FormData();
    form.set('organizationName', 'Musikschule Mitte');
    form.set('organizationType', 'Music Academy');
    form.set('description', 'Wir unterrichten Kinder und Erwachsene.');
    form.set('location', 'Berlin');
    form.set('adminName', 'Ada Admin');
    form.set('adminEmail', 'Ada@Example.com');
    form.set('establishedYear', '1999');
    return form;
  };

  it('creates a pending, unpublished application', async () => {
    db.organization.create.mockResolvedValue({
      id: 3,
      name: 'Musikschule Mitte',
    });

    const res = await apply(
      formRequest('/api/organizations/apply', validForm())
    );

    expect(res.status).toBe(201);
    expect((await res.json()).organization).toEqual({
      id: 3,
      name: 'Musikschule Mitte',
    });
    const data = db.organization.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      name: 'Musikschule Mitte',
      approvalStatus: 'pending',
      published: false,
      adminName: 'Ada Admin',
      adminEmail: 'ada@example.com',
      applicationDetails: {
        organizationType: 'Music Academy',
        location: 'Berlin',
        establishedYear: 1999,
      },
    });
    expect(data.logoId).toBeUndefined();
  });

  it('ignores fields an applicant should not set', async () => {
    db.organization.create.mockResolvedValue({ id: 3, name: 'x' });
    const form = validForm();
    form.set('published', 'true');
    form.set('approvalStatus', 'approved');
    form.set('userId', '1');

    await apply(formRequest('/api/organizations/apply', form));

    const data = db.organization.create.mock.calls[0][0].data;
    expect(data.published).toBe(false);
    expect(data.approvalStatus).toBe('pending');
    expect(data).not.toHaveProperty('userId');
  });

  it('stores the logo and links it', async () => {
    storage.storeImage.mockResolvedValue({
      url: '/uploads/organizations/l.png',
      fileName: 'l.png',
      size: 12,
    });
    db.image.create.mockResolvedValue({ id: 'logo1' });
    db.organization.create.mockResolvedValue({ id: 3, name: 'x' });
    const form = validForm();
    form.set('logo', new File([PNG_BYTES], 'logo.png', { type: 'image/png' }));

    const res = await apply(formRequest('/api/organizations/apply', form));

    expect(res.status).toBe(201);
    expect(storage.storeImage.mock.calls[0][1]).toBe('organizations');
    expect(db.organization.create.mock.calls[0][0].data.logoId).toBe('logo1');
  });

  it('returns 400 when the logo is not an image', async () => {
    storage.storeImage.mockRejectedValue(
      new ImageUploadError('Only jpg, png or webp images are allowed')
    );
    const form = validForm();
    form.set('logo', new File(['<script>'], 'x.png', { type: 'image/png' }));

    const res = await apply(formRequest('/api/organizations/apply', form));

    expect(res.status).toBe(400);
    expect((await res.json()).message).toMatch(/Only jpg, png or webp/);
    expect(db.organization.create).not.toHaveBeenCalled();
  });

  it.each([
    ['organizationName', ''],
    ['adminEmail', 'not-an-email'],
    ['location', ''],
    ['website', 'ftp://example.com'],
    ['establishedYear', String(new Date().getFullYear() + 1)],
  ])('returns 400 when %s is %p', async (field, value) => {
    const form = validForm();
    form.set(field, value);
    const res = await apply(formRequest('/api/organizations/apply', form));
    expect(res.status).toBe(400);
    expect(db.organization.create).not.toHaveBeenCalled();
  });

  it('returns 400 for a JSON body', async () => {
    const res = await apply(
      jsonRequest('/api/organizations/apply', 'POST', {})
    );
    expect(res.status).toBe(400);
  });

  it('returns 409 when the organisation email exists', async () => {
    db.organization.create.mockRejectedValue(prismaError('P2002'));
    const form = validForm();
    form.set('email', 'info@example.com');
    const res = await apply(formRequest('/api/organizations/apply', form));
    expect(res.status).toBe(409);
  });
});

describe('applications (super admin only)', () => {
  it('lists pending applications for a super admin', async () => {
    db.organization.findMany.mockResolvedValue([
      { ...ORG, adminEmail: 'a@b.de' },
    ]);
    const res = await listApplications(
      jsonRequest(
        '/api/organizations/applications',
        'GET',
        undefined,
        asUser('SUPER_ADMIN')
      )
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data[0].adminEmail).toBe('a@b.de');
    expect(db.organization.findMany.mock.calls[0][0].where).toEqual({
      approvalStatus: 'pending',
    });
  });

  it.each(['ADMIN', 'USER'] as const)('refuses %s', async (role) => {
    const res = await listApplications(
      jsonRequest(
        '/api/organizations/applications',
        'GET',
        undefined,
        asUser(role)
      )
    );
    expect(res.status).toBe(403);
    const approveRes = await approve(
      jsonRequest(
        '/api/organizations/applications/1/approve',
        'POST',
        {},
        asUser(role)
      ),
      params(1)
    );
    expect(approveRes.status).toBe(403);
    expect(db.organization.updateMany).not.toHaveBeenCalled();
  });

  it('approves and publishes a pending application', async () => {
    db.organization.updateMany.mockResolvedValue({ count: 1 });
    const res = await approve(
      jsonRequest(
        '/api/organizations/applications/4/approve',
        'POST',
        {},
        asUser('SUPER_ADMIN')
      ),
      params(4)
    );
    expect(res.status).toBe(200);
    const call = db.organization.updateMany.mock.calls[0][0];
    expect(call.where).toEqual({ id: 4, approvalStatus: 'pending' });
    expect(call.data).toMatchObject({
      approvalStatus: 'approved',
      published: true,
    });
    expect(call.data.approvedAt).toBeInstanceOf(Date);
  });

  it('rejects with notes and keeps it unpublished', async () => {
    db.organization.updateMany.mockResolvedValue({ count: 1 });
    const res = await reject(
      jsonRequest(
        '/api/organizations/applications/4/reject',
        'POST',
        { rejectionNotes: '  Keine Kulturorganisation  ' },
        asUser('SUPER_ADMIN')
      ),
      params(4)
    );
    expect(res.status).toBe(200);
    expect(db.organization.updateMany.mock.calls[0][0].data).toMatchObject({
      approvalStatus: 'rejected',
      rejectionNotes: 'Keine Kulturorganisation',
      published: false,
    });
  });

  it('returns 409 when the application was already decided', async () => {
    db.organization.updateMany.mockResolvedValue({ count: 0 });
    db.organization.findUnique.mockResolvedValue({
      approvalStatus: 'approved',
    });
    const res = await approve(
      jsonRequest(
        '/api/organizations/applications/4/approve',
        'POST',
        {},
        asUser('SUPER_ADMIN')
      ),
      params(4)
    );
    expect(res.status).toBe(409);
    expect((await res.json()).message).toBe('Application was already approved');
  });

  it('returns 404 for an unknown application', async () => {
    db.organization.updateMany.mockResolvedValue({ count: 0 });
    db.organization.findUnique.mockResolvedValue(null);
    const res = await reject(
      jsonRequest(
        '/api/organizations/applications/4/reject',
        'POST',
        {},
        asUser('SUPER_ADMIN')
      ),
      params(4)
    );
    expect(res.status).toBe(404);
  });
});
