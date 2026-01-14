// API response utilities
// Standardized response formatting for all API routes

import type { ApiResponse, PaginatedResponse } from "./types";

/**
 * Create success response
 */
export function successResponse<T>(
  data: T,
  message = "Success"
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Create error response
 */
export function errorResponse(
  error: string,
  message?: string
): ApiResponse<never> {
  return {
    success: false,
    error,
    message: message || error,
  };
}

/**
 * Create paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get pagination params from query
 */
export function getPaginationParams(
  page?: string | number,
  limit?: string | number
): { page: number; limit: number; skip: number } {
  const pageNum = Math.max(1, parseInt(String(page || 1)));
  const limitNum = Math.max(1, Math.min(100, parseInt(String(limit || 10))));
  const skip = (pageNum - 1) * limitNum;

  return { page: pageNum, limit: limitNum, skip };
}

/**
 * Extract user info from request headers set by middleware
 */
export function extractUserFromHeaders(headers: Headers): {
  userId: number;
  email: string;
  role: string;
} | null {
  const userId = headers.get("x-user-id");
  const email = headers.get("x-user-email");
  const role = headers.get("x-user-role");

  if (!userId || !email || !role) {
    return null;
  }

  return {
    userId: parseInt(userId),
    email,
    role,
  };
}
