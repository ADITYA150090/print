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
  mobile_number?: string;   // match DB
  image_url?: string;       // match DB
  designation?: string;
  verified?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

const UnverifiedNameplateSchema: Schema = new Schema(
  {
    theme: { type: String, required: true },
    background: { type: String, required: true },
    houseName: { type: String },
    ownerName: { type: String, required: true },
    address: { type: String },
    textColor: { type: String, default: "#000000" },

    rmo: { type: String, required: true },
    officer: { type: String, required: true },
    lot: { type: String, required: true },
    officer_name: { type: String, required: true },
    email: { type: String, required: true },
    mobile_number: { type: String, default: "" }, // match DB field
    image_url: { type: String, default: "" },     // match DB field
    designation: { type: String, default: "" },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 👇 Force mongoose to use `nameplates` collection
export default models.UnverifiedNameplate ||
  mongoose.model<IUnverifiedNameplate>(
    "UnverifiedNameplate",
    UnverifiedNameplateSchema,
    "nameplates"
  );
