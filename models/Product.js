import mongoose from "mongoose";

const Variant = new mongoose.Schema(
  { color: String, size: String, stock: { type: Number, default: 0, min: 0 } },
  { _id: false },
);
const Color = new mongoose.Schema(
  { name: String, hex: String },
  { _id: false },
);

const ProductSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    subCategory: String,
    price: { type: Number, required: true },
    oldPrice: Number,
    colors: [Color],
    images: [String],
    fabric: String,
    description: String,
    variants: [Variant], // stock per color + size
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, collection: "products" },
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
