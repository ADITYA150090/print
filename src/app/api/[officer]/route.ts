import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ officer: string }> }
) {
  try {
    // Await params in Next.js 15
    const params = await context.params;
    const officerId = params.officer.toLowerCase();

    console.log("📍 Fetching stats for officer:", officerId);

    // Connect to database
    await connectDB();

    // Get token directly from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    console.log("🔐 Token from cookies:", token ? "Found" : "Not found");

    if (!token) {
      console.log("❌ No authentication token found");
      return NextResponse.json(
        { 
          success: false, 
          error: "Authentication required",
          details: "Please log in to access this page"
        },
        { status: 401 }
      );
    }

    // Verify JWT directly
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        email: string;
        role: string;
      };
      console.log("👤 Decoded user ID:", decoded.id);
    } catch (error) {
      console.error("❌ JWT verification failed:", error);
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Find user by id
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("❌ User not found in database");
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    console.log("✅ User found:", user.officerNumber);

    // Check for officerNumber
    const loggedInOfficer = (
      user.officerNumber || 
      user.officer_number || 
      user.officerId ||
      user.id
    )?.toString().toLowerCase();

    console.log("👤 Logged in officer:", loggedInOfficer);
    console.log("🎯 Requested officer:", officerId);

    if (!loggedInOfficer) {
      console.log("❌ No officer identifier found in user data");
      return NextResponse.json(
        { 
          success: false, 
          error: "Officer identifier not found in user profile"
        },
        { status: 404 }
      );
    }

    // Verify the logged-in officer matches the requested officer
    if (loggedInOfficer !== officerId) {
      console.log("❌ Officer mismatch");
      return NextResponse.json(
        { 
          success: false, 
          error: "Unauthorized: You can only access your own dashboard",
          loggedInAs: loggedInOfficer,
          requestedOfficer: officerId
        },
        { status: 403 }
      );
    }

    // TODO: Fetch real stats from database
    // For now, using hardcoded stats
    const stats = {
      unverified: 0,
      verified: 0,
      onTransit: 0,
      totalDelivered: 0,
    };

    console.log("✅ Returning stats for officer:", officerId);

    return NextResponse.json({
      success: true,
      officerNumber: loggedInOfficer,
      data: stats,
    });
  } catch (err: any) {
    console.error("❌ GET /api/[officer] error:", err);
    console.error("❌ Error stack:", err.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: err.message || "Internal server error"
      },
      { status: 500 }
    );
  }
}