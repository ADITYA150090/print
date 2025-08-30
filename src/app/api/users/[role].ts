// routes/userRoutes.ts (or in Next.js: pages/api/users/[role].ts)
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect"; // your MongoDB connection file
import User from "@/models/User";       // the schema you shared

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { role } = req.query;

  try {
    const users = await User.find({ role });
    res.status(200).json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
