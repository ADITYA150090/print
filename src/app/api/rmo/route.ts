import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    // Get unique RMOs (ignore null/empty values)
    const rmos = await User.distinct("rmo", { rmo: { $nin: [null, ""] } });

    return NextResponse.json({ success: true, rmos });
  } catch (error) {
    console.error("Error fetching RMOs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch RMOs" },
      { status: 500 }
    );
  }
}
