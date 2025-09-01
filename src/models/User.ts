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
    designation: { type: String, trim: true },
    area: { type: String, trim: true },
    deliveryOffice: { type: String, trim: true },
    address: { type: String, trim: true },
    role: { 
      type: String, 
      enum: ["admin", "officer", "rmo"], 
      required: true,
      default: "officer"
    },
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
      averageRating: { type: Number, default: 0 }
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ area: 1 });
UserSchema.index({ isActive: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return this.officerName;
});

// Virtual for performance percentage
UserSchema.virtual('completionRate').get(function() {
  if (this.performanceMetrics.totalOrders === 0) return 0;
  return Math.round((this.performanceMetrics.completedOrders / this.performanceMetrics.totalOrders) * 100);
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
