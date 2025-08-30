import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  officerName: string;
  email: string;
  password: string;
  mobileNumber: string;
  designation?: string;
  area?: string;
  deliveryOffice?: string;
  address?: string;
  role: "admin" | "officer" | "rmo";
}

const UserSchema = new Schema<IUser>(
  {
    officerName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    designation: { type: String },
    area: { type: String },
    deliveryOffice: { type: String },
    address: { type: String },
    role: { type: String, enum: ["admin", "officer", "rmo"], required: true },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
