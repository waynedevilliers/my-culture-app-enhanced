// Proxy (Next.js 16, formerly middleware): request authentication and authorization

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './lib/auth';
import type { Role } from './lib/types';

const ALL_ROLES: Role[] = ['USER', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN'];

// Route prefixes that need a login, and the roles allowed on them.
// The first matching prefix wins, so list more specific prefixes first.
// Routes that mix public and admin access (e.g. /api/organizations) are not
// listed: their handlers check the role with requireRole from lib/authz.ts.
export const PROTECTED_ROUTES: ReadonlyArray<[prefix: string, roles: Role[]]> =
  [
    ['/api/auth/me', ALL_ROLES],
    ['/api/admin', ['ADMIN', 'SUPER_ADMIN']],
    ['/api/moderator', ['MODERATOR', 'ADMIN', 'SUPER_ADMIN']],
    ['/api/user', ALL_ROLES],
    ['/api/users', ALL_ROLES],
    ['/api/file', ['ADMIN', 'SUPER_ADMIN']],
    ['/api/events', ALL_ROLES],
    ['/api/certificates', ALL_ROLES],
  ];

// Headers the proxy sets for route handlers. Clients must never set them.
export const USER_HEADERS = [
  'x-user-id',
  'x-user-email',
  'x-user-role',
] as const;

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function findRequiredRoles(pathname: string): Role[] | undefined {
  return PROTECTED_ROUTES.find(([prefix]) =>
    matchesPrefix(pathname, prefix)
  )?.[1];
}

export function proxy(request: NextRequest) {
  // Drop any user headers sent by the client, on every request, so route
  // handlers can trust them.
  const requestHeaders = new Headers(request.headers);
  for (const header of USER_HEADERS) {
    requestHeaders.delete(header);
  }

  const token = extractTokenFromHeader(request.headers.get('Authorization'));
  const decoded = token ? verifyToken(token) : null;
  const requiredRoles = findRequiredRoles(request.nextUrl.pathname);

  if (requiredRoles) {
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing token' },
        { status: 401 }
      );
    }
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }
    if (!requiredRoles.includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }
  }

  // Pass a verified user to route handlers on the request, not the response.
  // On routes that are not listed above, handlers decide with requireRole.
  if (decoded) {
    requestHeaders.set('x-user-id', String(decoded.userId));
    requestHeaders.set('x-user-email', decoded.email);
    requestHeaders.set('x-user-role', decoded.role);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/api/:path*'],
};
