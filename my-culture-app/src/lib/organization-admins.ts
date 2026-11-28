// Assigning an admin to an organisation (at approval, or later by a super
// admin). The admin gets an account limited to that organisation and a
// one-time link to set a password.

import { randomBytes } from 'crypto';
import { prisma } from './prisma';
import { hashPassword } from './auth';
import { sendMail } from './email';
import { setPasswordMail } from './organization-emails';
import { createPasswordToken, setPasswordUrl } from './password-tokens';

/**
 * Why `email` cannot become an admin of `organizationId`, or null if it can.
 * Checked before anything is changed.
 */
export async function adminEmailConflict(
  email: string,
  organizationId: number
): Promise<string | null> {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { role: true, organizationId: true },
  });
  if (!existing) return null;
  if (existing.role === 'SUPER_ADMIN') {
    return 'This email belongs to a super admin';
  }
  if (
    existing.role === 'ADMIN' &&
    existing.organizationId !== null &&
    existing.organizationId !== organizationId
  ) {
    return 'This email is already the admin of another organization';
  }
  return null;
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts.shift() || 'Admin';
  return { firstName, lastName: parts.join(' ') || '-' };
}

export interface AssignedAdmin {
  userId: number;
  email: string;
  /** True when the set-password link was emailed. */
  emailed: boolean;
  /** Only when the email could not be sent, so a super admin can pass it on. */
  setPasswordUrl?: string;
}

/**
 * Make `email` the admin of the organisation, replacing earlier admins of
 * that organisation (they lose dashboard access). Call adminEmailConflict
 * first.
 */
export async function assignOrganizationAdmin(
  req: Request,
  organization: { id: number; name: string },
  admin: { name: string; email: string }
): Promise<AssignedAdmin> {
  const { firstName, lastName } = splitName(admin.name);

  const user = await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({
      where: { email: admin.email },
    });
    const saved = existing
      ? await tx.user.update({
          where: { id: existing.id },
          data: { role: 'ADMIN', organizationId: organization.id },
        })
      : await tx.user.create({
          data: {
            email: admin.email,
            firstName,
            lastName,
            // Unusable until the admin sets a password through the link.
            password: await hashPassword(randomBytes(32).toString('hex')),
            role: 'ADMIN',
            organizationId: organization.id,
          },
        });
    await tx.user.updateMany({
      where: {
        organizationId: organization.id,
        role: 'ADMIN',
        id: { not: saved.id },
      },
      data: { role: 'USER', organizationId: null },
    });
    return saved;
  });

  const token = await createPasswordToken(user.id);
  const link = setPasswordUrl(req, token);
  const emailed = await sendMail(
    setPasswordMail(user.email, organization.name, link)
  );

  return {
    userId: user.id,
    email: user.email,
    emailed,
    ...(emailed ? {} : { setPasswordUrl: link }),
  };
}
