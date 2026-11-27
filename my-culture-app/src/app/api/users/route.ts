// GET /api/users - dashboard user list, paginated.
// Super admins see everyone; organisation admins see the admins of their
// own organisation only.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaginationParams } from '@/lib/api';
import {
  DASHBOARD_ROLES,
  isSuperAdmin,
  loadActor,
  requireRole,
} from '@/lib/authz';
import { toUiUser, userSelect } from '@/lib/users';
import { serverError } from '@/lib/route-errors';

export async function GET(req: Request) {
  const auth = requireRole(req, DASHBOARD_ROLES);
  if (auth.response) return auth.response;

  const query = new URL(req.url).searchParams;
  const { page, limit, skip } = getPaginationParams(
    query.get('page') ?? undefined,
    query.get('limit') ?? undefined
  );

  try {
    const actor = await loadActor(auth.user.userId);
    if (!actor) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    // An organisation admin without an organisation sees nobody.
    const where = isSuperAdmin(actor)
      ? {}
      : { organizationId: actor.organizationId ?? -1 };

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      results: users.map(toUiUser),
    });
  } catch (error) {
    return serverError('List users', error);
  }
}
