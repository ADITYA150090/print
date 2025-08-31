import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Nameplate from "@/models/Nameplate";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    await connectDB();

    // 🔹 Extract token from cookies
    const token = req.headers.get("cookie")
      ?.split("; ")
      .find(c => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string };

    // 🔹 Fetch all nameplates created by this user
    const nameplates = await Nameplate.find({ email: decoded.email }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, nameplates });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
