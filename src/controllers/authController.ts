import User from "@/models/User";
import connectDB from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function registerUser(data: {
  officerName: string;
  email: string;
  password: string;
  mobileNumber: string;
  role: string;
  designation?: string;
  area?: string;
  deliveryOffice?: string;
  address?: string;
}) {
  // Connect to DB
  await connectDB();

  const { officerName, email, password, mobileNumber, role, designation, area, deliveryOffice, address } = data;

  // Validate required fields
  if (!officerName || !email || !password || !mobileNumber || !role) {
    throw new Error("Missing required fields");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser = await User.create({
    officerName,
    email,
    password: hashedPassword,
    mobileNumber,
    role,
    designation,
    area,
    deliveryOffice,
    address,
  });

  return newUser;
}
