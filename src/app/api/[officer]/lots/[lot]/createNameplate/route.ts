import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb"; // your dbConnect file
import UnverifiedNameplate from "@/models/unverifiedNameplate";

// POST → Save a new unverified nameplate
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    // Required fields
    const requiredFields = [
      "theme",
      "background",
      
      "ownerName",
      
      "rmo",
      "officer",
      "lot",
      "officer_name",
      "email",
    ];

    const missing = requiredFields.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const newNameplate = await UnverifiedNameplate.create(body);

    return NextResponse.json({
      success: true,
      message: "✅ Unverified nameplate saved",
      data: newNameplate,
    });
  } catch (err: any) {
    console.error("❌ POST error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
