// Zod schemas for certificate routes. All texts are plain text; the design
// renders them as text, never as HTML.

import { z } from 'zod';

const text = (max: number) => z.string().trim().max(max);

const CERTIFICATE_LANGUAGES = ['de', 'en'] as const;
const CERTIFICATE_COLOR_NAMES = ['green', 'blue', 'burgundy', 'grey'] as const;
const MAX_SIGNATURES = 3;
const MAX_RECIPIENTS = 200;

const SignatureSchema = z.object({
  name: text(100),
  role: text(100),
});

const RecipientSchema = z.object({
  name: text(150).min(1, 'Every recipient needs a name'),
  email: z
    .string()
    .trim()
    .max(255)
    .toLowerCase()
    .pipe(z.email('Every recipient needs a valid email address')),
});

export const CertificateSchema = z.object({
  // Super admins choose the organisation; organisation admins always issue
  // for their own, so the field is ignored for them.
  organizationId: z.coerce.number().int().positive().optional(),
  language: z.enum(CERTIFICATE_LANGUAGES).default('de'),
  color: z.enum(CERTIFICATE_COLOR_NAMES).default('green'),
  introText: text(400).min(1, 'Intro text is required'),
  achievement: text(80).min(1, 'Achievement is required'),
  addition: text(150)
    .optional()
    .transform((value) => (value ? value : null)),
  signatures: z
    .array(SignatureSchema)
    .max(MAX_SIGNATURES, `At most ${MAX_SIGNATURES} signatures`)
    // Empty rows from the form are dropped.
    .transform((rows) => rows.filter((row) => row.name))
    .pipe(
      z.array(SignatureSchema).min(1, 'At least one signature is required')
    ),
  issuedDate: z.iso.date('Please enter a valid issue date'),
  recipients: z
    .array(RecipientSchema)
    .min(1, 'At least one recipient is required')
    .max(MAX_RECIPIENTS, `At most ${MAX_RECIPIENTS} recipients`),
});

export const RecipientUpdateSchema = z.object({
  revoked: z.boolean(),
});

export const SendSchema = z
  .object({
    // Only these recipients; default: all not yet sent.
    recipientIds: z.array(z.string().min(1).max(40)).max(MAX_RECIPIENTS),
  })
  .partial()
  .default({});

export const CertificateIdSchema = z.string().min(1).max(40);
