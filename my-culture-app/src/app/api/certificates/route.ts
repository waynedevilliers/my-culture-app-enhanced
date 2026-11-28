// /api/certificates
// GET  dashboard: certificates, paginated and searchable. Organisation
//      admins see only their organisation's certificates.
// POST dashboard: create a certificate with its recipients. Organisation
//      admins issue for their own organisation; super admins choose one.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaginationParams } from '@/lib/api';
import {
  DASHBOARD_ROLES,
  isSuperAdmin,
  loadActor,
  requireRole,
} from '@/lib/authz';
import {
  certificateScope,
  certificateSelect,
  logCertificateEvent,
  newRecipientCode,
  toAdminCertificate,
} from '@/lib/certificates';
import { CertificateSchema } from '@/lib/schemas/certificate';
import {
  badRequest,
  forbidden,
  readJson,
  serverError,
  validationError,
} from '@/lib/route-errors';

const unauthorized = () =>
  NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

export async function GET(req: Request) {
  const auth = requireRole(req, DASHBOARD_ROLES);
  if (auth.response) return auth.response;

  const query = new URL(req.url).searchParams;
  const { page, limit, skip } = getPaginationParams(
    query.get('page') ?? undefined,
    query.get('limit') ?? undefined
  );
  const search = (query.get('search') ?? '').trim().slice(0, 100);

  try {
    const actor = await loadActor(auth.user.userId);
    if (!actor) return unauthorized();

    const contains = { contains: search, mode: 'insensitive' as const };
    const where = {
      ...certificateScope(actor),
      ...(search
        ? {
            OR: [
              { achievement: contains },
              { organization: { name: contains } },
              {
                recipients: {
                  some: { OR: [{ name: contains }, { email: contains }] },
                },
              },
            ],
          }
        : {}),
    };

    const [results, totalCount] = await Promise.all([
      prisma.certificate.findMany({
        where,
        select: certificateSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.certificate.count({ where }),
    ]);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      results: results.map((certificate) =>
        toAdminCertificate(req, certificate)
      ),
    });
  } catch (error) {
    return serverError('List certificates', error);
  }
}

export async function POST(req: Request) {
  const auth = requireRole(req, DASHBOARD_ROLES);
  if (auth.response) return auth.response;

  const parsed = CertificateSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  const { organizationId, issuedDate, recipients, ...fields } = parsed.data;

  try {
    const actor = await loadActor(auth.user.userId);
    if (!actor) return unauthorized();

    let issuerId: number;
    if (isSuperAdmin(actor)) {
      if (!organizationId) return badRequest('Please choose an organization');
      issuerId = organizationId;
    } else {
      if (!actor.organizationId) {
        return forbidden('Your account is not linked to an organization');
      }
      issuerId = actor.organizationId;
    }

    const organization = await prisma.organization.findFirst({
      where: { id: issuerId, approvalStatus: 'approved' },
      select: { id: true },
    });
    if (!organization) return badRequest('Organization not found');

    // One statement: the certificate and all recipients, or nothing.
    const certificate = await prisma.certificate.create({
      data: {
        ...fields,
        // Noon UTC keeps the chosen day in every European time zone.
        issuedDate: new Date(`${issuedDate}T12:00:00Z`),
        organizationId: issuerId,
        createdById: actor.id,
        recipients: {
          create: recipients.map((recipient) => ({
            ...recipient,
            code: newRecipientCode(),
          })),
        },
      },
      select: certificateSelect,
    });

    logCertificateEvent('created', {
      certificateId: certificate.id,
      organizationId: issuerId,
      userId: actor.id,
      recipients: recipients.length,
    });
    return NextResponse.json(toAdminCertificate(req, certificate), {
      status: 201,
    });
  } catch (error) {
    return serverError('Create certificate', error);
  }
}
