// pages/api/users/count/[role].ts (Next.js API route)
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { role } = req.query;

  try {
    const count = await User.countDocuments({ role });
    res.status(200).json({ role, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
