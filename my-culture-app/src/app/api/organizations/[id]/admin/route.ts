// POST /api/organizations/:id/admin - super admin assigns (or replaces) the
// admin of an approved organisation. The person gets a set-password link.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { successResponse } from '@/lib/api';
import { requireRole, SUPER_ADMIN_ONLY } from '@/lib/authz';
import { IdSchema } from '@/lib/schemas/organization';
import {
  adminEmailConflict,
  assignOrganizationAdmin,
} from '@/lib/organization-admins';
import {
  conflict,
  notFound,
  readJson,
  serverError,
  validationError,
} from '@/lib/route-errors';

const AssignAdminSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(200),
  email: z
    .string()
    .trim()
    .max(255)
    .toLowerCase()
    .pipe(z.email('Please enter a valid email address')),
});

type Context = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: Context) {
  const auth = requireRole(req, SUPER_ADMIN_ONLY);
  if (auth.response) return auth.response;

  const id = IdSchema.safeParse((await context.params).id);
  if (!id.success) return notFound('Organization not found');

  const parsed = AssignAdminSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const organization = await prisma.organization.findFirst({
      where: { id: id.data, approvalStatus: 'approved' },
      select: { id: true, name: true },
    });
    if (!organization) return notFound('Organization not found');

    const problem = await adminEmailConflict(
      parsed.data.email,
      organization.id
    );
    if (problem) return conflict(problem);

    // Keep the organisation's record of its admin in step.
    await prisma.organization.update({
      where: { id: organization.id },
      data: { adminName: parsed.data.name, adminEmail: parsed.data.email },
    });
    const admin = await assignOrganizationAdmin(req, organization, parsed.data);

    return NextResponse.json(
      successResponse({
        email: admin.email,
        emailed: admin.emailed,
        setPasswordUrl: admin.setPasswordUrl,
      }),
      { status: 201 }
    );
  } catch (error) {
    return serverError('Assign organization admin', error);
  }
}
