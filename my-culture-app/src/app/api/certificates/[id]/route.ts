// /api/certificates/:id
// GET    dashboard: one certificate with its recipients' links
// DELETE dashboard: delete it; all its links stop working
// Certificates of other organisations answer 404, as if they did not exist.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DASHBOARD_ROLES, loadActor, requireRole } from '@/lib/authz';
import {
  certificateScope,
  certificateSelect,
  logCertificateEvent,
  toAdminCertificate,
} from '@/lib/certificates';
import { CertificateIdSchema } from '@/lib/schemas/certificate';
import { notFound, serverError } from '@/lib/route-errors';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: Request, context: Context) {
  const auth = requireRole(req, DASHBOARD_ROLES);
  if (auth.response) return auth.response;

  const id = CertificateIdSchema.safeParse((await context.params).id);
  if (!id.success) return notFound('Certificate not found');

  try {
    const actor = await loadActor(auth.user.userId);
    if (!actor) return notFound('Certificate not found');
    const certificate = await prisma.certificate.findFirst({
      where: { id: id.data, ...certificateScope(actor) },
      select: certificateSelect,
    });
    if (!certificate) return notFound('Certificate not found');
    return NextResponse.json(toAdminCertificate(req, certificate));
  } catch (error) {
    return serverError('Get certificate', error);
  }
}

export async function DELETE(req: Request, context: Context) {
  const auth = requireRole(req, DASHBOARD_ROLES);
  if (auth.response) return auth.response;

  const id = CertificateIdSchema.safeParse((await context.params).id);
  if (!id.success) return notFound('Certificate not found');

  try {
    const actor = await loadActor(auth.user.userId);
    if (!actor) return notFound('Certificate not found');
    // Scope and delete in one statement.
    const { count } = await prisma.certificate.deleteMany({
      where: { id: id.data, ...certificateScope(actor) },
    });
    if (count === 0) return notFound('Certificate not found');
    logCertificateEvent('deleted', {
      certificateId: id.data,
      userId: actor.id,
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return serverError('Delete certificate', error);
  }
}
