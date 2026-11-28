// Organisation admin accounts: assignment, set-password links, email.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => {
  const db = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    passwordToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
      updateMany: vi.fn(),
    },
    organization: { findFirst: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  };
  db.$transaction.mockImplementation(async (fn: (tx: typeof db) => unknown) =>
    fn(db)
  );
  return db;
});
vi.mock('@/lib/prisma', () => ({ prisma: db }));

const smtp = vi.hoisted(() => ({
  sendMail: vi.fn(),
  createTransport: vi.fn(),
}));
vi.mock('nodemailer', () => ({
  default: { createTransport: smtp.createTransport },
}));

import { escapeHtml } from '@/lib/escape-html';
import { mailConfig, sendMail } from '@/lib/email';
import {
  approvalMail,
  rejectionMail,
  setPasswordMail,
} from '@/lib/organization-emails';
import {
  adminEmailConflict,
  assignOrganizationAdmin,
} from '@/lib/organization-admins';
import { hashToken } from '@/lib/password-tokens';
import { comparePassword } from '@/lib/auth';
import { POST as setPassword } from '@/app/api/auth/set-password/route';
import { POST as assignAdmin } from '@/app/api/organizations/[id]/admin/route';
import { asUser, jsonRequest, params } from './helpers/requests';

const SMTP_ENV = {
  EMAIL_HOST: 'smtp.example.com',
  EMAIL_FROM: 'grow <noreply@example.com>',
  EMAIL_USER: 'user',
  EMAIL_PASS: 'pass',
};

