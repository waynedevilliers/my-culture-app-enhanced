// /api/organizations/:id
// GET    public: one published organisation
// PUT    dashboard: update (also used to toggle `published`)
// DELETE dashboard: delete

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DASHBOARD_ROLES, requireRole } from '@/lib/authz';
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
  const auth = requireRole(req, DASHBOARD_ROLES);
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
