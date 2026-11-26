// POST /api/file/upload - image upload for the dashboard (logos, event
// images, editor images). Multipart field "image". Returns { id, url, name }.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DASHBOARD_ROLES, requireRole } from '@/lib/authz';
import { ImageUploadError, storeImage } from '@/lib/storage';
import { badRequest, serverError } from '@/lib/route-errors';

export async function POST(req: Request) {
  const auth = requireRole(req, DASHBOARD_ROLES);
  if (auth.response) return auth.response;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return badRequest('Expected a multipart form');
  }

  const file = form.get('image');
  if (!(file instanceof File) || file.size === 0) {
    return badRequest('Please select an image to upload');
  }

  try {
    const stored = await storeImage(file, 'images');
    const name = (file.name || stored.fileName).slice(0, 255);
    const image = await prisma.image.create({
      data: {
        url: stored.url,
        fileName: name,
        size: stored.size,
        userId: auth.user.userId,
      },
      select: { id: true, url: true, fileName: true },
    });
    return NextResponse.json(
      { id: image.id, url: image.url, name: image.fileName },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ImageUploadError) return badRequest(error.message);
    return serverError('Image upload', error);
  }
}
