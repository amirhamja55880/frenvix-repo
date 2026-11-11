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
    homeDistrict: { type: String, default: "Khulna" },
    deliveryInsideKhulna: { type: Number, default: 60 },
    deliveryOutsideKhulna: { type: Number, default: 120 },
  },
  { timestamps: true, collection: "settings" }
);

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
