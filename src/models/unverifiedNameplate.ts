// models/unverifiedNameplate.ts
import mongoose, { Schema, Document, models } from "mongoose";

export interface IUnverifiedNameplate extends Document {
  theme: string;
  background: string;
  houseName: string;
  ownerName: string;
  address: string;
  textColor?: string;

  rmo: string;
  officer: string;
  lot: string;
  officer_name: string;
  email: string;
  mobileNumber?: string;   // optional now
  imageUrl?: string;       // optional now
  designation?: string;    // optional, can remove if not needed

  createdAt?: Date;
  updatedAt?: Date;
}

const UnverifiedNameplateSchema: Schema = new Schema(
  {
    theme: { type: String, required: true },
    background: { type: String, required: true },
    houseName: { type: String, required: true },
    ownerName: { type: String, required: true },
    address: { type: String, required: true },
    textColor: { type: String, default: "#000000" },

    rmo: { type: String, required: true },
    officer: { type: String, required: true },
    lot: { type: String, required: true },
    officer_name: { type: String, required: true },
    email: { type: String, required: true },
    mobileNumber: { type: String, default: "" }, // optional
    imageUrl: { type: String, default: "" },     // optional
    designation: { type: String, default: "" },  // optional
  },
  { timestamps: true }
);

// Prevent overwrite error in Next.js
export default models.UnverifiedNameplate ||
  mongoose.model<IUnverifiedNameplate>(
    "UnverifiedNameplate",
    UnverifiedNameplateSchema
  );
