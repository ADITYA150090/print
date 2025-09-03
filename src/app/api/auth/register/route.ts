// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";

import User from "@/models/User";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { officerName, email, password, mobileNumber, rmo } = await req.json();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Count officers in this RMO
    const count = await User.countDocuments({ rmo });
    const officerNumber = `OFF${rmo.replace("RMO", "")}${count + 1}`;

    const newUser = await User.create({
      officerName,
      email,
      password: hashedPassword,
      mobileNumber,
      rmo,
      officerNumber,
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
