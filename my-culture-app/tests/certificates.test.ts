// Certificates: schema, private links, organisation scope, routes, email.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  organization: { findFirst: vi.fn() },
  certificate: {
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
  certificateRecipient: { updateMany: vi.fn() },
}));
vi.mock('@/lib/prisma', () => ({ prisma: db }));

const smtp = vi.hoisted(() => ({
  sendMail: vi.fn(),
  createTransport: vi.fn(),
}));
vi.mock('nodemailer', () => ({
  default: { createTransport: smtp.createTransport },
}));

import { CertificateSchema } from '@/lib/schemas/certificate';
import {
  certificateMail,
  certificateScope,
  isRecipientCode,
  newRecipientCode,
} from '@/lib/certificates';
import { GET as list, POST as create } from '@/app/api/certificates/route';
import {
  DELETE as remove,
  GET as getOne,
} from '@/app/api/certificates/[id]/route';
import { POST as send } from '@/app/api/certificates/[id]/send/route';
import { PATCH as updateRecipient } from '@/app/api/certificates/[id]/recipients/[recipientId]/route';
import { asUser, jsonRequest, params } from './helpers/requests';

const SUPER = { id: 1, role: 'SUPER_ADMIN', organizationId: null };
const ORG_ADMIN = { id: 2, role: 'ADMIN', organizationId: 7 };
const LOOSE_ADMIN = { id: 3, role: 'ADMIN', organizationId: null };

const CODE = 'A'.repeat(32);

const validInput = {
  organizationId: 7,
  language: 'de',
  color: 'blue',
  introText: '  Für herausragendes Engagement verleihen wir das ',
  achievement: 'Kulturpraktikum 2026',
  addition: '',
  signatures: [
    { name: 'Christian Beispiel', role: 'Vorstand' },
    { name: '', role: '' },
  ],
  issuedDate: '2026-11-28',
  recipients: [
    { name: 'Maria Musterfrau', email: 'Maria@Example.com' },
    { name: 'Jonas Beispiel', email: 'jonas@example.com' },
  ],
};

const stored = {
  id: 'cert1',
  language: 'de',
  color: 'blue',
  introText: 'Intro',
  achievement: 'Kulturpraktikum 2026',
  addition: null,
  signatures: [{ name: 'Christian Beispiel', role: 'Vorstand' }],
  issuedDate: new Date('2026-11-28T12:00:00Z'),
  createdAt: new Date(),
  organization: { id: 7, name: 'Musikschule', logo: null },
  recipients: [
    {
      id: 'r1',
      name: 'Maria Musterfrau',
      email: 'maria@example.com',
      code: CODE,
      sentAt: null,
      revokedAt: null,
    },
  ],
};

const SMTP_ENV = {
  EMAIL_HOST: 'smtp.example.com',
  EMAIL_FROM: 'grow <noreply@example.com>',
};

const as = (actor: { id: number; role: string }) => {
  db.user.findUnique.mockResolvedValue(actor);
  return asUser(actor.role as 'ADMIN' | 'SUPER_ADMIN', actor.id);
};

