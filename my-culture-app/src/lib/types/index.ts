// Type definitions for myCultureApp - derived from Prisma schema
// This file provides TypeScript types for all database entities

export type Role = "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "USER";
export type CertificateStatus = "DRAFT" | "GENERATED" | "SENT" | "DOWNLOADED";
export type EventStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "CANCELLED";

// User type
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: Role;
  newsletter: boolean;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: Role;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  newsletter?: boolean;
  verified?: boolean;
  role?: Role;
}

// Organization type
export interface Organization {
  id: number;
  name: string;
  email: string;
  description?: string;
  website?: string;
  verified: boolean;
  approvalStatus: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationInput {
  name: string;
  email: string;
  description?: string;
  website?: string;
  userId: number;
}

export interface UpdateOrganizationInput {
  name?: string;
  email?: string;
  description?: string;
  website?: string;
  verified?: boolean;
  approvalStatus?: string;
}

// Event type
export interface Event {
  id: number;
  title: string;
  description?: string;
  content?: string;
  date: Date;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  capacity?: number;
  status: EventStatus;
  published: boolean;
  price?: number;
  discountedPrice?: number;
  abendkassePrice?: number;
  userId: number;
  organizationId?: number;
  locationId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  content?: string;
  date: Date;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  capacity?: number;
  userId: number;
  organizationId?: number;
  locationId?: number;
  price?: number;
  discountedPrice?: number;
  abendkassePrice?: number;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  content?: string;
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  capacity?: number;
  status?: EventStatus;
  published?: boolean;
  price?: number;
  discountedPrice?: number;
  abendkassePrice?: number;
  organizationId?: number;
  locationId?: number;
}

// Category type
export interface Category {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
}

// Location type
export interface Location {
  id: number;
  name: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  organizationId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLocationInput {
  name: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  organizationId?: number;
}

// Certificate type
export interface Certificate {
  id: string;
  title: string;
  template?: string;
  recipientName?: string;
  recipientEmail?: string;
  pdfUrl?: string;
  status: CertificateStatus;
  issued: boolean;
  userId: number;
  organizationId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCertificateInput {
  title: string;
  template?: string;
  recipientName?: string;
  recipientEmail?: string;
  userId: number;
  organizationId: number;
}

// CertificateRecipient type
export interface CertificateRecipient {
  id: number;
  name: string;
  email: string;
  recipientCode: string;
  pdfUrl?: string;
  downloaded: boolean;
  downloadedAt?: Date;
  certificateId: string;
  userId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCertificateRecipientInput {
  name: string;
  email: string;
  certificateId: string;
  userId?: number;
}

// Blog type
export interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  published: boolean;
  userId: number;
  categoryId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBlogInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  userId: number;
  categoryId?: number;
}

export interface UpdateBlogInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  published?: boolean;
  categoryId?: number;
}

// Gallery type
export interface Gallery {
  id: number;
  name: string;
  description?: string;
  published: boolean;
  userId: number;
  organizationId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGalleryInput {
  name: string;
  description?: string;
  userId: number;
  organizationId?: number;
}

export interface UpdateGalleryInput {
  name?: string;
  description?: string;
  published?: boolean;
}

// Image type
export interface Image {
  id: string;
  publicId?: string;
  url: string;
  secureUrl?: string;
  fileName?: string;
  size?: number;
  width?: number;
  height?: number;
  userId?: number;
  organizationId?: number;
  eventId?: number;
  blogId?: number;
  galleryId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateImageInput {
  url: string;
  publicId?: string;
  secureUrl?: string;
  fileName?: string;
  size?: number;
  width?: number;
  height?: number;
  userId?: number;
  organizationId?: number;
  eventId?: number;
  blogId?: number;
  galleryId?: number;
}

// Subscriber type
export interface Subscriber {
  id: number;
  email: string;
  name?: string;
  subscribed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriberInput {
  email: string;
  name?: string;
}

// Testimonial type
export interface Testimonial {
  id: number;
  name: string;
  email?: string;
  message: string;
  rating?: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTestimonialInput {
  name: string;
  email?: string;
  message: string;
  rating?: number;
}

// Authentication types
export interface JwtPayload {
  userId: number;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
