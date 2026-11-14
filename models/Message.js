import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: String,
    email: String,
    subject: String,
    orderId: String,
    message: { type: String, required: true },
    status: { type: String, enum: ["New", "Done"], default: "New", index: true },
  },
  { timestamps: true, collection: "messages" }
);

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