beforeEach(() => {
  vi.clearAllMocks();
  db.$transaction.mockImplementation(async (fn: (tx: typeof db) => unknown) =>
    fn(db)
  );
  smtp.createTransport.mockReturnValue({ sendMail: smtp.sendMail });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('email', () => {
  it('is not configured without host and sender', () => {
    expect(mailConfig({})).toBeNull();
    expect(mailConfig({ EMAIL_HOST: 'x' })).toBeNull();
    expect(mailConfig({ ...SMTP_ENV, EMAIL_PORT: 'abc' })).toBeNull();
  });

  it('reads the SMTP settings', () => {
    expect(
      mailConfig({ ...SMTP_ENV, EMAIL_PORT: '465', EMAIL_SECURE: 'true' })
    ).toEqual({
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      user: 'user',
      pass: 'pass',
      from: 'grow <noreply@example.com>',
    });
  });

  it('sends nothing and returns false without settings', async () => {
    vi.stubEnv('EMAIL_HOST', '');
    expect(
      await sendMail({ to: 'a@b.de', subject: 's', text: 't', html: 'h' })
    ).toBe(false);
    expect(smtp.createTransport).not.toHaveBeenCalled();
  });

  it('sends with the configured sender', async () => {
    for (const [k, v] of Object.entries(SMTP_ENV)) vi.stubEnv(k, v);
    smtp.sendMail.mockResolvedValue({});
    expect(
      await sendMail({ to: 'a@b.de', subject: 's', text: 't', html: 'h' })
    ).toBe(true);
    expect(smtp.sendMail.mock.calls[0][0]).toMatchObject({
      from: 'grow <noreply@example.com>',
      to: 'a@b.de',
    });
  });

  it('returns false on errors and never logs the message (it can hold addresses)', async () => {
    for (const [k, v] of Object.entries(SMTP_ENV)) vi.stubEnv(k, v);
    smtp.sendMail.mockRejectedValue(
      Object.assign(new Error('rejected ada@example.com'), {
        code: 'EENVELOPE',
      })
    );
    expect(
      await sendMail({
        to: 'ada@example.com',
        subject: 's',
        text: 't',
        html: 'h',
      })
    ).toBe(false);
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(
      'ada@example.com'
    );
  });
});

describe('email content', () => {
  it('escapes HTML', () => {
    expect(escapeHtml(`<b>"x" & 'y'</b>`)).toBe(
      '&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;'
    );
  });

  it('escapes organisation names and notes in every mail', () => {
    const evil = '<script>alert(1)</script>';
    for (const mail of [
      approvalMail('a@b.de', evil),
      rejectionMail('a@b.de', evil, evil),
      setPasswordMail('a@b.de', evil, 'https://x/set-password?token=a"b'),
    ]) {
      expect(mail.html).not.toContain('<script>');
      expect(mail.html).toContain('&lt;script&gt;');
    }
  });

  it('puts the link in the set-password mail', () => {
    const mail = setPasswordMail(
      'a@b.de',
      'Verein',
      'https://grow.example/set-password?token=abc'
    );
    expect(mail.text).toContain('https://grow.example/set-password?token=abc');
    expect(mail.text).toContain('48');
  });
});

describe('adminEmailConflict', () => {
  it.each([
    ['nobody uses it', null, null],
    ['a plain user', { role: 'USER', organizationId: null }, null],
    [
      'the admin of this organisation',
      { role: 'ADMIN', organizationId: 5 },
      null,
    ],
    [
      'an admin without organisation',
      { role: 'ADMIN', organizationId: null },
      null,
    ],
    [
      'a super admin',
      { role: 'SUPER_ADMIN', organizationId: null },
      'This email belongs to a super admin',
    ],
    [
      'the admin of another organisation',
      { role: 'ADMIN', organizationId: 6 },
      'This email is already the admin of another organization',
    ],
  ])('%s', async (_label, existing, expected) => {
    db.user.findUnique.mockResolvedValue(existing);
    expect(await adminEmailConflict('x@example.com', 5)).toBe(expected);
  });
});

describe('assignOrganizationAdmin', () => {
  const req = new Request(
    'https://grow.example/api/organizations/applications/5/approve'
  );

  beforeEach(() => {
    vi.stubEnv('EMAIL_HOST', '');
    vi.stubEnv('APP_URL', '');
  });

  it('creates an organisation admin with no usable password and a 48 h link', async () => {
    db.user.findUnique.mockResolvedValue(null);
    db.user.create.mockImplementation(async ({ data }) => ({ id: 9, ...data }));

    const before = Date.now();
    const result = await assignOrganizationAdmin(
      req,
      { id: 5, name: 'Verein' },
      {
        name: 'Ada Lovelace King',
        email: 'ada@example.com',
      }
    );

    const created = db.user.create.mock.calls[0][0].data;
    expect(created).toMatchObject({
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace King',
      role: 'ADMIN',
      organizationId: 5,
    });
    // The stored password is a hash of a random value nobody knows.
    expect(created.password).toMatch(/^\$2[aby]\$/);

    // Earlier admins of the organisation lose their access.
    expect(db.user.updateMany.mock.calls[0][0]).toEqual({
      where: { organizationId: 5, role: 'ADMIN', id: { not: 9 } },
      data: { role: 'USER', organizationId: null },
    });

    // The link token is only stored as a hash.
    const token = new URL(result.setPasswordUrl!).searchParams.get('token')!;
    const stored = db.passwordToken.create.mock.calls[0][0].data;
    expect(stored.tokenHash).toBe(hashToken(token));
    expect(stored.tokenHash).not.toContain(token);
    const hours = (stored.expiresAt.getTime() - before) / 3_600_000;
    expect(hours).toBeGreaterThan(47.9);
    expect(hours).toBeLessThan(48.1);
    expect(db.passwordToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: 9, usedAt: null },
    });

    expect(result).toMatchObject({ userId: 9, emailed: false });
    expect(result.setPasswordUrl).toMatch(
      /^https:\/\/grow\.example\/set-password\?token=/
    );
  });

  it('reuses an existing account and emails the link when SMTP is set', async () => {
    for (const [k, v] of Object.entries(SMTP_ENV)) vi.stubEnv(k, v);
    smtp.sendMail.mockResolvedValue({});
    db.user.findUnique.mockResolvedValue({ id: 4, email: 'ada@example.com' });
    db.user.update.mockResolvedValue({ id: 4, email: 'ada@example.com' });

    const result = await assignOrganizationAdmin(
      req,
      { id: 5, name: 'Verein' },
      {
        name: 'Ada',
        email: 'ada@example.com',
      }
    );

    expect(db.user.create).not.toHaveBeenCalled();
    expect(db.user.update.mock.calls[0][0].data).toEqual({
      role: 'ADMIN',
      organizationId: 5,
    });
    expect(result).toEqual({
      userId: 4,
      email: 'ada@example.com',
      emailed: true,
    });
    expect(smtp.sendMail.mock.calls[0][0].to).toBe('ada@example.com');
  });

  it('uses APP_URL for the link when set', async () => {
    vi.stubEnv('APP_URL', 'https://my-culture.example/');
    db.user.findUnique.mockResolvedValue(null);
    db.user.create.mockImplementation(async ({ data }) => ({ id: 9, ...data }));
    const result = await assignOrganizationAdmin(
      req,
      { id: 5, name: 'V' },
      { name: 'Ada', email: 'a@b.de' }
    );
    expect(result.setPasswordUrl).toMatch(
      /^https:\/\/my-culture\.example\/set-password\?token=/
    );
  });
});

