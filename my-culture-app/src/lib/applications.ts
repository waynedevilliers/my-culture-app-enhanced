// Approve or reject a pending application. The status check and the update
// happen in one statement, so an application is decided only once.

import { NextResponse } from 'next/server';
import { prisma } from './prisma';
import { successResponse } from './api';
import { requireRole, SUPER_ADMIN_ONLY } from './authz';
import { sendMail } from './email';
import { IdSchema } from './schemas/organization';
import { conflict, notFound, serverError } from './route-errors';
import {
  adminEmailConflict,
  assignOrganizationAdmin,
  type AssignedAdmin,
} from './organization-admins';
import { approvalMail, rejectionMail } from './organization-emails';

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

  try {
    const application = await prisma.organization.findUnique({
      where: { id: id.data },
      select: {
        id: true,
        name: true,
        email: true,
        adminName: true,
        adminEmail: true,
        approvalStatus: true,
      },
    });
    if (!application) return notFound('Application not found');
    if (application.approvalStatus !== 'pending') {
      return conflict(`Application was already ${application.approvalStatus}`);
    }

    // Check the admin before approving, so a refused admin email does not
    // leave a half-finished approval.
    const hasAdmin = decision.status === 'approved' && !!application.adminEmail;
    if (hasAdmin) {
      const problem = await adminEmailConflict(
        application.adminEmail!,
        application.id
      );
      if (problem) return conflict(problem);
    }

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

    const { count } = await prisma.organization.updateMany({
      where: { id: id.data, approvalStatus: 'pending' },
      data,
    });
    if (count === 0) return conflict('Application was already decided');

    let admin: AssignedAdmin | undefined;
    if (hasAdmin) {
      admin = await assignOrganizationAdmin(req, application, {
        name: application.adminName || application.name,
        email: application.adminEmail!,
      });
    }

    // Tell the organisation (its own email, else the admin's).
    const notify = application.email || application.adminEmail;
    if (notify) {
      await sendMail(
        decision.status === 'approved'
          ? approvalMail(notify, application.name)
          : rejectionMail(notify, application.name, decision.rejectionNotes)
      );
    }

    return NextResponse.json(
      successResponse({
        id: id.data,
        approvalStatus: decision.status,
        ...(admin
          ? {
              admin: {
                email: admin.email,
                emailed: admin.emailed,
                setPasswordUrl: admin.setPasswordUrl,
              },
            }
          : {}),
      })
    );
  } catch (error) {
    return serverError(`Application ${decision.status}`, error);
  }
}