beforeEach(() => {
  vi.clearAllMocks();
  smtp.createTransport.mockReturnValue({ sendMail: smtp.sendMail });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('CertificateSchema', () => {
  it('trims texts, drops empty signature rows and lowercases emails', () => {
    const data = CertificateSchema.parse(validInput);
    expect(data.introText).toBe(
      'Für herausragendes Engagement verleihen wir das'
    );
    expect(data.addition).toBeNull();
    expect(data.signatures).toEqual([
      { name: 'Christian Beispiel', role: 'Vorstand' },
    ]);
    expect(data.recipients[0].email).toBe('maria@example.com');
  });

  it('accepts recipients without an email', () => {
    const data = CertificateSchema.parse({
      ...validInput,
      recipients: [{ name: 'Ohne Mail' }, { name: 'Leere Mail', email: '  ' }],
    });
    expect(data.recipients).toEqual([
      { name: 'Ohne Mail', email: null },
      { name: 'Leere Mail', email: null },
    ]);
  });

  it('defaults to German and green', () => {
    const { language: _l, color: _c, ...rest } = validInput;
    const data = CertificateSchema.parse(rest);
    expect(data.language).toBe('de');
    expect(data.color).toBe('green');
  });

  it.each([
    ['no signature with a name', { signatures: [{ name: ' ', role: 'x' }] }],
    [
      'more than three signatures',
      { signatures: Array(4).fill({ name: 'A', role: 'B' }) },
    ],
    ['no recipients', { recipients: [] }],
    ['an invalid email', { recipients: [{ name: 'A', email: 'nope' }] }],
    [
      'a recipient without name',
      { recipients: [{ name: ' ', email: 'a@b.de' }] },
    ],
    ['an invalid date', { issuedDate: '28.11.2026' }],
    ['an unknown language', { language: 'fr' }],
    ['an unknown colour', { color: 'pink' }],
    ['a missing achievement', { achievement: '' }],
    ['a too long achievement', { achievement: 'x'.repeat(81) }],
  ])('refuses %s', (_name, change) => {
    expect(
      CertificateSchema.safeParse({ ...validInput, ...change }).success
    ).toBe(false);
  });
});

describe('private links', () => {
  it('creates random 32-character codes', () => {
    const codes = new Set(Array.from({ length: 100 }, newRecipientCode));
    expect(codes.size).toBe(100);
    for (const code of codes) expect(isRecipientCode(code)).toBe(true);
  });

  it.each(['', 'abc', '1', `${CODE}x`, `${'A'.repeat(31)}/`])(
    'does not accept %j as a code',
    (code) => {
      expect(isRecipientCode(code)).toBe(false);
    }
  );
});

describe('certificateScope', () => {
  it('gives super admins every organisation', () => {
    expect(
      certificateScope({ role: 'SUPER_ADMIN', organizationId: null })
    ).toEqual({});
  });

  it('limits organisation admins to their organisation', () => {
    expect(certificateScope({ role: 'ADMIN', organizationId: 7 })).toEqual({
      organizationId: 7,
    });
  });

  it('gives an admin without organisation nothing', () => {
    expect(certificateScope({ role: 'ADMIN', organizationId: null })).toEqual({
      organizationId: -1,
    });
  });
});

describe('certificateMail', () => {
  const input = {
    to: 'maria@example.com',
    recipientName: '<b>Maria</b>',
    organizationName: 'Musik & Co',
    achievement: 'Klavier',
    link: 'https://example.com/certificates/abc',
  };

  it('writes German by default and escapes HTML', () => {
    const mail = certificateMail({ ...input, language: 'de' });
    expect(mail.subject).toBe('Ihr Zertifikat von Musik & Co');
    expect(mail.html).toContain('&lt;b&gt;Maria&lt;/b&gt;');
    expect(mail.html).toContain('Musik &amp; Co');
    expect(mail.html).not.toContain('<b>Maria');
    expect(mail.text).toContain(input.link);
  });

  it('writes English for English certificates', () => {
    const mail = certificateMail({ ...input, language: 'en' });
    expect(mail.subject).toBe('Your certificate from Musik & Co');
    expect(mail.text).toContain('Hello <b>Maria</b>');
  });
});

describe('GET /api/certificates', () => {
  beforeEach(() => {
    db.certificate.findMany.mockResolvedValue([stored]);
    db.certificate.count.mockResolvedValue(1);
  });

  it('needs a login', async () => {
    const res = await list(jsonRequest('/api/certificates', 'GET'));
    expect(res.status).toBe(401);
  });

  it('shows organisation admins only their organisation', async () => {
    const res = await list(
      jsonRequest('/api/certificates', 'GET', undefined, as(ORG_ADMIN))
    );
    expect(res.status).toBe(200);
    expect(db.certificate.findMany.mock.calls[0][0].where).toEqual({
      organizationId: 7,
    });
  });

  it('searches achievement, organisation and recipients', async () => {
    await list(
      jsonRequest('/api/certificates?search=maria', 'GET', undefined, as(SUPER))
    );
    const where = db.certificate.findMany.mock.calls[0][0].where;
    expect(where.OR).toHaveLength(3);
    expect(JSON.stringify(where)).toContain('maria');
  });

  it('returns links, not codes', async () => {
    vi.stubEnv('APP_URL', 'https://grow.example');
    const res = await list(
      jsonRequest('/api/certificates', 'GET', undefined, as(SUPER))
    );
    const body = await res.json();
    const recipient = body.results[0].recipients[0];
    expect(recipient.url).toBe(`https://grow.example/certificates/${CODE}`);
    expect(recipient).not.toHaveProperty('code');
    expect(body.totalPages).toBe(1);
  });
});

describe('POST /api/certificates', () => {
  beforeEach(() => {
    db.organization.findFirst.mockResolvedValue({ id: 7 });
    db.certificate.create.mockResolvedValue(stored);
  });

  it('refuses invalid input', async () => {
    const res = await create(
      jsonRequest(
        '/api/certificates',
        'POST',
        { ...validInput, recipients: [] },
        as(SUPER)
      )
    );
    expect(res.status).toBe(400);
    expect(db.certificate.create).not.toHaveBeenCalled();
  });

  it('needs an organisation from super admins', async () => {
    const { organizationId: _o, ...input } = validInput;
    const res = await create(
      jsonRequest('/api/certificates', 'POST', input, as(SUPER))
    );
    expect(res.status).toBe(400);
  });

  it('creates the certificate with one random code per recipient', async () => {
    const res = await create(
      jsonRequest('/api/certificates', 'POST', validInput, as(SUPER))
    );
    expect(res.status).toBe(201);
    const { data } = db.certificate.create.mock.calls[0][0];
    expect(data.organizationId).toBe(7);
    expect(data.createdById).toBe(1);
    expect(data.issuedDate.toISOString()).toBe('2026-11-28T12:00:00.000Z');
    const codes = data.recipients.create.map((r: { code: string }) => r.code);
    expect(codes).toHaveLength(2);
    expect(new Set(codes).size).toBe(2);
    expect(codes.every(isRecipientCode)).toBe(true);
    expect(data.recipients.create[0].email).toBe('maria@example.com');
  });

  it('always uses the organisation of an organisation admin', async () => {
    const res = await create(
      jsonRequest(
        '/api/certificates',
        'POST',
        { ...validInput, organizationId: 99 },
        as(ORG_ADMIN)
      )
    );
    expect(res.status).toBe(201);
    expect(db.organization.findFirst.mock.calls[0][0].where.id).toBe(7);
    expect(db.certificate.create.mock.calls[0][0].data.organizationId).toBe(7);
  });

  it('refuses admins without an organisation', async () => {
    const res = await create(
      jsonRequest('/api/certificates', 'POST', validInput, as(LOOSE_ADMIN))
    );
    expect(res.status).toBe(403);
    expect(db.certificate.create).not.toHaveBeenCalled();
  });

  it('refuses organisations that are not approved', async () => {
    db.organization.findFirst.mockResolvedValue(null);
    const res = await create(
      jsonRequest('/api/certificates', 'POST', validInput, as(SUPER))
    );
    expect(res.status).toBe(400);
    expect(db.organization.findFirst.mock.calls[0][0].where).toEqual({
      id: 7,
      approvalStatus: 'approved',
    });
  });

  it('logs the creation without names or emails', async () => {
    await create(
      jsonRequest('/api/certificates', 'POST', validInput, as(SUPER))
    );
    const logged = vi.mocked(console.info).mock.calls.flat().join(' ');
    expect(logged).toContain('certificate.created');
    expect(logged).not.toContain('maria');
    expect(logged).not.toContain('Maria');
  });
});

describe('GET and DELETE /api/certificates/:id', () => {
  it('answers 404 for certificates of other organisations', async () => {
    db.certificate.findFirst.mockResolvedValue(null);
    const res = await getOne(
      jsonRequest('/api/certificates/cert1', 'GET', undefined, as(ORG_ADMIN)),
      params('cert1')
    );
    expect(res.status).toBe(404);
    expect(db.certificate.findFirst.mock.calls[0][0].where).toEqual({
      id: 'cert1',
      organizationId: 7,
    });
  });

  it('returns a certificate in scope', async () => {
    db.certificate.findFirst.mockResolvedValue(stored);
    const res = await getOne(
      jsonRequest('/api/certificates/cert1', 'GET', undefined, as(ORG_ADMIN)),
      params('cert1')
    );
    expect(res.status).toBe(200);
    expect((await res.json()).achievement).toBe('Kulturpraktikum 2026');
  });

  it('deletes only within the scope', async () => {
    db.certificate.deleteMany.mockResolvedValue({ count: 1 });
    const res = await remove(
      jsonRequest(
        '/api/certificates/cert1',
        'DELETE',
        undefined,
        as(ORG_ADMIN)
      ),
      params('cert1')
    );
    expect(res.status).toBe(204);
    expect(db.certificate.deleteMany).toHaveBeenCalledWith({
      where: { id: 'cert1', organizationId: 7 },
    });
  });

  it('answers 404 when nothing in scope was deleted', async () => {
    db.certificate.deleteMany.mockResolvedValue({ count: 0 });
    const res = await remove(
      jsonRequest(
        '/api/certificates/cert1',
        'DELETE',
        undefined,
        as(ORG_ADMIN)
      ),
      params('cert1')
    );
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/certificates/:id/recipients/:recipientId', () => {
  const ctx = {
    params: Promise.resolve({ id: 'cert1', recipientId: 'r1' }),
  };

  it('turns a link off within the scope', async () => {
    db.certificateRecipient.updateMany.mockResolvedValue({ count: 1 });
    const res = await updateRecipient(
      jsonRequest(
        '/api/certificates/cert1/recipients/r1',
        'PATCH',
        { revoked: true },
        as(ORG_ADMIN)
      ),
      ctx
    );
    expect(res.status).toBe(200);
    const call = db.certificateRecipient.updateMany.mock.calls[0][0];
    expect(call.where).toEqual({
      id: 'r1',
      certificateId: 'cert1',
      certificate: { organizationId: 7 },
    });
    expect(call.data.revokedAt).toBeInstanceOf(Date);
  });

  it('turns a link on again', async () => {
    db.certificateRecipient.updateMany.mockResolvedValue({ count: 1 });
    await updateRecipient(
      jsonRequest(
        '/api/certificates/cert1/recipients/r1',
        'PATCH',
        { revoked: false },
        as(SUPER)
      ),
      ctx
    );
    expect(db.certificateRecipient.updateMany.mock.calls[0][0].data).toEqual({
      revokedAt: null,
    });
  });

  it('answers 404 outside the scope', async () => {
    db.certificateRecipient.updateMany.mockResolvedValue({ count: 0 });
    const res = await updateRecipient(
      jsonRequest(
        '/api/certificates/cert1/recipients/r1',
        'PATCH',
        { revoked: true },
        as(ORG_ADMIN)
      ),
      ctx
    );
    expect(res.status).toBe(404);
  });

  it('refuses a body without `revoked`', async () => {
    const res = await updateRecipient(
      jsonRequest(
        '/api/certificates/cert1/recipients/r1',
        'PATCH',
        {},
        as(SUPER)
      ),
      ctx
    );
    expect(res.status).toBe(400);
  });
});

describe('POST /api/certificates/:id/send', () => {
  const toSend = {
    id: 'cert1',
    achievement: 'Klavier',
    language: 'en',
    organization: { name: 'Musikschule' },
    recipients: [
      { id: 'r1', name: 'Maria', email: 'maria@example.com', code: CODE },
      {
        id: 'r2',
        name: 'Jonas',
        email: 'jonas@example.com',
        code: 'B'.repeat(32),
      },
    ],
  };

  beforeEach(() => {
    db.certificate.findFirst.mockResolvedValue(toSend);
    db.certificateRecipient.updateMany.mockResolvedValue({ count: 1 });
  });

  it('sends nothing without SMTP and says so', async () => {
    const res = await send(
      jsonRequest('/api/certificates/cert1/send', 'POST', undefined, as(SUPER)),
      params('cert1')
    );
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual({
      emailConfigured: false,
      requested: 2,
      sent: 0,
      failed: 0,
    });
    expect(smtp.sendMail).not.toHaveBeenCalled();
    expect(db.certificateRecipient.updateMany).not.toHaveBeenCalled();
  });

  it('by default sends to recipients with an email, not sent yet and not revoked', async () => {
    await send(
      jsonRequest(
        '/api/certificates/cert1/send',
        'POST',
        undefined,
        as(ORG_ADMIN)
      ),
      params('cert1')
    );
    const query = db.certificate.findFirst.mock.calls[0][0];
    expect(query.where).toEqual({ id: 'cert1', organizationId: 7 });
    expect(query.select.recipients.where).toEqual({
      revokedAt: null,
      email: { not: null },
      sentAt: null,
    });
  });

  it('can send chosen recipients again', async () => {
    await send(
      jsonRequest(
        '/api/certificates/cert1/send',
        'POST',
        { recipientIds: ['r1'] },
        as(SUPER)
      ),
      params('cert1')
    );
    expect(
      db.certificate.findFirst.mock.calls[0][0].select.recipients.where
    ).toEqual({ revokedAt: null, email: { not: null }, id: { in: ['r1'] } });
  });

  it('emails each link and marks only the sent ones', async () => {
    for (const [key, value] of Object.entries(SMTP_ENV)) vi.stubEnv(key, value);
    vi.stubEnv('APP_URL', 'https://grow.example');
    smtp.sendMail
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(Object.assign(new Error('x'), { code: 'EAUTH' }));

    const res = await send(
      jsonRequest('/api/certificates/cert1/send', 'POST', undefined, as(SUPER)),
      params('cert1')
    );
    expect((await res.json()).data).toEqual({
      emailConfigured: true,
      requested: 2,
      sent: 1,
      failed: 1,
    });
    expect(smtp.sendMail).toHaveBeenCalledTimes(2);
    const first = smtp.sendMail.mock.calls[0][0];
    expect(first.to).toBe('maria@example.com');
    expect(first.subject).toBe('Your certificate from Musikschule');
    expect(first.text).toContain(`https://grow.example/certificates/${CODE}`);
    expect(db.certificateRecipient.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['r1'] } },
      data: { sentAt: expect.any(Date) },
    });
  });

  it('answers 404 outside the scope', async () => {
    db.certificate.findFirst.mockResolvedValue(null);
    const res = await send(
      jsonRequest(
        '/api/certificates/cert1/send',
        'POST',
        undefined,
        as(ORG_ADMIN)
      ),
      params('cert1')
    );
    expect(res.status).toBe(404);
  });
});
