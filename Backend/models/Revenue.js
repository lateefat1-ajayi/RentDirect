import mongoose from "mongoose";

const RevenueSchema = new mongoose.Schema({
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  platformFee: { type: Number, required: true },
  landlordEarning: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model("Revenue", RevenueSchema);
