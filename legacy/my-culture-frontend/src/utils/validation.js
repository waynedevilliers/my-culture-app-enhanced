import { z } from 'zod';

// User validation schemas
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z.string()
    .min(1, 'Password is required')
});

export const registerSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Organization validation schemas
export const organizationSchema = z.object({
  name: z.string()
    .min(1, 'Organization name is required')
    .max(200, 'Name must be less than 200 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  website: z.string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  contactPerson: z.string()
    .max(100, 'Contact person name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  adminName: z.string()
    .min(1, 'Admin name is required')
    .max(100, 'Admin name must be less than 100 characters'),
  adminEmail: z.string()
    .min(1, 'Admin email is required')
    .email('Invalid admin email address')
});

// Event validation schemas
export const eventSchema = z.object({
  title: z.string()
    .min(1, 'Event title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  startDate: z.string()
    .min(1, 'Start date is required')
    .refine(date => !isNaN(Date.parse(date)), 'Invalid start date'),
  endDate: z.string()
    .optional()
    .refine(date => !date || !isNaN(Date.parse(date)), 'Invalid end date')
    .or(z.literal('')),
  location: z.string()
    .max(255, 'Location must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  maxParticipants: z.string()
    .regex(/^\d*$/, 'Must be a number')
    .transform(val => val === '' ? undefined : parseInt(val))
    .refine(val => val === undefined || val > 0, 'Must be a positive number')
    .optional(),
  price: z.string()
    .regex(/^\d*\.?\d*$/, 'Must be a valid price')
    .transform(val => val === '' ? undefined : parseFloat(val))
    .refine(val => val === undefined || val >= 0, 'Price must be non-negative')
    .optional()
}).refine(data => {
  if (data.endDate && data.startDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

// Blog validation schemas
export const blogSchema = z.object({
  title: z.string()
    .min(1, 'Blog title is required')
    .max(255, 'Title must be less than 255 characters'),
  content: z.string()
    .min(1, 'Blog content is required'),
  excerpt: z.string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  published: z.boolean().default(false)
});

// Newsletter validation schemas
export const newsletterSchema = z.object({
  subject: z.string()
    .min(1, 'Subject is required')
    .max(255, 'Subject must be less than 255 characters'),
  content: z.string()
    .min(1, 'Content is required'),
  scheduledFor: z.string()
    .optional()
    .refine(date => !date || !isNaN(Date.parse(date)), 'Invalid scheduled date')
    .or(z.literal(''))
});

// Certificate validation schemas
export const certificateSchema = z.object({
  title: z.string()
    .min(1, 'Certificate title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  template: z.string()
    .min(1, 'Template is required')
});

// Subscriber validation schema
export const subscriberSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
});

// Search validation schema
export const searchSchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(100, 'Search query must be less than 100 characters'),
  category: z.string().optional(),
  startDate: z.string()
    .optional()
    .refine(date => !date || !isNaN(Date.parse(date)), 'Invalid start date')
    .or(z.literal('')),
  endDate: z.string()
    .optional()
    .refine(date => !date || !isNaN(Date.parse(date)), 'Invalid end date')
    .or(z.literal(''))
}).refine(data => {
  if (data.endDate && data.startDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

// Profile update validation schema
export const profileUpdateSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  currentPassword: z.string()
    .min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .optional()
    .or(z.literal('')),
  confirmNewPassword: z.string()
    .optional()
    .or(z.literal(''))
}).refine(data => {
  if (data.newPassword) {
    return data.newPassword === data.confirmNewPassword;
  }
  return true;
}, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword']
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(file => file.type.startsWith('image/'), 'Only image files are allowed')
});

// Contact form validation
export const contactSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),
  message: z.string()
    .min(1, 'Message is required')
    .max(2000, 'Message must be less than 2000 characters')
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.number()
    .int()
    .positive('Page must be a positive number')
    .default(1),
  limit: z.number()
    .int()
    .positive('Limit must be a positive number')
    .max(100, 'Limit cannot exceed 100')
    .default(10)
});

// Utility function to format Zod errors for display
export const formatZodError = (error) => {
  if (!error?.errors) return {};
  
  return error.errors.reduce((acc, err) => {
    const path = err.path.join('.');
    acc[path] = err.message;
    return acc;
  }, {});
};

// Utility function to validate and format data
export const validateData = (schema, data) => {
  try {
    return {
      success: true,
      data: schema.parse(data),
      errors: {}
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: formatZodError(error)
    };
  }
};

export default {
  loginSchema,
  registerSchema,
  organizationSchema,
  eventSchema,
  blogSchema,
  newsletterSchema,
  certificateSchema,
  subscriberSchema,
  searchSchema,
  profileUpdateSchema,
  fileUploadSchema,
  contactSchema,
  paginationSchema,
  formatZodError,
  validateData
};