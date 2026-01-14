// Authentication controller
// Handles user registration, login, and token management

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  comparePassword,
  generateToken,
} from "@/lib/auth";
import {
  LoginSchema,
  RegisterSchema,
} from "@/lib/validation";
import {
  successResponse,
  errorResponse,
} from "@/lib/api";
import type { User } from "@/lib/types";

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function registerUser(
  email: string,
  firstName: string,
  lastName: string,
  password: string
) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        status: 400,
        data: errorResponse(
          "User already exists",
          "Email is already registered"
        ),
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: "USER",
      },
    });

    // Generate token
    const token = generateToken(user);

    return {
      status: 201,
      data: successResponse(
        {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          token,
        },
        "User registered successfully"
      ),
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      status: 500,
      data: errorResponse("Registration failed", "Internal server error"),
    };
  }
}

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
export async function loginUser(
  email: string,
  password: string
) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        status: 401,
        data: errorResponse(
          "Invalid credentials",
          "Email or password is incorrect"
        ),
      };
    }

    // Verify password
    const passwordMatch = await comparePassword(
      password,
      user.password
    );

    if (!passwordMatch) {
      return {
        status: 401,
        data: errorResponse(
          "Invalid credentials",
          "Email or password is incorrect"
        ),
      };
    }

    // Generate token
    const token = generateToken(user);

    return {
      status: 200,
      data: successResponse(
        {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          token,
        },
        "Login successful"
      ),
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      status: 500,
      data: errorResponse("Login failed", "Internal server error"),
    };
  }
}

/**
 * GET /api/auth/me
 * Get current user from token
 */
export async function getCurrentUser(userId: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        verified: true,
        newsletter: true,
        createdAt: true,
      },
    });

    if (!user) {
      return {
        status: 404,
        data: errorResponse("User not found"),
      };
    }

    return {
      status: 200,
      data: successResponse(user, "User retrieved successfully"),
    };
  } catch (error) {
    console.error("Get user error:", error);
    return {
      status: 500,
      data: errorResponse("Failed to get user", "Internal server error"),
    };
  }
}
