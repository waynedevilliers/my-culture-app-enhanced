// /api/certificates/:id/recipients/:recipientId
// PATCH dashboard: { revoked: true } turns the recipient's link off,
//       { revoked: false } turns it on again (same link).

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DASHBOARD_ROLES, loadActor, requireRole } from '@/lib/authz';
import { certificateScope, logCertificateEvent } from '@/lib/certificates';
import {
  CertificateIdSchema,
  RecipientUpdateSchema,
} from '@/lib/schemas/certificate';
import {
  notFound,
  readJson,
  serverError,
  validationError,
} from '@/lib/route-errors';
import { successResponse } from '@/lib/api';

type Context = { params: Promise<{ id: string; recipientId: string }> };

export async function PATCH(req: Request, context: Context) {
  const auth = requireRole(req, DASHBOARD_ROLES);
  if (auth.response) return auth.response;

  const params = await context.params;
  const id = CertificateIdSchema.safeParse(params.id);
  const recipientId = CertificateIdSchema.safeParse(params.recipientId);
  if (!id.success || !recipientId.success) {
    return notFound('Recipient not found');
  }

  const parsed = RecipientUpdateSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const actor = await loadActor(auth.user.userId);
    if (!actor) return notFound('Recipient not found');

    const revokedAt = parsed.data.revoked ? new Date() : null;
    // Scope check and update in one statement.
    const { count } = await prisma.certificateRecipient.updateMany({
      where: {
        id: recipientId.data,
        certificateId: id.data,
        certificate: certificateScope(actor),
      },
      data: { revokedAt },
    });
    if (count === 0) return notFound('Recipient not found');

    logCertificateEvent(parsed.data.revoked ? 'revoked' : 'restored', {
      certificateId: id.data,
      recipientId: recipientId.data,
      userId: actor.id,
    });
    return NextResponse.json(
      successResponse({ id: recipientId.data, revokedAt })
    );
  } catch (error) {
    return serverError('Update certificate recipient', error);
  }
}
