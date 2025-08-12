import { z } from 'zod';

// User validation schemas
export const createUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  role: z.enum(['user', 'admin', 'super_admin']).optional().default('user'),
  organizationId: z.number().int().positive().optional()
});

export const updateUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .optional(),
  role: z.enum(['user', 'admin', 'super_admin']).optional(),
  organizationId: z.number().int().positive().optional()
});

// Organization validation schemas
export const createOrganizationSchema = z.object({
  name: z.string()
    .min(1, 'Organization name is required')
    .max(200, 'Name must be less than 200 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  website: z.string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
});

// Event validation schemas
export const createEventSchema = z.object({
  title: z.string()
    .min(1, 'Event title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  startDate: z.string()
    .datetime('Invalid start date format'),
  endDate: z.string()
    .datetime('Invalid end date format')
    .optional(),
  location: z.string()
    .max(255, 'Location must be less than 255 characters')
    .optional(),
  maxParticipants: z.number()
    .int()
    .positive('Max participants must be a positive number')
    .optional(),
  price: z.number()
    .nonnegative('Price must be non-negative')
    .optional(),
  organizationId: z.number().int().positive('Organization ID is required')
}).refine(data => {
  if (data.endDate && data.startDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

// Certificate validation schemas
export const createCertificateSchema = z.object({
  title: z.string()
    .min(1, 'Certificate title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  template: z.string()
    .min(1, 'Template is required'),
  organizationId: z.number().int().positive('Organization ID is required'),
  eventId: z.number().int().positive().optional()
});

// Blog validation schemas
export const createBlogSchema = z.object({
  title: z.string()
    .min(1, 'Blog title is required')
    .max(255, 'Title must be less than 255 characters'),
  content: z.string()
    .min(1, 'Blog content is required'),
  excerpt: z.string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional(),
  published: z.boolean().default(false),
  organizationId: z.number().int().positive('Organization ID is required')
});

// Newsletter validation schemas
export const createNewsletterSchema = z.object({
  subject: z.string()
    .min(1, 'Subject is required')
    .max(255, 'Subject must be less than 255 characters'),
  content: z.string()
    .min(1, 'Content is required'),
  organizationId: z.number().int().positive('Organization ID is required'),
  scheduledFor: z.string()
    .datetime('Invalid scheduled date format')
    .optional()
});

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address'),
  password: z.string()
    .min(1, 'Password is required')
});

export const registerSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(val => parseInt(val))
    .refine(val => val > 0, 'Page must be greater than 0')
    .optional()
    .default('1'),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(val => parseInt(val))
    .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .optional()
    .default('10')
});

// File upload validation
export const fileUploadSchema = z.object({
  mimetype: z.string()
    .refine(val => val.startsWith('image/'), 'Only image files are allowed'),
  size: z.number()
    .max(10 * 1024 * 1024, 'File size must be less than 10MB')
});

// Email validation for subscribers
export const subscriberSchema = z.object({
  email: z.string()
    .email('Invalid email address'),
  organizationId: z.number().int().positive('Organization ID is required').optional()
});

// Query parameter validation
export const searchQuerySchema = z.object({
  q: z.string()
    .min(1, 'Search query is required')
    .max(100, 'Search query must be less than 100 characters'),
  category: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});