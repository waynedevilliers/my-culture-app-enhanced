// The moved UI uses the old role names (user, admin, superAdmin); the
// database uses the Role enum. Translate only at the API boundary.

import type { Role } from './types';

const TO_UI: Record<Role, string> = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superAdmin',
};

const FROM_UI: Record<string, Role> = {
  user: 'USER',
  moderator: 'MODERATOR',
  admin: 'ADMIN',
  superAdmin: 'SUPER_ADMIN',
};

export function toUiRole(role: Role): string {
  return TO_UI[role];
}

/** UI or enum name -> Role; null for anything else. */
export function fromUiRole(value: string): Role | null {
  if (value in FROM_UI) return FROM_UI[value];
  if (value in TO_UI) return value as Role;
  return null;
}
