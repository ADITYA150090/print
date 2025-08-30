import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    // Determine redirect route
    let redirect = "/dashboard";
    if (user.role === "admin") redirect = "/dashboard/admin";
    else if (user.role === "officer") redirect = "/dashboard/officer";
    if (user.role === "rmo") redirect = "/dashboard/orm";

    // Response
    const response = NextResponse.json({
      message: "Login successful",
      role: user.role,
      redirect, // 👈 send correct route to frontend
    });

    // Store token in cookies
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
