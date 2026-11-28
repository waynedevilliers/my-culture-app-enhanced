// One-time "set your password" links. The random token is only ever in the
// link; the database stores its SHA-256 hash, so a database leak does not
// reveal working links.

import { createHash, randomBytes } from 'crypto';
import { prisma } from './prisma';

export const PASSWORD_TOKEN_HOURS = 48;

export const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

/** Create a new token for the user; earlier unused tokens stop working. */
export async function createPasswordToken(userId: number): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  await prisma.passwordToken.deleteMany({ where: { userId, usedAt: null } });
  await prisma.passwordToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + PASSWORD_TOKEN_HOURS * 60 * 60 * 1000),
    },
  });
  return token;
}

/** Base URL for links in emails: APP_URL, else the request's own origin. */
function appUrl(req: Request): string {
  return (process.env.APP_URL || new URL(req.url).origin).replace(/\/+$/, '');
}

export const setPasswordUrl = (req: Request, token: string) =>
  `${appUrl(req)}/set-password?token=${encodeURIComponent(token)}`;
