// Zod schema validation for myCultureApp
// Used for input validation and type safety

import { z } from "zod";

// Auth schemas
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// User schemas
export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MODERATOR", "USER"]).default("USER"),
});

export const UpdateUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  newsletter: z.boolean().optional(),
  verified: z.boolean().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MODERATOR", "USER"]).optional(),
});

// Organization schemas
export const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  email: z.string().email("Invalid email address"),
  description: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  userId: z.number().int().positive(),
});

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email("Invalid email address").optional(),
  description: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  verified: z.boolean().optional(),
  approvalStatus: z.string().optional(),
});

// Event schemas
export const CreateEventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  description: z.string().optional(),
  content: z.string().optional(),
  date: z.coerce.date(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  location: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  userId: z.number().int().positive(),
  organizationId: z.number().int().positive().optional(),
  locationId: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
  discountedPrice: z.number().positive().optional(),
  abendkassePrice: z.number().positive().optional(),
});

export const UpdateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  date: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  location: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "CANCELLED"]).optional(),
  published: z.boolean().optional(),
  price: z.number().positive().optional(),
  discountedPrice: z.number().positive().optional(),
  abendkassePrice: z.number().positive().optional(),
  organizationId: z.number().int().positive().optional(),
  locationId: z.number().int().positive().optional(),
});

// Category schemas
export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
});

// Location schemas
export const CreateLocationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  organizationId: z.number().int().positive().optional(),
});

// Certificate schemas
export const CreateCertificateSchema = z.object({
  title: z.string().min(1, "Certificate title is required"),
  template: z.string().optional(),
  recipientName: z.string().optional(),
  recipientEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  userId: z.number().int().positive(),
  organizationId: z.number().int().positive(),
});

// Blog schemas
export const CreateBlogSchema = z.object({
  title: z.string().min(1, "Blog title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  userId: z.number().int().positive(),
  categoryId: z.number().int().positive().optional(),
});

export const UpdateBlogSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
    .optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  published: z.boolean().optional(),
  categoryId: z.number().int().positive().optional(),
});

// Gallery schemas
export const CreateGallerySchema = z.object({
  name: z.string().min(1, "Gallery name is required"),
  description: z.string().optional(),
  userId: z.number().int().positive(),
  organizationId: z.number().int().positive().optional(),
});

export const UpdateGallerySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  published: z.boolean().optional(),
});

// Subscriber schemas
export const CreateSubscriberSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
});

// Testimonial schemas
export const CreateTestimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters"),
  rating: z.number().int().min(1).max(5).optional(),
});

// Query parameter schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  skip: z.coerce.number().optional(),
});

export const SearchSchema = z.object({
  q: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Export types from schemas
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type CreateLocationInput = z.infer<typeof CreateLocationSchema>;
export type CreateCertificateInput = z.infer<typeof CreateCertificateSchema>;
export type CreateBlogInput = z.infer<typeof CreateBlogSchema>;
export type UpdateBlogInput = z.infer<typeof UpdateBlogSchema>;
export type CreateGalleryInput = z.infer<typeof CreateGallerySchema>;
export type UpdateGalleryInput = z.infer<typeof UpdateGallerySchema>;
export type CreateSubscriberInput = z.infer<typeof CreateSubscriberSchema>;
export type CreateTestimonialInput = z.infer<typeof CreateTestimonialSchema>;
export type PaginationParams = z.infer<typeof PaginationSchema>;
export type SearchParams = z.infer<typeof SearchSchema>;
