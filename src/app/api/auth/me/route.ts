import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    await connectDB();

    // 🔹 Get cookies using Next.js 15 cookies() function
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    console.log("🔐 Token from cookies:", token ? "Found" : "Not found");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔹 Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      role: string;
    };

    console.log("👤 Decoded user ID:", decoded.id);

    // 🔹 Find user by id
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("✅ User found:", user.officerNumber || user.email);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("❌ Auth error:", error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}