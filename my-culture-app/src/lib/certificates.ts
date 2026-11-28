// Certificates: private links, organisation scope, response shape and email.
//
// Each recipient has a random `code` (24 bytes, base64url). The link
// /certificates/<code> is the only way to open a certificate without logging
// in, so codes are never derived from ids, names or organisations.

import { randomBytes } from 'crypto';
import type { Prisma } from '@prisma/client';
import { appUrl } from './app-url';
import { isSuperAdmin } from './authz';
import { escapeHtml } from './escape-html';
import type { Mail } from './email';
import type { Role } from './types';

export const newRecipientCode = () => randomBytes(24).toString('base64url');

/** Codes are 32 base64url characters; anything else is not looked up. */
export const isRecipientCode = (code: string) =>
  /^[A-Za-z0-9_-]{32}$/.test(code);

export const certificateUrl = (req: Request, code: string) =>
  `${appUrl(req)}/certificates/${code}`;

/** Certificates this actor may see and manage. */
export function certificateScope(actor: {
  role: Role;
  organizationId: number | null;
}): Prisma.CertificateWhereInput {
  // An admin without an organisation sees nothing (-1 matches no id).
  return isSuperAdmin(actor)
    ? {}
    : { organizationId: actor.organizationId ?? -1 };
}

export const certificateSelect = {
  id: true,
  language: true,
  color: true,
  introText: true,
  achievement: true,
  addition: true,
  signatures: true,
  issuedDate: true,
  createdAt: true,
  organization: {
    select: { id: true, name: true, logo: { select: { url: true } } },
  },
  recipients: {
    select: {
      id: true,
      name: true,
      email: true,
      code: true,
      sentAt: true,
      revokedAt: true,
    },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.CertificateSelect;

type SelectedCertificate = Prisma.CertificateGetPayload<{
  select: typeof certificateSelect;
}>;

/** Dashboard shape: each recipient's private link instead of the code. */
export function toAdminCertificate(
  req: Request,
  certificate: SelectedCertificate
) {
  return {
    ...certificate,
    recipients: certificate.recipients.map(({ code, ...recipient }) => ({
      ...recipient,
      url: certificateUrl(req, code),
    })),
  };
}

/** Structured log line without names or email addresses. */
export function logCertificateEvent(
  event: string,
  details: Record<string, string | number | boolean | null>
) {
  console.info(JSON.stringify({ event: `certificate.${event}`, ...details }));
}

interface CertificateMailInput {
  to: string;
  recipientName: string;
  organizationName: string;
  achievement: string;
  language: string;
  link: string;
}

const wrap = (body: string) =>
  `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;line-height:1.5">${body}<p style="color:#666;font-size:12px">grow</p></div>`;

/** The email with the private link, in the certificate's language. */
export function certificateMail({
  to,
  recipientName,
  organizationName,
  achievement,
  language,
  link,
}: CertificateMailInput): Mail {
  const name = escapeHtml(recipientName);
  const organization = escapeHtml(organizationName);
  const title = escapeHtml(achievement);
  const safeLink = escapeHtml(link);

  if (language === 'en') {
    return {
      to,
      subject: `Your certificate from ${organizationName}`,
      text:
        `Hello ${recipientName},\n\n` +
        `${organizationName} has issued you the certificate "${achievement}". ` +
        `You can view, print or save it as a PDF here:\n${link}\n\n` +
        `This link is personal. Please only share it with people who may see your certificate.`,
      html: wrap(
        `<p>Hello ${name},</p>` +
          `<p><strong>${organization}</strong> has issued you the certificate <strong>${title}</strong>. You can view, print or save it as a PDF here:</p>` +
          `<p><a href="${safeLink}">${safeLink}</a></p>` +
          `<p>This link is personal. Please only share it with people who may see your certificate.</p>`
      ),
    };
  }

  return {
    to,
    subject: `Ihr Zertifikat von ${organizationName}`,
    text:
      `Hallo ${recipientName},\n\n` +
      `${organizationName} hat Ihnen das Zertifikat „${achievement}“ ausgestellt. ` +
      `Hier können Sie es ansehen, drucken oder als PDF speichern:\n${link}\n\n` +
      `Dieser Link ist persönlich. Bitte teilen Sie ihn nur mit Personen, die Ihr Zertifikat sehen dürfen.`,
    html: wrap(
      `<p>Hallo ${name},</p>` +
        `<p><strong>${organization}</strong> hat Ihnen das Zertifikat <strong>${title}</strong> ausgestellt. Hier können Sie es ansehen, drucken oder als PDF speichern:</p>` +
        `<p><a href="${safeLink}">${safeLink}</a></p>` +
        `<p>Dieser Link ist persönlich. Bitte teilen Sie ihn nur mit Personen, die Ihr Zertifikat sehen dürfen.</p>`
    ),
  };
}
