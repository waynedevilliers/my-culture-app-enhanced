// Middleware for request authentication and authorization
// Place this file in the src/ directory as middleware.ts for Next.js App Router

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "./lib/auth";

// Define protected routes and their required roles
const PROTECTED_ROUTES = {
  "/api/user": ["USER", "ADMIN", "MODERATOR", "SUPER_ADMIN"],
  "/api/organizations": ["USER", "ADMIN", "MODERATOR", "SUPER_ADMIN"],
  "/api/events": ["USER", "ADMIN", "MODERATOR", "SUPER_ADMIN"],
  "/api/certificates": ["USER", "ADMIN", "MODERATOR", "SUPER_ADMIN"],
  "/api/admin": ["ADMIN", "SUPER_ADMIN"],
  "/api/moderator": ["MODERATOR", "ADMIN", "SUPER_ADMIN"],
};

const PUBLIC_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/health",
  "/api/public",
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for protected routes
  const isProtected = Object.keys(PROTECTED_ROUTES).some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Extract and verify token
  const authHeader = request.headers.get("Authorization");
  const token = extractTokenFromHeader(authHeader ?? undefined);

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized - Missing token" },
      { status: 401 }
    );
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid token" },
      { status: 401 }
    );
  }

  // Check role-based access
  const matchedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
    pathname.startsWith(route)
  ) as keyof typeof PROTECTED_ROUTES | undefined;

  const requiredRoles = matchedRoute
    ? PROTECTED_ROUTES[matchedRoute]
    : undefined;

  if (requiredRoles && !requiredRoles.includes(decoded.role)) {
    return NextResponse.json(
      { error: "Forbidden - Insufficient permissions" },
      { status: 403 }
    );
  }

  // Add user info to request headers for use in API routes
  const response = NextResponse.next();
  response.headers.set("x-user-id", decoded.userId.toString());
  response.headers.set("x-user-email", decoded.email);
  response.headers.set("x-user-role", decoded.role);

  return response;
}

export const config = {
  matcher: [
    // Match all API routes
    "/api/:path*",
    // Exclude public folders
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
