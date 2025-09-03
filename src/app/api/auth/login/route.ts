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

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if active
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

    // Update login stats
    user.loginCount += 1;
    user.lastLogin = new Date();
    await user.save();

    // User payload
    const userPayload = {
      id: user._id.toString(),
      email: user.email,
      officerName: user.officerName,
      officerNumber: user.officerNumber, // dynamic officerNumber
      designation: user.designation,
      area: user.area,
      deliveryOffice: user.deliveryOffice,
      profileImage: user.profileImage,
      permissions: user.permissions,
      assignedRegions: user.assignedRegions,
      performanceMetrics: user.performanceMetrics,
    };

    // Sign JWT
    const token = jwt.sign(userPayload, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });

    // Redirect based purely on officerNumber
    const redirect = `/${user.officerNumber}`;

    // Response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: userPayload,
      redirect,
      token,
    });

    // Store token in HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 24 * 60 * 60,
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
