import mongoose, { Schema, model, models } from "mongoose";

export interface INameplate extends Document {
  logo: string;
  background: string;
  language: string;
  font: string;
  houseName: string;
  ownerName: string;
  address: string;
  styles: {
    houseName: { fontSize: number; color: string; x: number; y: number };
    ownerName: { fontSize: number; color: string; x: number; y: number };
    address: { fontSize: number; color: string; x: number; y: number };
  };
  officerName: string;
  email: string;
  status: "draft" | "pending" | "approved" | "in_production" | "completed" | "delivered";
  priority: "low" | "medium" | "high" | "urgent";
  customerDetails: {
    name: string;
    phone: string;
    email?: string;
    company?: string;
  };
  orderDetails: {
    quantity: number;
    size: string;
    material: string;
    specialInstructions?: string;
  };
  pricing: {
    basePrice: number;
    customizationFee: number;
    totalPrice: number;
    currency: string;
  };
  productionDetails: {
    startDate?: Date;
    estimatedCompletion?: Date;
    actualCompletion?: Date;
    productionNotes?: string;
  };
  deliveryDetails: {
    address: string;
    contactPerson: string;
    phone: string;
    preferredDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    deliveryNotes?: string;
  };
  qualityCheck: {
    isInspected: boolean;
    inspectorName?: string;
    inspectionDate?: Date;
    inspectionNotes?: string;
    isApproved: boolean;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NameplateSchema = new Schema<INameplate>({
  logo: { type: String, required: true },
  background: { type: String, required: true },
  language: { type: String, required: true },
  font: { type: String, required: true },
  houseName: { type: String, required: true, trim: true },
  ownerName: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  styles: {
    houseName: { 
      fontSize: { type: Number, required: true, min: 8, max: 100 },
      color: { type: String, required: true },
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    },
    ownerName: { 
      fontSize: { type: Number, required: true, min: 8, max: 100 },
      color: { type: String, required: true },
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    },
    address: { 
      fontSize: { type: Number, required: true, min: 8, max: 100 },
      color: { type: String, required: true },
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    }
  },
  officerName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  status: { 
    type: String, 
    enum: ["draft", "pending", "approved", "in_production", "completed", "delivered"],
    default: "draft"
  },
  priority: { 
    type: String, 
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  customerDetails: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    company: { type: String, trim: true }
  },
  orderDetails: {
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, required: true },
    material: { type: String, required: true },
    specialInstructions: { type: String, trim: true }
  },
  pricing: {
    basePrice: { type: Number, required: true, min: 0 },
    customizationFee: { type: Number, default: 0, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" }
  },
  productionDetails: {
    startDate: { type: Date },
    estimatedCompletion: { type: Date },
    actualCompletion: { type: Date },
    productionNotes: { type: String, trim: true }
  },
  deliveryDetails: {
    address: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    preferredDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
    deliveryNotes: { type: String, trim: true }
  },
  qualityCheck: {
    isInspected: { type: Boolean, default: false },
    inspectorName: { type: String, trim: true },
    inspectionDate: { type: Date },
    inspectionNotes: { type: String, trim: true },
    isApproved: { type: Boolean, default: false }
  },
  tags: [{ type: String, trim: true }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
NameplateSchema.index({ status: 1 });
NameplateSchema.index({ officerName: 1 });
NameplateSchema.index({ priority: 1 });
NameplateSchema.index({ createdAt: 1 });
NameplateSchema.index({ tags: 1 });

// Virtual for order age
NameplateSchema.virtual('orderAge').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for isOverdue
NameplateSchema.virtual('isOverdue').get(function() {
  if (!this.productionDetails.estimatedCompletion) return false;
  const now = new Date();
  return now > this.productionDetails.estimatedCompletion && this.status !== "delivered";
});

const Nameplate = models.Nameplate || model("Nameplate", NameplateSchema);
export default Nameplate;
