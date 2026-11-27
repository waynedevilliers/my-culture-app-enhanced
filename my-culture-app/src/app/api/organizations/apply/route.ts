// POST /api/organizations/apply - public "Join us" application (multipart).
// Creates a pending, unpublished organisation; a super admin approves or
// rejects it in Dashboard > Applications.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApplicationSchema } from '@/lib/schemas/organization';
import { ImageUploadError, storeImage } from '@/lib/storage';
import {
  badRequest,
  conflict,
  isPrismaError,
  serverError,
  validationError,
} from '@/lib/route-errors';

const TEXT_FIELDS = [
  'organizationName',
  'organizationType',
  'description',
  'location',
  'adminName',
  'adminEmail',
  'contactPerson',
  'email',
  'phone',
  'website',
  'establishedYear',
  'memberCount',
  'programs',
  'goals',
  'additionalInfo',
] as const;

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return badRequest('Expected a multipart form');
  }

  const fields: Record<string, string> = {};
  for (const name of TEXT_FIELDS) {
    const value = form.get(name);
    if (typeof value === 'string') fields[name] = value;
  }

  const parsed = ApplicationSchema.safeParse(fields);
  if (!parsed.success) return validationError(parsed.error);
  const input = parsed.data;

  const logo = form.get('logo');

  try {
    let logoId: string | undefined;
    if (logo instanceof File && logo.size > 0) {
      const stored = await storeImage(logo, 'organizations');
      const image = await prisma.image.create({
        data: { url: stored.url, fileName: stored.fileName, size: stored.size },
        select: { id: true },
      });
      logoId = image.id;
    }

    const organization = await prisma.organization.create({
      data: {
        name: input.organizationName,
        description: input.description,
        email: input.email,
        phone: input.phone,
        website: input.website,
        contactPerson: input.contactPerson,
        adminName: input.adminName,
        adminEmail: input.adminEmail,
        applicationDetails: {
          organizationType: input.organizationType,
          location: input.location,
          establishedYear: input.establishedYear ?? null,
          memberCount: input.memberCount ?? null,
          programs: input.programs ?? null,
          goals: input.goals ?? null,
          additionalInfo: input.additionalInfo ?? null,
        },
        approvalStatus: 'pending',
        published: false,
        logoId,
      },
      select: { id: true, name: true },
    });

    return NextResponse.json(
      {
        message:
          'Application submitted successfully. We will review it and get back to you.',
        organization,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ImageUploadError) return badRequest(error.message);
    if (isPrismaError(error, 'P2002')) {
      return conflict('An organization with this email already exists');
    }
    return serverError('Organization application', error);
  }
}
