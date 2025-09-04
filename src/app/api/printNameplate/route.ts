import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb"; // your db connection helper
import VerifiedNameplate from "@/models/VerifiedNameplate"; // model you shared

// GET → fetch all nameplates
export async function GET() {
  try {
    // Connect to DB
    await dbConnect();

    // Fetch all documents
    const nameplates = await VerifiedNameplate.find();

    // Return response
    return NextResponse.json(
      { success: true, data: nameplates },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching nameplates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch nameplates" },
      { status: 500 }
    );
  }
}
