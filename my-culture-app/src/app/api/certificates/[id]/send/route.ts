// /api/certificates/:id/send
// POST dashboard: email each recipient their private link. Without
//      `recipientIds`, all recipients not sent yet; revoked links are never
//      sent. Without SMTP nothing is emailed and the answer says so, so the
//      admin can copy the links instead.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DASHBOARD_ROLES, loadActor, requireRole } from '@/lib/authz';
import { mailConfig, sendMail } from '@/lib/email';
import {
  certificateMail,
  certificateScope,
  certificateUrl,
  logCertificateEvent,
} from '@/lib/certificates';
import { CertificateIdSchema, SendSchema } from '@/lib/schemas/certificate';
import {
  notFound,
  readJson,
  serverError,
  validationError,
} from '@/lib/route-errors';
import { successResponse } from '@/lib/api';

type Context = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: Context) {
  const auth = requireRole(req, DASHBOARD_ROLES);
  if (auth.response) return auth.response;

  const id = CertificateIdSchema.safeParse((await context.params).id);
  if (!id.success) return notFound('Certificate not found');

  const parsed = SendSchema.safeParse((await readJson(req)) ?? {});
  if (!parsed.success) return validationError(parsed.error);
  const { recipientIds } = parsed.data;

  try {
    const actor = await loadActor(auth.user.userId);
    if (!actor) return notFound('Certificate not found');

    const certificate = await prisma.certificate.findFirst({
      where: { id: id.data, ...certificateScope(actor) },
      select: {
        id: true,
        achievement: true,
        language: true,
        organization: { select: { name: true } },
        recipients: {
          where: {
            revokedAt: null,
            ...(recipientIds ? { id: { in: recipientIds } } : { sentAt: null }),
          },
          select: { id: true, name: true, email: true, code: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!certificate) return notFound('Certificate not found');

    const configured = mailConfig() !== null;
    const sentIds: string[] = [];
    if (configured) {
      // One after the other: SMTP servers limit parallel connections.
      for (const recipient of certificate.recipients) {
        const sent = await sendMail(
          certificateMail({
            to: recipient.email,
            recipientName: recipient.name,
            organizationName: certificate.organization.name,
            achievement: certificate.achievement,
            language: certificate.language,
            link: certificateUrl(req, recipient.code),
          })
        );
        if (sent) sentIds.push(recipient.id);
      }
      if (sentIds.length > 0) {
        await prisma.certificateRecipient.updateMany({
          where: { id: { in: sentIds } },
          data: { sentAt: new Date() },
        });
      }
    }

    logCertificateEvent('sent', {
      certificateId: certificate.id,
      userId: actor.id,
      requested: certificate.recipients.length,
      sent: sentIds.length,
      emailConfigured: configured,
    });
    return NextResponse.json(
      successResponse({
        emailConfigured: configured,
        requested: certificate.recipients.length,
        sent: sentIds.length,
        failed: configured ? certificate.recipients.length - sentIds.length : 0,
      })
    );
  } catch (error) {
    return serverError('Send certificate', error);
  }
}
