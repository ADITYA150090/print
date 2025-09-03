import mongoose, { Schema, Document } from "mongoose";

export interface IVerifiedNameplate extends Document {
  rmo: string;
  officerId: string;
  lot: string;
  houseName: string;
  ownerName: string;
  spouseName: string;
  address: string;
  imageUrl: string;
  createdAt: Date;
}

const VerifiedNameplateSchema: Schema = new Schema(
  {
    rmo: { type: String, required: true },
    officerId: { type: String, required: false},
    lot: { type: String, required: true },
    houseName: { type: String, required: true },
    ownerName: { type: String, required: true },
    spouseName: { type: String },
    address: { type: String },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.VerifiedNameplate ||
  mongoose.model<IVerifiedNameplate>("VerifiedNameplate", VerifiedNameplateSchema);
