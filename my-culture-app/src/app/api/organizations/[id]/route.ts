// /api/organizations/:id
// GET    public: one published organisation
// PUT    dashboard: update (also used to toggle `published`). Organisation
//        admins may edit their own organisation, but not its name or
//        publication.
// DELETE super admin: delete

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  canManageOrganization,
  DASHBOARD_ROLES,
  isSuperAdmin,
  loadActor,
  requireRole,
  SUPER_ADMIN_ONLY,
} from '@/lib/authz';
import {
  adminOrganizationSelect,
  publicOrganizationSelect,
  publicOrganizationWhere,
  withImage,
} from '@/lib/organizations';
import { IdSchema, OrganizationUpdateSchema } from '@/lib/schemas/organization';
import {
  badRequest,
  conflict,
  forbidden,
  isPrismaError,
  notFound,
  readJson,
  serverError,
  validationError,
} from '@/lib/route-errors';

type Context = { params: Promise<{ id: string }> };

async function parseId(context: Context) {
  return IdSchema.safeParse((await context.params).id);
}

export async function GET(_req: Request, context: Context) {
  const id = await parseId(context);
  if (!id.success) return notFound('Organization not found');

  try {
    const organization = await prisma.organization.findFirst({
      where: { id: id.data, ...publicOrganizationWhere },
      select: publicOrganizationSelect,
    });
    if (!organization) return notFound('Organization not found');
    return NextResponse.json(withImage(organization));
  } catch (error) {
    return serverError('Get organization', error);
  }
}

export async function PUT(req: Request, context: Context) {
  const auth = requireRole(req, DASHBOARD_ROLES);
  if (auth.response) return auth.response;

  const id = await parseId(context);
  if (!id.success) return notFound('Organization not found');

  const parsed = OrganizationUpdateSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  const { imageId, ...fields } = parsed.data;

  try {
    const actor = await loadActor(auth.user.userId);
    if (!actor || !canManageOrganization(actor, id.data)) {
      return forbidden('You can only edit your own organization');
    }

    if (!isSuperAdmin(actor)) {
      // The edit form always sends name and published; refuse only changes.
      const current = await prisma.organization.findUnique({
        where: { id: id.data },
        select: { name: true, published: true },
      });
      if (!current) return notFound('Organization not found');
      if (
        (fields.name !== undefined && fields.name !== current.name) ||
        (fields.published !== undefined &&
          fields.published !== current.published)
      ) {
        return forbidden(
          'Only super admins can change the name or publication'
        );
      }
    }

    if (imageId) {
      const image = await prisma.image.findUnique({ where: { id: imageId } });
      if (!image) return badRequest('Image not found');
    }

    const organization = await prisma.organization.update({
      where: { id: id.data },
      data: {
        ...fields,
        ...(imageId !== undefined ? { logoId: imageId } : {}),
      },
      select: adminOrganizationSelect,
    });
    return NextResponse.json(withImage(organization), { status: 202 });
  } catch (error) {
    if (isPrismaError(error, 'P2025'))
      return notFound('Organization not found');
    if (isPrismaError(error, 'P2002')) {
      return conflict('An organization with this email already exists');
    }
    return serverError('Update organization', error);
  }
}

export async function DELETE(req: Request, context: Context) {
  const auth = requireRole(req, SUPER_ADMIN_ONLY);
  if (auth.response) return auth.response;

  const id = await parseId(context);
  if (!id.success) return notFound('Organization not found');

  try {
    await prisma.organization.delete({ where: { id: id.data } });
    return NextResponse.json({
      message: `Entry with id ${id.data} was deleted successfully`,
    });
  } catch (error) {
    if (isPrismaError(error, 'P2025'))
      return notFound('Organization not found');
    return serverError('Delete organization', error);
  }
}
