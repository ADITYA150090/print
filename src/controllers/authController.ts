import bcrypt from "bcryptjs";
import User from "@/models/User";

export const registerUser = async (data: any) => {
  const { officerName, email, password, mobileNumber, rmoNumber } = data;

  if (!officerName || !email || !password || !mobileNumber || !rmoNumber) {
    throw new Error("All required fields must be filled");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Count officers under this RMO
  const officerCount = await User.countDocuments({ rmoNumber });

  // Generate officer code
  const rmoId = rmoNumber.replace("RMO", "");
  const officerCode = `OFF${rmoId}${officerCount + 1}`;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser = await User.create({
    officerName,
    email,
    password: hashedPassword,
    mobileNumber,
    rmoNumber,
    officerCode,
    isActive: true,
    loginCount: 0,
    permissions: [],
    assignedRegions: [],
    performanceMetrics: {
      totalOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
      averageRating: 0,
    },
  });

  return {
    officerCode: newUser.officerCode,
    email: newUser.email,
    officerName: newUser.officerName,
  };
};
