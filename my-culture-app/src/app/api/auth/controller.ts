// Authentication controller
// Handles user registration, login, and profile retrieval

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateToken,
  hashPassword,
  comparePassword,
  extractTokenFromHeader,
  verifyToken,
} from "@/lib/auth";
import { successResponse, errorResponse, extractUserFromHeaders } from "@/lib/api";
import {
  RegisterSchema,
  LoginSchema,
  type RegisterInput,
  type LoginInput,
} from "@/lib/validation";

/**
 * Register a new user
 */
export async function register(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(
          "Validation failed",
          validation.error.errors[0].message
        ),
        { status: 400 }
      );
    }

    const { email, firstName, lastName, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        errorResponse("User already exists", "This email is already registered"),
        { status: 409 }
      );
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
        verified: false,
        newsletter: false,
      },
    });

    // Generate token
    const token = generateToken(user);

    // Return response (don't send password back)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      successResponse(
        {
          token,
          user: userWithoutPassword,
        },
        "User registered successfully"
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      errorResponse(
        "Registration failed",
        "An unexpected error occurred"
      ),
      { status: 500 }
    );
  }
}

/**
 * Login user
 */
export async function login(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(
          "Validation failed",
          validation.error.errors[0].message
        ),
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        errorResponse(
          "Authentication failed",
          "Invalid email or password"
        ),
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        errorResponse(
          "Authentication failed",
          "Invalid email or password"
        ),
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user);

    // Return response (don't send password back)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      successResponse(
        {
          token,
          user: userWithoutPassword,
        },
        "Login successful"
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      errorResponse(
        "Login failed",
        "An unexpected error occurred"
      ),
      { status: 500 }
    );
  }
}

/**
 * Get current user profile
 */
export async function getMe(req: NextRequest) {
  try {
    // Extract user from middleware headers
    const user = extractUserFromHeaders(req.headers);

    if (!user) {
      return NextResponse.json(
        errorResponse("Unauthorized", "No valid token provided"),
        { status: 401 }
      );
    }

    // Fetch user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        verified: true,
        newsletter: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        errorResponse("User not found", "User no longer exists"),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(dbUser, "User profile retrieved"),
      { status: 200 }
    );
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      errorResponse(
        "Failed to get user",
        "An unexpected error occurred"
      ),
      { status: 500 }
    );
  }
}
