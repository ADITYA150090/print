import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  customerCode: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contactPerson?: {
    name: string;
    designation: string;
    phone: string;
    email: string;
  };
  
  // Business Details
  businessType: "individual" | "company" | "contractor" | "builder" | "dealer";
  industry: string;
  gstNumber?: string;
  panNumber?: string;
  
  // Classification
  customerType: "new" | "regular" | "premium" | "vip";
  creditLimit: number;
  paymentTerms: string;
  
  // Preferences
  preferredLanguage: string;
  preferredContactMethod: "phone" | "email" | "whatsapp";
  specialInstructions?: string;
  
  // Statistics
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  averageOrderValue: number;
  
  // Status
  isActive: boolean;
  isVerified: boolean;
  verificationDate?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  
  // Tags and Notes
  tags: string[];
  notes: string;
  source: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  customerCode: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  },
  name: { type: String, required: true, trim: true },
  company: { type: String, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  alternatePhone: { type: String, trim: true },
  address: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: "India" }
  },
  contactPerson: {
    name: { type: String, trim: true },
    designation: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true }
  },
  
  // Business Details
  businessType: { 
    type: String, 
    enum: ["individual", "company", "contractor", "builder", "dealer"],
    default: "individual"
  },
  industry: { type: String, trim: true },
  gstNumber: { type: String, trim: true },
  panNumber: { type: String, trim: true },
  
  // Classification
  customerType: { 
    type: String, 
    enum: ["new", "regular", "premium", "vip"],
    default: "new"
  },
  creditLimit: { type: Number, default: 0, min: 0 },
  paymentTerms: { type: String, default: "Net 30" },
  
  // Preferences
  preferredLanguage: { type: String, default: "English" },
  preferredContactMethod: { 
    type: String, 
    enum: ["phone", "email", "whatsapp"],
    default: "phone"
  },
  specialInstructions: { type: String, trim: true },
  
  // Statistics
  totalOrders: { type: Number, default: 0, min: 0 },
  totalSpent: { type: Number, default: 0, min: 0 },
  lastOrderDate: { type: Date },
  averageOrderValue: { type: Number, default: 0, min: 0 },
  
  // Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verificationDate: { type: Date },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // Tags and Notes
  tags: [{ type: String, trim: true }],
  notes: { type: String, trim: true },
  source: { type: String, default: "website", trim: true }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
CustomerSchema.index({ customerCode: 1 });
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ customerType: 1 });
CustomerSchema.index({ isActive: 1 });
CustomerSchema.index({ businessType: 1 });
CustomerSchema.index({ tags: 1 });

// Virtual for full address
CustomerSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}, ${addr.country}`;
});

// Virtual for customer lifetime value
CustomerSchema.virtual('lifetimeValue').get(function() {
  return this.totalSpent;
});

// Virtual for customer since
CustomerSchema.virtual('customerSince').get(function() {
  return this.createdAt;
});

// Pre-save middleware to update statistics
CustomerSchema.pre('save', function(next) {
  if (this.totalOrders > 0) {
    this.averageOrderValue = this.totalSpent / this.totalOrders;
  }
  next();
});

export default mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema); 