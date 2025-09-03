import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Dynamically get the base URL of the server
    const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    // Fetch logged-in officer info
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: req.headers, // forward cookies/session
    });

    const data = await res.json();

    // Check if officer exists
    if (!data.success || !data.user?.officerNumber) {
      return NextResponse.json(
        { success: false, error: "Officer not found" },
        { status: 404 }
      );
    }

    // Hardcoded stats
    const stats = {
      unverified: 550,
      verified: 500,
      onTransit: 300,
      totalDelivered: 50000,
    };

    return NextResponse.json({
      success: true,
      officerNumber: data.user.officerNumber,
      data: stats,
    });
  } catch (err: any) {
    console.error("❌ GET /api/officerStats error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
