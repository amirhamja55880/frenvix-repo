import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    subs: [String], // sub categories
    hiddenSubs: [String], // sub categories that are hidden on the website
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "categories" }
);

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);
