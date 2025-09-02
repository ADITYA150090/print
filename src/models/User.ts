import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  officerName: string;
  email: string;
  password: string;
  mobileNumber: string;
  officerNumber?: string; // Auto-generated, e.g., OFF11, OFF12
  rmo: string;            // e.g., RMO1
  designation?: string;
  area?: string;
  deliveryOffice?: string;
  address?: string;
  profileImage?: string;
  isActive: boolean;
  lastLogin?: Date;
  loginCount: number;
  permissions: string[];
  assignedRegions?: string[];
  performanceMetrics: {
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    averageRating: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    officerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true, trim: true },
    officerNumber: { type: String, unique: true }, // OFFxx format
    rmo: { type: String, required: true }, // RMO1, RMO2, etc.

    designation: { type: String, trim: true },
    area: { type: String, trim: true },
    deliveryOffice: { type: String, trim: true },
    address: { type: String, trim: true },
    profileImage: { type: String },

    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 },

    permissions: [{ type: String }],
    assignedRegions: [{ type: String }],

    performanceMetrics: {
      totalOrders: { type: Number, default: 0 },
      completedOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true, // auto adds createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Useful indexes for queries
UserSchema.index({ email: 1 });
UserSchema.index({ rmo: 1 });
UserSchema.index({ officerNumber: 1 });

// ✅ Export (always reuse existing model if already compiled)
export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
