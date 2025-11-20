import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minCartValue: number;
  maxDiscount?: number;
  applicableCategories?: string[];
  applicableProducts?: mongoose.Types.ObjectId[];
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usedCount: number;
  userLimit?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minCartValue: { type: Number, required: true, min: 0 },
    maxDiscount: Number,
    applicableCategories: [String],
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    userLimit: Number,
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

CouponSchema.index({ code: 1 });
CouponSchema.index({ validFrom: 1, validUntil: 1 });
CouponSchema.index({ isActive: 1 });

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);

