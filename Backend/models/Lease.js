import mongoose from "mongoose";

const leaseSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rentAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "active", "terminated"],
      default: "pending",
    },
    // Digital signatures and finalized document
    tenantSignatureUrl: { type: String, default: "" },
    landlordSignatureUrl: { type: String, default: "" },
    signedAt: { type: Date },
    leaseDocumentUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

const Lease = mongoose.model("Lease", leaseSchema);
export default Lease;
