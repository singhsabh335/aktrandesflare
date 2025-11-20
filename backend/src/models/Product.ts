import mongoose, { Schema, Document } from 'mongoose';

export interface IVariant {
  size: string;
  color: string;
  sku: string;
  stock: number;
  price?: number;
  images?: string[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  brand: string;
  categories: string[];
  price: number;
  mrp: number;
  discount: number;
  images: string[];
  variants: IVariant[];
  rating: number;
  reviewCount: number;
  specs: Record<string, string>;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>({
  size: { type: String, required: true },
  color: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  stock: { type: Number, required: true, min: 0 },
  price: Number,
  images: [String],
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    brand: { type: String, required: true, trim: true },
    categories: [{ type: String, required: true }],
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    images: [{ type: String, required: true }],
    variants: [VariantSchema],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    specs: { type: Schema.Types.Mixed, default: {} },
    tags: [String],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ slug: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ categories: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ createdAt: -1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

