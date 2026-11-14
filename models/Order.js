import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  { slug: String, name: String, color: String, size: String, qty: Number, price: Number },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    email: { type: String, required: true },
    division: String,
    district: String,
    thana: String,
    address: { type: String, required: true },
    note: String,
    items: [ItemSchema],
    subtotal: Number,
    deliveryFee: Number,
    total: Number,
    paymentMethod: { type: String, enum: ["COD", "Online", "bKash", "Nagad", "Rocket"], default: "COD" },
    paymentRef: String,
    paymentVia: String,
    paymentStatus: { type: String, enum: ["Unpaid", "Verifying", "Paid"], default: "Unpaid" },
    payNumber: String, // bKash/Nagad/Rocket number the customer sent money from
    trxId: { type: String, index: true }, // Transaction ID the customer typed, checked by the admin
    status: { type: String, enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"], default: "Pending", index: true },
    emailSent: { type: Boolean, default: false },
    stockRestored: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
