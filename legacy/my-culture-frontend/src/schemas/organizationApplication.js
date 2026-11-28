import { z } from 'zod';

export const organizationApplicationSchema = z.object({
  name: z
    .string()
    .min(3, 'Organization name must be at least 3 characters')
    .max(255, 'Organization name must be less than 255 characters'),
  
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  
  contactPerson: z
    .string()
    .min(2, 'Contact person name must be at least 2 characters')
    .max(255, 'Contact person name must be less than 255 characters')
    .optional(),
  
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional(),
  
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+(?:[0-9] ?){6,14}[0-9]$/.test(val), {
      message: 'Please enter a valid phone number (e.g., +49 123 456789)'
    }),
  
  website: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: 'Please enter a valid website URL (including http:// or https://)'
    }),
});

// For admin user information that will be collected
export const adminUserSchema = z.object({
  adminName: z
    .string()
    .min(2, 'Admin name must be at least 2 characters')
    .max(255, 'Admin name must be less than 255 characters'),
  
  adminEmail: z
    .string()
    .email('Please enter a valid admin email address'),
});

export const completeApplicationSchema = organizationApplicationSchema.merge(adminUserSchema);