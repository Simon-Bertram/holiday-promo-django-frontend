import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard"];
const adminRoutes = ["/dashboard/admin"];
const authRoutes = ["/auth/login", "/auth/register", "/auth/magic-code"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  // Check if user is trying to access a protected route without being authenticated
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Check if user is trying to access an admin route
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    // We need to verify if the user is an admin
    // This would typically be done by decoding the JWT token
    // For simplicity, we'll redirect to a "not authorized" page if needed
    // In a real app, you would decode the JWT and check the role
  }

  // Redirect authenticated users away from auth pages
  if (authRoutes.some((route) => pathname === route) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
