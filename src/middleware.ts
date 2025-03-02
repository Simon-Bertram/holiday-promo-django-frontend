import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/profile"];
const authRoutes = ["/auth/login", "/auth/register", "/auth/magic-code"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  // Check if user is trying to access a protected route without being authenticated
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Note: Role-based access is now handled at the component level for /dashboard
  // We'll keep the middleware focused on authentication checks

  // Redirect authenticated users away from auth pages
  if (authRoutes.some((route) => pathname === route) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/profile"],
};
