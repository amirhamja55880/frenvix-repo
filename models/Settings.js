import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    phone: String,
    whatsapp: String,
    email: String,
    address: String,
    hours: String,
    facebook: String,
    instagram: String,
    bkashNumber: String,
    nagadNumber: String,
    rocketNumber: String,
    gaId: String, // Google Analytics 4 id, e.g. G-XXXXXXXXXX
    pixelId: String, // Meta (Facebook) Pixel id, digits only
    gscVerification: String, // Google Search Console verification token
    announcements: [String], // messages in the moving bar at the top
    homeDistrict: { type: String, default: "Khulna" },
    deliveryInsideKhulna: { type: Number, default: 60 },
    deliveryOutsideKhulna: { type: Number, default: 120 },
  },
  { timestamps: true, collection: "settings" }
);

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
