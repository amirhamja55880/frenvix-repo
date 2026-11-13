import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    mobileImage: String,
    link: String,
    alt: String,
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "banners" }
);

export default mongoose.models.Banner || mongoose.model("Banner", BannerSchema);
