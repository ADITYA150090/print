import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();

    // get all officers
    const officers = await User.find({ role: "officer" }).select("name email role");

    return Response.json({ success: true, officers });
  } catch (error) {
    console.error("Error fetching officers:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
