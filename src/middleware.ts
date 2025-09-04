import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // --- Skip static files and API routes ---
  if (
    path.startsWith("/_next/") ||
    path.startsWith("/favicon.ico") ||
    path.startsWith("/public/") ||
    path.startsWith("/api/")
  ) {
    return;
  }

  // Get token from cookies
  const token = req.cookies.get("token")?.value || "";

  // Public paths
  const publicPaths = ["/login", "/register"];

  // --- Logic for non-logged-in users ---
  if (!token) {
    // Guests can access /, /login, /register
    if (path === "/" || publicPaths.includes(path)) {
      return;
    }
    // All other paths require login
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // --- Logic for logged-in users ---
  if (token) {
    // Redirect logged-in users away from /, /login, /register
    if (path === "/" || publicPaths.includes(path)) {
      return NextResponse.redirect(new URL("/rmo", req.nextUrl)); // dashboard
    }
    // Otherwise allow access to private routes
    return;
  }
}

// --- Apply middleware only to relevant paths ---
export const config = {
  matcher: [
    "/",               
    "/admin",          
    "/rmo/:path*",     
    "/:officer/:path*", 
    "/login",
    "/register",
  ],
};
