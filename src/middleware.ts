import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname.toLowerCase();

  // Skip static & API files
  if (
    path.startsWith("/_next/") ||
    path.startsWith("/favicon.ico") ||
    path.startsWith("/public/") ||
    path.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value || "";

  // --- Not logged in ---
  if (!token) {
    const publicPaths = ["/", "/login", "/register"];
    if (publicPaths.some(p => path === p || path.startsWith(p))) return NextResponse.next();
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // --- Logged in ---
  try {
    const decoded: any = jwt.decode(token);
    const officerNumber = decoded?.officerNumber?.toLowerCase();
    const role = decoded?.role?.toLowerCase() || (officerNumber ? "officer" : null);

    if (!role) return NextResponse.redirect(new URL("/", req.nextUrl));

    // Redirect only from "/", "/login", "/register"
    if (path === "/" || path === "/login" || path === "/register") {
      if (role === "admin") return NextResponse.redirect(new URL("/admin", req.nextUrl));
      if (role === "rmo") return NextResponse.redirect(new URL("/rmo", req.nextUrl));
      if (role === "officer" && officerNumber) return NextResponse.redirect(new URL(`/${officerNumber}`, req.nextUrl));
    }

    // Admin routes
    if (path.startsWith("/admin")) {
      return role === "admin" ? NextResponse.next() : NextResponse.redirect(new URL(`/${officerNumber}`, req.nextUrl));
    }

    // RMO routes
    if (path.startsWith("/rmo")) {
      return role === "rmo" ? NextResponse.next() : NextResponse.redirect(new URL(`/${officerNumber}`, req.nextUrl));
    }

    // Officer routes
    if (role === "officer" && officerNumber) {
      if (!path.startsWith(`/${officerNumber}`)) {
        return NextResponse.redirect(new URL(`/${officerNumber}`, req.nextUrl));
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (err) {
    console.error("❌ Invalid token:", err);
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/rmo/:path*",
    "/login",
    "/register",
    "/:officer",
    "/:officer/:path*",
  ],
};
