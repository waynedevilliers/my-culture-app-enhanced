// Authorization for route handlers. The proxy verifies the token and passes
// the user in x-user-* headers; every handler that changes or reveals
// non-public data calls requireRole first.

import { NextResponse } from 'next/server';
import { errorResponse, extractUserFromHeaders } from './api';
import type { Role } from './types';

export const DASHBOARD_ROLES: readonly Role[] = ['ADMIN', 'SUPER_ADMIN'];
export const SUPER_ADMIN_ONLY: readonly Role[] = ['SUPER_ADMIN'];

interface RequestUser {
  userId: number;
  email: string;
  role: Role;
}

type AuthResult =
  | { user: RequestUser; response?: undefined }
  | { user?: undefined; response: NextResponse };

/**
 * Check that the request comes from a logged-in user with one of `roles`.
 * Returns the user, or a 401/403 response to return as is.
 */
export function requireRole(req: Request, roles: readonly Role[]): AuthResult {
  const user = extractUserFromHeaders(req.headers);
  if (!user || Number.isNaN(user.userId)) {
    return {
      response: NextResponse.json(
        errorResponse('Unauthorized', 'Please log in'),
        { status: 401 }
      ),
    };
  }
  if (!roles.includes(user.role as Role)) {
    return {
      response: NextResponse.json(
        errorResponse('Forbidden', 'Insufficient permissions'),
        { status: 403 }
      ),
    };
  }
  return { user: { ...user, role: user.role as Role } };
}
