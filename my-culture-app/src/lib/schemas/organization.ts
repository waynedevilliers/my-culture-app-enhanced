// Zod schemas for organisation routes. Input comes from the Join us form
// (multipart) and from the dashboard (JSON).

import { z } from 'zod';

const trimmed = (max: number) => z.string().trim().max(max);
// Empty form fields arrive as "" (or are missing): treat both as "not given".
const optionalText = (max: number) =>
  trimmed(max)
    .optional()
    .transform((value) => (value ? value : undefined));
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.url({ protocol: /^https?$/ }).optional());
const optionalEmail = z
  .string()
  .trim()
  .max(255)
  .optional()
  .transform((value) => (value ? value.toLowerCase() : undefined))
  .pipe(z.email().optional());

export const ApplicationSchema = z.object({
  organizationName: trimmed(200).min(2, 'Organisation name is required'),
  organizationType: trimmed(50).min(1, 'Organisation type is required'),
  description: trimmed(5000).min(10, 'Please describe your organisation'),
  location: trimmed(200).min(2, 'Location is required'),
  adminName: trimmed(200).min(2, 'Name is required'),
  adminEmail: z
    .string()
    .trim()
    .max(255)
    .toLowerCase()
    .pipe(z.email('Please enter a valid email address')),
  contactPerson: optionalText(200),
  email: optionalEmail,
  phone: optionalText(50),
  website: optionalUrl,
  establishedYear: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(
      z
        .number()
        .int()
        .min(1800)
        .max(new Date().getFullYear(), 'Year cannot be in the future')
        .optional()
    ),
  memberCount: optionalText(50),
  programs: optionalText(5000),
  goals: optionalText(5000),
  additionalInfo: optionalText(5000),
});

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value ? value : null));

/** Dashboard: create or edit an organisation. */
export const OrganizationSchema = z.object({
  name: trimmed(200).min(2, 'Name is required'),
  description: nullableText(5000),
  website: z
    .string()
    .trim()
    .max(500)
    .nullish()
    .transform((value) => (value ? value : null))
    .pipe(z.url({ protocol: /^https?$/ }).nullable()),
  phone: nullableText(50),
  email: z
    .string()
    .trim()
    .max(255)
    .nullish()
    .transform((value) => (value ? value.toLowerCase() : null))
    .pipe(z.email().nullable()),
  imageId: z
    .string()
    .trim()
    .max(50)
    .nullish()
    .transform((value) => (value ? value : null)),
  published: z.boolean().optional(),
});

/** Dashboard: partial update (the list toggles `published` alone). */
export const OrganizationUpdateSchema = OrganizationSchema.partial();

export const RejectSchema = z.object({
  rejectionNotes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export const IdSchema = z.coerce.number().int().positive();
