import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // --- Skip static files and API routes ---
  if (
    path.startsWith("/_next/") ||
    path.startsWith("/favicon.ico") ||
    path.startsWith("/public/") ||
    path.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value || "";
  const publicPaths = ["/login", "/register"];

  // --- Not logged in ---
  if (!token) {
    if (path === "/" || publicPaths.includes(path)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // --- Logged in ---
  try {
    const decoded: any = jwt.decode(token);
    const officerNumber = decoded?.officerNumber; // 👈 use correct field

    if (!officerNumber) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }

    // If at `/`, `/login`, or `/register` → send to officerNumber page
    if (path === "/" || publicPaths.includes(path)) {
      return NextResponse.redirect(new URL(`/${officerNumber}`, req.nextUrl));
    }

    // If at some other officer path → force correct officer
    const firstSegment = path.split("/")[1];
    if (firstSegment && firstSegment !== officerNumber) {
      return NextResponse.redirect(new URL(`/${officerNumber}`, req.nextUrl));
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
    "/admin",
    "/:officer/:path*",
    "/login",
    "/register",
  ],
};
