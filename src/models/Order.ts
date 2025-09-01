import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  orderNumber: string;
  nameplateId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  officerId: mongoose.Types.ObjectId;
  status: "pending" | "confirmed" | "in_production" | "quality_check" | "ready_for_delivery" | "out_for_delivery" | "delivered" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  orderType: "standard" | "custom" | "rush" | "bulk";
  
  // Order Details
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  currency: string;
  
  // Production Details
  productionStartDate?: Date;
  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;
  productionNotes?: string;
  
  // Quality Control
  qualityCheckDate?: Date;
  qualityInspector?: string;
  qualityScore?: number;
  qualityNotes?: string;
  isQualityPassed: boolean;
  
  // Delivery Details
  deliveryAddress: string;
  deliveryContact: {
    name: string;
    phone: string;
    email?: string;
  };
  preferredDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  deliveryMethod: "standard" | "express" | "same_day";
  deliveryNotes?: string;
  trackingNumber?: string;
  
  // Payment Details
  paymentStatus: "pending" | "partial" | "completed" | "failed";
  paymentMethod?: string;
  paymentDate?: Date;
  invoiceNumber?: string;
  
  // Timestamps and Metadata
  tags: string[];
  notes: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  },
  nameplateId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Nameplate', 
    required: true 
  },
  customerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true 
  },
  officerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "in_production", "quality_check", "ready_for_delivery", "out_for_delivery", "delivered", "cancelled"],
    default: "pending"
  },
  priority: { 
    type: String, 
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  orderType: { 
    type: String, 
    enum: ["standard", "custom", "rush", "bulk"],
    default: "standard"
  },
  
  // Order Details
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  finalAmount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "INR" },
  
  // Production Details
  productionStartDate: { type: Date },
  estimatedCompletionDate: { type: Date },
  actualCompletionDate: { type: Date },
  productionNotes: { type: String, trim: true },
  
  // Quality Control
  qualityCheckDate: { type: Date },
  qualityInspector: { type: String, trim: true },
  qualityScore: { type: Number, min: 0, max: 100 },
  qualityNotes: { type: String, trim: true },
  isQualityPassed: { type: Boolean, default: false },
  
  // Delivery Details
  deliveryAddress: { type: String, required: true, trim: true },
  deliveryContact: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true }
  },
  preferredDeliveryDate: { type: Date },
  actualDeliveryDate: { type: Date },
  deliveryMethod: { 
    type: String, 
    enum: ["standard", "express", "same_day"],
    default: "standard"
  },
  deliveryNotes: { type: String, trim: true },
  trackingNumber: { type: String, trim: true },
  
  // Payment Details
  paymentStatus: { 
    type: String, 
    enum: ["pending", "partial", "completed", "failed"],
    default: "pending"
  },
  paymentMethod: { type: String, trim: true },
  paymentDate: { type: Date },
  invoiceNumber: { type: String, trim: true },
  
  // Timestamps and Metadata
  tags: [{ type: String, trim: true }],
  notes: { type: String, trim: true },
  attachments: [{ type: String }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ officerId: 1 });
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ createdAt: 1 });
OrderSchema.index({ priority: 1 });
OrderSchema.index({ paymentStatus: 1 });

// Virtual for order age
OrderSchema.virtual('orderAge').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for isOverdue
OrderSchema.virtual('isOverdue').get(function() {
  if (!this.estimatedCompletionDate) return false;
  const now = new Date();
  return now > this.estimatedCompletionDate && this.status !== "delivered";
});

// Virtual for profit margin
OrderSchema.virtual('profitMargin').get(function() {
  if (this.totalAmount === 0) return 0;
  return Math.round(((this.finalAmount - this.totalAmount) / this.totalAmount) * 100);
});

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema); 