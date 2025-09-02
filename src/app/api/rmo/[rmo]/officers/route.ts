import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User"; // your schema

// GET all officers for a given RMO
export async function GET(
  req: Request,
  { params }: { params: { rmo: string } }
) {
  const { rmo } = params;

  try {
    // connect to MongoDB
    await dbConnect();

    // find officers by RMO
    const officers = await User.find(
      { rmo },
      { officerName: 1, officerNumber: 1 } // project only fields we need
    ).lean();

    return NextResponse.json({
      success: true,
      officers,
    });
  } catch (error: any) {
    console.error("Error fetching officers:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch officers" },
      { status: 500 }
    );
  }
}
