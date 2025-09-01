import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification"; // You'll create this model

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  try {
    if (req.method === "POST") {
      // Add new notification
      const { message, type, userId } = req.body;
      const notification = await Notification.create({
        message,
        type,
        userId,
      });
      return res.status(201).json({ success: true, notification });
    }

    if (req.method === "GET") {
      // Fetch all notifications
      const notifications = await Notification.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, notifications });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
