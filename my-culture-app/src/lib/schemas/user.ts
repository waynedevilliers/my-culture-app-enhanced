// Zod schemas for user routes.

import { z } from 'zod';

const name = z.string().trim().min(1, 'Name is required').max(100);
const email = z
  .string()
  .trim()
  .max(255)
  .toLowerCase()
  .pipe(z.email('Please enter a valid email address'));

/** Super admin edits a user in the dashboard. Role uses the UI names. */
export const UserUpdateSchema = z.object({
  firstName: name,
  lastName: name,
  email,
  role: z.enum(['user', 'admin', 'superAdmin']),
});

/** Profile: own name, email and phone. */
export const ProfileUpdateSchema = z.object({
  firstName: name,
  lastName: name,
  email,
  phoneNumber: z
    .string()
    .trim()
    .max(50)
    .optional()
    .transform((value) => (value ? value : null)),
});

/** Profile: change own password (current password required). */
export const PasswordChangeSchema = z.object({
  password: z.string().min(1, 'Current password is required').max(200),
  newPassword: z
    .string()
    .min(10, 'The new password must have at least 10 characters')
    .max(200),
});
