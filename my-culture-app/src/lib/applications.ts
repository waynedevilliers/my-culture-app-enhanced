// Approve or reject a pending application. The status check and the update
// happen in one statement, so an application is decided only once.

import { NextResponse } from 'next/server';
import { prisma } from './prisma';
import { successResponse } from './api';
import { requireRole, SUPER_ADMIN_ONLY } from './authz';
import { IdSchema } from './schemas/organization';
import { conflict, notFound, serverError } from './route-errors';

export async function decideApplication(
  req: Request,
  rawId: string,
  decision:
    { status: 'approved' } | { status: 'rejected'; rejectionNotes?: string }
) {
  const auth = requireRole(req, SUPER_ADMIN_ONLY);
  if (auth.response) return auth.response;

  const id = IdSchema.safeParse(rawId);
  if (!id.success) return notFound('Application not found');

  const now = new Date();
  const data =
    decision.status === 'approved'
      ? { approvalStatus: 'approved', approvedAt: now, published: true }
      : {
          approvalStatus: 'rejected',
          rejectedAt: now,
          rejectionNotes: decision.rejectionNotes ?? null,
          published: false,
        };

  try {
    const { count } = await prisma.organization.updateMany({
      where: { id: id.data, approvalStatus: 'pending' },
      data,
    });
    if (count === 0) {
      const exists = await prisma.organization.findUnique({
        where: { id: id.data },
        select: { approvalStatus: true },
      });
      if (!exists) return notFound('Application not found');
      return conflict(`Application was already ${exists.approvalStatus}`);
    }
    return NextResponse.json(
      successResponse({ id: id.data, approvalStatus: decision.status })
    );
  } catch (error) {
    return serverError(`Application ${decision.status}`, error);
  }
}
