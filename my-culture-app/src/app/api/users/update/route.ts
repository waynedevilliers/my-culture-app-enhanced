// PUT /api/users/update - the logged-in user updates their own profile
// (name, email, phone) or changes their password. Role and organisation
// cannot be changed here.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, hashPassword } from '@/lib/auth';
import { DASHBOARD_ROLES, requireRole } from '@/lib/authz';
import { PasswordChangeSchema, ProfileUpdateSchema } from '@/lib/schemas/user';
import { toUiUser, userSelect } from '@/lib/users';
import {
  badRequest,
  conflict,
  isPrismaError,
  notFound,
  readJson,
  serverError,
  validationError,
} from '@/lib/route-errors';

export async function PUT(req: Request) {
  const auth = requireRole(req, DASHBOARD_ROLES);
  if (auth.response) return auth.response;
  const userId = auth.user.userId;

  const body = await readJson(req);
  if (!body || typeof body !== 'object') return badRequest('Expected JSON');

  try {
    if ('newPassword' in body) {
      const parsed = PasswordChangeSchema.safeParse(body);
      if (!parsed.success) return validationError(parsed.error);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });
      if (!user) return notFound('User not found');
      if (!(await comparePassword(parsed.data.password, user.password))) {
        return badRequest('The current password is not correct');
      }

      await prisma.user.update({
        where: { id: userId },
        data: { password: await hashPassword(parsed.data.newPassword) },
      });
      return NextResponse.json({ message: 'Password changed' });
    }

    const parsed = ProfileUpdateSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);
    const { phoneNumber, ...fields } = parsed.data;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { ...fields, phone: phoneNumber },
      select: userSelect,
    });
    return NextResponse.json(toUiUser(user));
  } catch (error) {
    if (isPrismaError(error, 'P2025')) return notFound('User not found');
    if (isPrismaError(error, 'P2002')) {
      return conflict('A user with this email already exists');
    }
    return serverError('Update profile', error);
  }
}
