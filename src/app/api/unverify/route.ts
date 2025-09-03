import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UnverifiedNameplate from "@/models/unverifiedNameplate";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    const rmo = searchParams.get("rmo");
    const officer = searchParams.get("officer");
    const verified = searchParams.get("verified");

    const filters: any = {};
    if (rmo) filters.rmo = rmo;
    if (officer) filters.officer = officer;
    if (verified !== null) filters.verified = verified === "true";

    console.log("🔎 Filters:", filters);

    // Fetch all data (no limit/offset)
    const records = await UnverifiedNameplate.find(filters).sort({ createdAt: -1 });
    const total = await UnverifiedNameplate.countDocuments(filters);

    return NextResponse.json({
      success: true,
      count: total,
      data: records,
    });
  } catch (err: any) {
    console.error("❌ GET /api/nameplates error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
