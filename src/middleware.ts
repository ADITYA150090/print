import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // --- Skip middleware for static files and API routes ---
  if (
    path.startsWith("/_next/") ||  // Next.js assets
    path.startsWith("/favicon.ico") ||
    path.startsWith("/public/") ||
    path.startsWith("/api/")       // <-- Exclude API routes
  ) {
    return;
  }

  // --- Define public paths ---
  const publicPaths = ["/login", "/register"];

  // Get token from cookies
  const token = req.cookies.get("token")?.value || "";

  // Redirect logged-in users away from public pages
  if (publicPaths.includes(path) && token) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // --- Protect private paths ---
  const protectedPaths = [
    "/",        // Home page
    "/admin",   // Admin
    "/rmo",     // RMO
  ];

  // Dynamic protected routes (e.g., /rmo/anything or /officer/anything)
  const isDynamicProtected = path.startsWith("/rmo") || /^\/[^/]+/.test(path);

  if (!publicPaths.includes(path) && !token && (protectedPaths.includes(path) || isDynamicProtected)) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
}

// --- Apply middleware only to relevant paths ---
export const config = {
  matcher: [
    "/",               // Home
    "/admin",          // Admin
    "/rmo/:path*",     // RMO and all subpaths
    "/:officer/:path*",// Dynamic officer routes
    "/login",
    "/register",
  ],
};
