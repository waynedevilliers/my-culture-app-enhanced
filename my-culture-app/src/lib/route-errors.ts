// Consistent error responses for route handlers. Internal details are logged,
// never returned.

import { NextResponse } from 'next/server';
import type { z } from 'zod';
import { errorResponse } from './api';

export function validationError(error: z.ZodError) {
  const issue = error.issues[0];
  return NextResponse.json(
    errorResponse('Validation failed', issue?.message ?? 'Invalid input'),
    { status: 400 }
  );
}

export function badRequest(message: string) {
  return NextResponse.json(errorResponse('Bad request', message), {
    status: 400,
  });
}

export function notFound(message = 'Not found') {
  return NextResponse.json(errorResponse('Not found', message), {
    status: 404,
  });
}

export function conflict(message: string) {
  return NextResponse.json(errorResponse('Conflict', message), {
    status: 409,
  });
}

export function serverError(context: string, error: unknown) {
  console.error(
    `${context}:`,
    error instanceof Error ? error.message : String(error)
  );
  return NextResponse.json(
    errorResponse('Server error', 'An unexpected error occurred'),
    { status: 500 }
  );
}

/**
 * Prisma error codes: P2002 unique constraint, P2025 record not found.
 * Checked by name and code rather than instanceof, so it does not depend on
 * the generated client being loaded.
 */
export function isPrismaError(error: unknown, code: 'P2002' | 'P2025') {
  return (
    error instanceof Error &&
    error.name === 'PrismaClientKnownRequestError' &&
    (error as Error & { code?: unknown }).code === code
  );
}

/** Read a JSON body; null when it is missing or not JSON. */
export async function readJson(req: Request): Promise<unknown | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
