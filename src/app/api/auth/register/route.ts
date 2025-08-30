import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { registerUser } from "@/controllers/authController";

export async function POST(req: Request) {
  try {
    // Connect to DB
    await connectDB();

    // Parse request body
    const body = await req.json();

    // Register user
    const user = await registerUser(body);

    // Return success
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error registering user:", error);

    return NextResponse.json(
      { success: false, error: error.message || "Server Error" },
      { status: 500 }
    );
  }
}
