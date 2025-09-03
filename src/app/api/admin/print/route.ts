import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import VerifiedNameplate from "@/models/VerifiedNameplate";

export async function POST(req: Request) {
  try {
    console.log("✅ Print API called");
    await dbConnect();
    console.log("✅ Connected to MongoDB");

    const body = await req.json();
    console.log("📦 Incoming body:", body);

    const { rmo, officerId, lot, records } = body;

    if (!rmo || !lot || !Array.isArray(records)) {
        return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
      }
      

    // ✅ Save each record as VerifiedNameplate
    const savedRecords = await VerifiedNameplate.insertMany(
      records.map((rec: any) => ({
        rmo,
        officerId,
        lot,
        houseName: rec.houseName,
        ownerName: rec.ownerName,
        spouseName: rec.spouseName,
        address: rec.address,
        imageUrl: rec.imageUrl,
      }))
    );

    return NextResponse.json({
      success: true,
      message: "Records saved successfully",
      count: savedRecords.length,
    });
  } catch (err: any) {
    console.error("❌ Print API Error:", err.message);
    return NextResponse.json(
      { success: false, message: "Failed to save records" },
      { status: 500 }
    );
  }
}
