import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" }, 
        { status: 400 }
      );
    }

    // Find user and populate basic info
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" }, 
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated. Please contact administrator." }, 
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" }, 
        { status: 401 }
      );
    }

    // Update login statistics
    user.loginCount += 1;
    user.lastLogin = new Date();
    await user.save();

    // Create user payload (exclude password)
    const userPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      officerName: user.officerName,
      designation: user.designation,
      area: user.area,
      deliveryOffice: user.deliveryOffice,
      profileImage: user.profileImage,
      permissions: user.permissions,
      assignedRegions: user.assignedRegions,
      performanceMetrics: user.performanceMetrics
    };

    // Sign JWT
    const token = jwt.sign(
      userPayload,
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    // Role-based redirect
    let redirect = "/dashboard";
    if (user.role === "admin") redirect = "/dashboard/admin";
    else if (user.role === "officer") redirect = "/dashboard/officer";
    else if (user.role === "rmo") redirect = "/dashboard/rmo";

    // Response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: userPayload,
      role: user.role,
      redirect,
      token: token // For client-side storage if needed
    });

    // Store token in HTTP-only cookies
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." }, 
      { status: 500 }
    );
  }
}
