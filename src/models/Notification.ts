import mongoose, { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    message: { type: String, required: true },
    type: { type: String, enum: ["success", "error", "info"], default: "info" },
    userId: { type: String }, // optional, if you want to track who created it
  },
  { timestamps: true }
);

export default models.Notification || model("Notification", NotificationSchema);
