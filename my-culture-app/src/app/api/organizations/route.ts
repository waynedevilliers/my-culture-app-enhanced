// /api/organizations
// GET  dashboard: approved organisations, paginated
// POST dashboard: create an organisation (approved directly)

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaginationParams } from '@/lib/api';
import { DASHBOARD_ROLES, requireRole } from '@/lib/authz';
import { adminOrganizationSelect, withImage } from '@/lib/organizations';
import { OrganizationSchema } from '@/lib/schemas/organization';
import {
  badRequest,
  conflict,
  isPrismaError,
  readJson,
  serverError,
  validationError,
} from '@/lib/route-errors';

export async function GET(req: Request) {
  const auth = requireRole(req, DASHBOARD_ROLES);
  if (auth.response) return auth.response;

  const query = new URL(req.url).searchParams;
  const { page, limit, skip } = getPaginationParams(
    query.get('page') ?? undefined,
    query.get('limit') ?? undefined
  );
  // Pending and rejected applications are handled on the Applications page.
  const where = { approvalStatus: 'approved' };

  try {
    const [results, totalCount] = await Promise.all([
      prisma.organization.findMany({
        where,
        select: adminOrganizationSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.organization.count({ where }),
    ]);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      results: results.map(withImage),
    });
  } catch (error) {
    return serverError('List organizations', error);
  }
}

export async function POST(req: Request) {
  const auth = requireRole(req, DASHBOARD_ROLES);
  if (auth.response) return auth.response;

  const parsed = OrganizationSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  const { imageId, published, ...fields } = parsed.data;

  try {
    if (imageId) {
      const image = await prisma.image.findUnique({ where: { id: imageId } });
      if (!image) return badRequest('Image not found');
    }

    const organization = await prisma.organization.create({
      data: {
        ...fields,
        published: published ?? false,
        approvalStatus: 'approved',
        approvedAt: new Date(),
        logoId: imageId,
        userId: auth.user.userId,
      },
      select: adminOrganizationSelect,
    });
    return NextResponse.json(withImage(organization), { status: 201 });
  } catch (error) {
    if (isPrismaError(error, 'P2002')) {
      return conflict('An organization with this email already exists');
    }
    return serverError('Create organization', error);
  }
}
