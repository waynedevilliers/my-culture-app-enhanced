// /api/users/:id - super admin edits (name, email, role) or deletes a user.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, SUPER_ADMIN_ONLY } from '@/lib/authz';
import { fromUiRole } from '@/lib/roles';
import { IdSchema } from '@/lib/schemas/organization';
import { UserUpdateSchema } from '@/lib/schemas/user';
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

type Context = { params: Promise<{ id: string }> };

export async function PUT(req: Request, context: Context) {
  const auth = requireRole(req, SUPER_ADMIN_ONLY);
  if (auth.response) return auth.response;

  const id = IdSchema.safeParse((await context.params).id);
  if (!id.success) return notFound('User not found');

  const parsed = UserUpdateSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  const { role, ...fields } = parsed.data;
  const newRole = fromUiRole(role);
  if (!newRole) return badRequest('Unknown role');

  // A super admin cannot take away their own super admin role, so there is
  // always someone left who can manage the site.
  if (id.data === auth.user.userId && newRole !== 'SUPER_ADMIN') {
    return badRequest('You cannot change your own role');
  }

  try {
    const user = await prisma.user.update({
      where: { id: id.data },
      data: {
        ...fields,
        role: newRole,
        // Only organisation admins belong to an organisation.
        ...(newRole === 'ADMIN' ? {} : { organizationId: null }),
      },
      select: userSelect,
    });
    return NextResponse.json(toUiUser(user), { status: 202 });
  } catch (error) {
    if (isPrismaError(error, 'P2025')) return notFound('User not found');
    if (isPrismaError(error, 'P2002')) {
      return conflict('A user with this email already exists');
    }
    return serverError('Update user', error);
  }
}

// DELETE /api/users/:id - super admin deletes a user (not themselves).
export async function DELETE(req: Request, context: Context) {
  const auth = requireRole(req, SUPER_ADMIN_ONLY);
  if (auth.response) return auth.response;

  const id = IdSchema.safeParse((await context.params).id);
  if (!id.success) return notFound('User not found');
  if (id.data === auth.user.userId) {
    return badRequest('You cannot delete your own account');
  }

  try {
    await prisma.user.delete({ where: { id: id.data } });
    return NextResponse.json({
      message: `User with id ${id.data} was deleted successfully`,
    });
  } catch (error) {
    if (isPrismaError(error, 'P2025')) return notFound('User not found');
    return serverError('Delete user', error);
  }
}
