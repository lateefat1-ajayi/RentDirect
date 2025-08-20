import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true }, // Paystack reference
  amount: { type: Number, required: true }, // in kobo
  status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lease: { type: mongoose.Schema.Types.ObjectId, ref: "Lease", required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
}, { timestamps: true });

export default mongoose.model("Payment", PaymentSchema);