describe('POST /api/auth/set-password', () => {
  const TOKEN = 'a'.repeat(43);
  const request = (body: unknown) =>
    jsonRequest('/api/auth/set-password', 'POST', body);
  const record = (overrides = {}) => ({
    id: 't1',
    userId: 9,
    expiresAt: new Date(Date.now() + 3_600_000),
    usedAt: null,
    ...overrides,
  });

  it('sets the password, marks the link used and the account verified', async () => {
    db.passwordToken.findUnique.mockResolvedValue(record());
    db.passwordToken.updateMany.mockResolvedValue({ count: 1 });

    const res = await setPassword(
      request({ token: TOKEN, password: 'Ein-gutes-Passwort' })
    );

    expect(res.status).toBe(200);
    expect(db.passwordToken.findUnique.mock.calls[0][0].where).toEqual({
      tokenHash: hashToken(TOKEN),
    });
    expect(db.passwordToken.updateMany.mock.calls[0][0].where).toEqual({
      id: 't1',
      usedAt: null,
    });
    const update = db.user.update.mock.calls[0][0];
    expect(update.where).toEqual({ id: 9 });
    expect(update.data.verified).toBe(true);
    expect(
      await comparePassword('Ein-gutes-Passwort', update.data.password)
    ).toBe(true);
  });

  it.each([
    ['unknown', null],
    ['expired', record({ expiresAt: new Date(Date.now() - 1000) })],
    ['already used', record({ usedAt: new Date() })],
  ])('refuses an %s link with the same answer', async (_label, found) => {
    db.passwordToken.findUnique.mockResolvedValue(found);
    const res = await setPassword(
      request({ token: TOKEN, password: 'Ein-gutes-Passwort' })
    );
    expect(res.status).toBe(400);
    expect((await res.json()).message).toMatch(/invalid or has expired/);
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it('refuses the second of two parallel uses', async () => {
    db.passwordToken.findUnique.mockResolvedValue(record());
    db.passwordToken.updateMany.mockResolvedValue({ count: 0 });
    const res = await setPassword(
      request({ token: TOKEN, password: 'Ein-gutes-Passwort' })
    );
    expect(res.status).toBe(400);
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it('refuses a short password', async () => {
    const res = await setPassword(request({ token: TOKEN, password: 'kurz' }));
    expect(res.status).toBe(400);
    expect((await res.json()).message).toMatch(/at least 10/);
    expect(db.passwordToken.findUnique).not.toHaveBeenCalled();
  });

  it('treats a malformed token as an invalid link', async () => {
    const res = await setPassword(
      request({ token: 'x', password: 'Ein-gutes-Passwort' })
    );
    expect((await res.json()).message).toMatch(/invalid or has expired/);
  });
});

describe('POST /api/organizations/:id/admin', () => {
  const call = (
    role: 'SUPER_ADMIN' | 'ADMIN',
    body: unknown = { name: 'Ada Admin', email: 'Ada@Example.com' }
  ) =>
    assignAdmin(
      jsonRequest('/api/organizations/5/admin', 'POST', body, asUser(role)),
      params(5)
    );

  beforeEach(() => {
    vi.stubEnv('EMAIL_HOST', '');
  });

  it('assigns an admin and returns the link to pass on', async () => {
    db.organization.findFirst.mockResolvedValue({ id: 5, name: 'Verein' });
    db.user.findUnique.mockResolvedValue(null);
    db.user.create.mockImplementation(async ({ data }) => ({ id: 9, ...data }));

    const res = await call('SUPER_ADMIN');
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(db.organization.findFirst.mock.calls[0][0].where).toEqual({
      id: 5,
      approvalStatus: 'approved',
    });
    expect(db.organization.update.mock.calls[0][0].data).toEqual({
      adminName: 'Ada Admin',
      adminEmail: 'ada@example.com',
    });
    expect(body.data).toMatchObject({
      email: 'ada@example.com',
      emailed: false,
    });
    expect(body.data.setPasswordUrl).toContain('/set-password?token=');
  });

  it('refuses organisation admins', async () => {
    expect((await call('ADMIN')).status).toBe(403);
    expect(db.user.create).not.toHaveBeenCalled();
  });

  it('returns 409 when the email belongs to a super admin', async () => {
    db.organization.findFirst.mockResolvedValue({ id: 5, name: 'Verein' });
    db.user.findUnique.mockResolvedValue({
      role: 'SUPER_ADMIN',
      organizationId: null,
    });
    const res = await call('SUPER_ADMIN');
    expect(res.status).toBe(409);
    expect(db.user.create).not.toHaveBeenCalled();
  });

  it('returns 404 for organisations that are not approved', async () => {
    db.organization.findFirst.mockResolvedValue(null);
    expect((await call('SUPER_ADMIN')).status).toBe(404);
  });

  it('validates name and email', async () => {
    expect(
      (await call('SUPER_ADMIN', { name: 'A', email: 'nope' })).status
    ).toBe(400);
  });
});
