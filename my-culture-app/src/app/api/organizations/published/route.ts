// GET /api/organizations/published - public list for the landing page and
// the organisations page.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  publicOrganizationSelect,
  publicOrganizationWhere,
  withImage,
} from '@/lib/organizations';
import { serverError } from '@/lib/route-errors';

export const dynamic = 'force-dynamic';

const MAX_PUBLISHED = 100;

export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      where: publicOrganizationWhere,
      select: publicOrganizationSelect,
      orderBy: { createdAt: 'desc' },
      take: MAX_PUBLISHED,
    });
    return NextResponse.json(organizations.map(withImage));
  } catch (error) {
    return serverError('List published organizations', error);
  }
}
