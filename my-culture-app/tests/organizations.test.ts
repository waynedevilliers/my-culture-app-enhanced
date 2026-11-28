// Organisation routes. Prisma and storage are mocked; no database needed.

import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  user: { findUnique: vi.fn() },
}));
vi.mock('@/lib/prisma', () => ({ prisma: db }));

const storage = vi.hoisted(() => ({ storeImage: vi.fn() }));
vi.mock('@/lib/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/storage')>()),
  storeImage: storage.storeImage,
}));

const mail = vi.hoisted(() => ({ sendMail: vi.fn() }));
vi.mock('@/lib/email', () => mail);

const admins = vi.hoisted(() => ({
  adminEmailConflict: vi.fn(),
  assignOrganizationAdmin: vi.fn(),
}));
vi.mock('@/lib/organization-admins', () => admins);

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

// Same name and code as Prisma's PrismaClientKnownRequestError.
const prismaError = (code: string) =>
  Object.assign(new Error('db error'), {
    name: 'PrismaClientKnownRequestError',
    code,
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

// The caller as stored in the database (role and organisation).
const actor = (role: string, organizationId: number | null = null, id = 1) =>
  db.user.findUnique.mockResolvedValue({ id, role, organizationId });

beforeEach(() => {
  vi.clearAllMocks();
  actor('SUPER_ADMIN');
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
        asUser('SUPER_ADMIN', 7)
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
      jsonRequest('/api/organizations', 'POST', body, asUser('SUPER_ADMIN'))
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
        asUser('SUPER_ADMIN')
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
        asUser('SUPER_ADMIN')
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
      jsonRequest(
        '/api/organizations/1',
        'DELETE',
        undefined,
        asUser('SUPER_ADMIN')
      ),
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
    form.set('street', 'Kulturstraße 12');
    form.set('postalCode', '10115');
    form.set('city', 'Berlin');
    form.set('hasOwnAdmin', 'true');
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
    ['city', ''],
    ['street', ''],
    ['postalCode', '!!'],
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
  const pending = (overrides = {}) => ({
    id: 4,
    name: 'Musikschule',
    email: 'info@musikschule.de',
    adminName: null,
    adminEmail: null,
    approvalStatus: 'pending',
    ...overrides,
  });
  const approveRequest = (role = 'SUPER_ADMIN' as const) =>
    approve(
      jsonRequest(
        '/api/organizations/applications/4/approve',
        'POST',
        {},
        asUser(role)
      ),
      params(4)
    );

  beforeEach(() => {
    mail.sendMail.mockResolvedValue(false);
    admins.adminEmailConflict.mockResolvedValue(null);
  });

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
    expect((await approveRequest(role as never)).status).toBe(403);
    expect(db.organization.updateMany).not.toHaveBeenCalled();
  });

  it('approves and publishes; without an own admin no account is created', async () => {
    db.organization.findUnique.mockResolvedValue(pending());
    db.organization.updateMany.mockResolvedValue({ count: 1 });

    const res = await approveRequest();
    const body = await res.json();

    expect(res.status).toBe(200);
    const call = db.organization.updateMany.mock.calls[0][0];
    expect(call.where).toEqual({ id: 4, approvalStatus: 'pending' });
    expect(call.data).toMatchObject({
      approvalStatus: 'approved',
      published: true,
    });
    expect(admins.assignOrganizationAdmin).not.toHaveBeenCalled();
    expect(body.data).not.toHaveProperty('admin');
    // The organisation is told (mail is attempted even if SMTP is missing).
    expect(mail.sendMail.mock.calls[0][0].to).toBe('info@musikschule.de');
  });

  it('with an own admin: creates the admin and returns the link when not emailed', async () => {
    db.organization.findUnique.mockResolvedValue(
      pending({ adminName: 'Ada Admin', adminEmail: 'ada@example.com' })
    );
    db.organization.updateMany.mockResolvedValue({ count: 1 });
    admins.assignOrganizationAdmin.mockResolvedValue({
      userId: 9,
      email: 'ada@example.com',
      emailed: false,
      setPasswordUrl: 'http://localhost:3000/set-password?token=abc',
    });

    const res = await approveRequest();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(admins.assignOrganizationAdmin.mock.calls[0][2]).toEqual({
      name: 'Ada Admin',
      email: 'ada@example.com',
    });
    expect(body.data.admin).toEqual({
      email: 'ada@example.com',
      emailed: false,
      setPasswordUrl: 'http://localhost:3000/set-password?token=abc',
    });
  });

  it('refuses before approving when the admin email is taken', async () => {
    db.organization.findUnique.mockResolvedValue(
      pending({ adminName: 'Ada', adminEmail: 'boss@grow.de' })
    );
    admins.adminEmailConflict.mockResolvedValue(
      'This email belongs to a super admin'
    );

    const res = await approveRequest();

    expect(res.status).toBe(409);
    expect((await res.json()).message).toBe(
      'This email belongs to a super admin'
    );
    expect(db.organization.updateMany).not.toHaveBeenCalled();
    expect(admins.assignOrganizationAdmin).not.toHaveBeenCalled();
  });

  it('rejects with notes, keeps it unpublished and tells the organisation', async () => {
    db.organization.findUnique.mockResolvedValue(
      pending({ adminEmail: 'ada@example.com' })
    );
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
    expect(admins.assignOrganizationAdmin).not.toHaveBeenCalled();
    expect(mail.sendMail.mock.calls[0][0].text).toContain(
      'Keine Kulturorganisation'
    );
  });

  it('returns 409 when the application was already decided', async () => {
    db.organization.findUnique.mockResolvedValue(
      pending({ approvalStatus: 'approved' })
    );
    const res = await approveRequest();
    expect(res.status).toBe(409);
    expect((await res.json()).message).toBe('Application was already approved');
  });

  it('returns 409 when it was decided in the meantime', async () => {
    db.organization.findUnique.mockResolvedValue(pending());
    db.organization.updateMany.mockResolvedValue({ count: 0 });
    expect((await approveRequest()).status).toBe(409);
  });

  it('returns 404 for an unknown application', async () => {
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

describe('POST /api/organizations/apply: admin is optional', () => {
  const baseForm = () => {
    const form = new FormData();
    form.set('organizationName', 'Musikschule Mitte');
    form.set('organizationType', 'Music Academy');
    form.set('description', 'Wir unterrichten Kinder und Erwachsene.');
    form.set('street', 'Kulturstraße 12');
    form.set('postalCode', '10115');
    form.set('city', 'Berlin');
    return form;
  };

  it('accepts an application without an own admin and stores none', async () => {
    db.organization.create.mockResolvedValue({ id: 3, name: 'x' });
    const form = baseForm();
    form.set('adminName', 'Ignored');
    form.set('adminEmail', 'ignored@example.com');

    const res = await apply(formRequest('/api/organizations/apply', form));

    expect(res.status).toBe(201);
    const data = db.organization.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      street: 'Kulturstraße 12',
      postalCode: '10115',
      city: 'Berlin',
    });
    expect(data.adminName).toBeNull();
    expect(data.adminEmail).toBeNull();
  });

  it('requires admin name and email when the box is ticked', async () => {
    const form = baseForm();
    form.set('hasOwnAdmin', 'true');
    const res = await apply(formRequest('/api/organizations/apply', form));
    expect(res.status).toBe(400);
    expect(db.organization.create).not.toHaveBeenCalled();
  });
});

describe('organisation admins only manage their own organisation', () => {
  it('lists only their own organisation', async () => {
    actor('ADMIN', 5, 3);
    db.organization.findMany.mockResolvedValue([]);
    db.organization.count.mockResolvedValue(0);

    await listAll(
      jsonRequest('/api/organizations', 'GET', undefined, asUser('ADMIN', 3))
    );

    expect(db.organization.findMany.mock.calls[0][0].where).toEqual({
      approvalStatus: 'approved',
      id: 5,
    });
    expect(db.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 3 } })
    );
  });

  it('an admin without an organisation sees nothing', async () => {
    actor('ADMIN', null, 3);
    db.organization.findMany.mockResolvedValue([]);
    db.organization.count.mockResolvedValue(0);
    await listAll(
      jsonRequest('/api/organizations', 'GET', undefined, asUser('ADMIN', 3))
    );
    expect(db.organization.findMany.mock.calls[0][0].where.id).toBe(-1);
  });

  it('uses the role from the database, not the token', async () => {
    // The token still says SUPER_ADMIN; the account is now an org admin.
    actor('ADMIN', 5, 3);
    db.organization.findMany.mockResolvedValue([]);
    db.organization.count.mockResolvedValue(0);
    await listAll(
      jsonRequest(
        '/api/organizations',
        'GET',
        undefined,
        asUser('SUPER_ADMIN', 3)
      )
    );
    expect(db.organization.findMany.mock.calls[0][0].where.id).toBe(5);
  });

  it('edits the description of their own organisation', async () => {
    actor('ADMIN', 5, 3);
    db.organization.findUnique.mockResolvedValue({
      name: 'Verein',
      published: true,
    });
    db.organization.update.mockResolvedValue(ORG);

    const res = await update(
      jsonRequest(
        '/api/organizations/5',
        'PUT',
        { name: 'Verein', published: true, description: 'Neu' },
        asUser('ADMIN', 3)
      ),
      params(5)
    );

    expect(res.status).toBe(202);
    expect(db.organization.update.mock.calls[0][0].data.description).toBe(
      'Neu'
    );
  });

  it('cannot edit another organisation', async () => {
    actor('ADMIN', 5, 3);
    const res = await update(
      jsonRequest(
        '/api/organizations/6',
        'PUT',
        { description: 'x' },
        asUser('ADMIN', 3)
      ),
      params(6)
    );
    expect(res.status).toBe(403);
    expect(db.organization.update).not.toHaveBeenCalled();
  });

  it.each([
    ['the name', { name: 'Anderer Name' }],
    ['the publication', { published: false }],
  ])('cannot change %s', async (_label, body) => {
    actor('ADMIN', 5, 3);
    db.organization.findUnique.mockResolvedValue({
      name: 'Verein',
      published: true,
    });
    const res = await update(
      jsonRequest('/api/organizations/5', 'PUT', body, asUser('ADMIN', 3)),
      params(5)
    );
    expect(res.status).toBe(403);
    expect(db.organization.update).not.toHaveBeenCalled();
  });

  it('cannot create organisations', async () => {
    const res = await create(
      jsonRequest(
        '/api/organizations',
        'POST',
        { name: 'Neu' },
        asUser('ADMIN', 3)
      )
    );
    expect(res.status).toBe(403);
    expect(db.organization.create).not.toHaveBeenCalled();
  });

  it('cannot delete organisations', async () => {
    const res = await remove(
      jsonRequest(
        '/api/organizations/5',
        'DELETE',
        undefined,
        asUser('ADMIN', 3)
      ),
      params(5)
    );
    expect(res.status).toBe(403);
    expect(db.organization.delete).not.toHaveBeenCalled();
  });
});
