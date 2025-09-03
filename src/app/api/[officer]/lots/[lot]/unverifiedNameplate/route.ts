// app/api/[officer]/lots/[lot]/createNameplate/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UnverifiedNameplate from "@/models/unverifiedNameplate";

// POST → Save new unverified nameplate
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    // ✅ Basic validation for required fields
    const requiredFields = ["theme", "background", "houseName", "ownerName", "address", "rmo", "officer", "lot", "officer_name", "email"];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // mobileNumber, imageUrl, designation are now optional
    const saved = await UnverifiedNameplate.create(body);

    return NextResponse.json(
      { success: true, data: saved },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error saving nameplate:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET → Fetch all unverified nameplates
export async function GET() {
  try {
    await dbConnect();
    const nameplates = await UnverifiedNameplate.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: nameplates });
  } catch (error: any) {
    console.error("❌ Error fetching nameplates:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
