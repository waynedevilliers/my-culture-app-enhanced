// GET /api/organizations/applications - pending applications (super admin).

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse } from '@/lib/api';
import { requireRole, SUPER_ADMIN_ONLY } from '@/lib/authz';
import { adminOrganizationSelect, withImage } from '@/lib/organizations';
import { serverError } from '@/lib/route-errors';

export async function GET(req: Request) {
  const auth = requireRole(req, SUPER_ADMIN_ONLY);
  if (auth.response) return auth.response;

  try {
    const applications = await prisma.organization.findMany({
      where: { approvalStatus: 'pending' },
      select: adminOrganizationSelect,
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
    return NextResponse.json(successResponse(applications.map(withImage)));
  } catch (error) {
    return serverError('List applications', error);
  }
}
