import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import VerifiedNameplate from "@/models/VerifiedNameplate";

export async function GET() {
  try {
    await dbConnect();
    const count = await VerifiedNameplate.countDocuments();
    return NextResponse.json({ success: true, count });
  } catch (err) {
    console.error("❌ Error fetching nameplates:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch nameplates" }, { status: 500 });
  }
}
