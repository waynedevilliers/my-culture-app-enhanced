// User response shape for the dashboard and profile. Never includes the
// password hash. Roles use the UI names.

import type { Prisma } from '@prisma/client';
import { toUiRole } from './roles';
import type { Role } from './types';

export const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

type SelectedUser = Prisma.UserGetPayload<{ select: typeof userSelect }>;

export function toUiUser(user: SelectedUser) {
  const { phone, role, ...rest } = user;
  return { ...rest, phoneNumber: phone, role: toUiRole(role as Role) };
}
