// POST /api/auth/set-password - set a password with a one-time link token.
// Public: the token itself is the proof. Expired or used tokens are refused
// with the same answer, so the endpoint does not reveal which tokens exist.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { hashToken } from '@/lib/password-tokens';
import {
  badRequest,
  readJson,
  serverError,
  validationError,
} from '@/lib/route-errors';

const SetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  password: z
    .string()
    .min(10, 'The password must have at least 10 characters')
    .max(200),
});

const INVALID_LINK = () =>
  badRequest('This link is invalid or has expired. Please ask for a new one.');

export async function POST(req: Request) {
  const parsed = SetPasswordSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    const tokenIssue = parsed.error.issues.some((i) => i.path[0] === 'token');
    return tokenIssue ? INVALID_LINK() : validationError(parsed.error);
  }

  try {
    const record = await prisma.passwordToken.findUnique({
      where: { tokenHash: hashToken(parsed.data.token) },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return INVALID_LINK();
    }

    const password = await hashPassword(parsed.data.password);
    // Mark used and set the password together; the usedAt condition makes a
    // second, parallel use of the same link fail.
    const used = await prisma.$transaction(async (tx) => {
      const { count } = await tx.passwordToken.updateMany({
        where: { id: record.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (count === 0) return false;
      await tx.user.update({
        where: { id: record.userId },
        data: { password, verified: true },
      });
      return true;
    });
    if (!used) return INVALID_LINK();

    return NextResponse.json({ message: 'Password set. You can now log in.' });
  } catch (error) {
    return serverError('Set password', error);
  }
}
