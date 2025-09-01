import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  try {
    // fetch all officers (you can filter by role if needed)
    const officers = await User.find({ role: "officer" }).select("officerName role designation");

    res.status(200).json({
      success: true,
      count: officers.length,
      officers,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
