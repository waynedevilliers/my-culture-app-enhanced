// Authentication controller: admin login and current-user profile.
// There is no public sign-up; only admins and super admins can log in.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken, comparePassword } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  extractUserFromHeaders,
} from '@/lib/api';
import { LoginSchema } from '@/lib/validation';
import type { Role } from '@/lib/types';

const LOGIN_ROLES: readonly Role[] = ['ADMIN', 'SUPER_ADMIN'];

// Compared against when the email is unknown, so a missing account takes as
// long to reject as a wrong password (no account enumeration by timing).
const DUMMY_PASSWORD_HASH =
  '$2b$10$i5JN.YuP156qFbwKF7w1ye5jCXp9q7KPWny31qaEtQq1Rc/8F3sQi';

const INVALID_CREDENTIALS = () =>
  NextResponse.json(
    errorResponse('Authentication failed', 'Invalid email or password'),
    { status: 401 }
  );

/**
 * POST /api/auth/login
 */
export async function login(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      errorResponse('Validation failed', 'Request body must be JSON'),
      { status: 400 }
    );
  }

  const validation = LoginSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      errorResponse(
        'Validation failed',
        validation.error.issues[0]?.message ?? 'Invalid input'
      ),
      { status: 400 }
    );
  }

  const { email, password } = validation.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    const passwordMatch = await comparePassword(
      password,
      user?.password ?? DUMMY_PASSWORD_HASH
    );

    // Same response for unknown email, wrong password and non-admin
    // accounts, so the endpoint does not reveal which accounts exist.
    if (!user || !passwordMatch || !LOGIN_ROLES.includes(user.role)) {
      return INVALID_CREDENTIALS();
    }

    const token = generateToken(user);
    const { password: _password, ...userWithoutPassword } = user;

    return NextResponse.json(
      successResponse({ token, user: userWithoutPassword }, 'Login successful'),
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Login error:',
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      errorResponse('Login failed', 'An unexpected error occurred'),
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/me (protected by the proxy)
 */
export async function getMe(req: Request) {
  const user = extractUserFromHeaders(req.headers);
  if (!user) {
    return NextResponse.json(
      errorResponse('Unauthorized', 'No valid token provided'),
      { status: 401 }
    );
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        organizationId: true,
        verified: true,
        newsletter: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        errorResponse('User not found', 'User no longer exists'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(dbUser, 'User profile retrieved'),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      'Get user error:',
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      errorResponse('Failed to get user', 'An unexpected error occurred'),
      { status: 500 }
    );
  }
}
