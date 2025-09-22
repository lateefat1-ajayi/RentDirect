import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    leaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Lease", required: false },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reporterRole: { type: String, enum: ["tenant", "landlord", "admin"], required: true },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetRole: { type: String, enum: ["tenant", "landlord", "admin"], required: true },
    category: { type: String, default: "other" },
    message: { type: String, required: true },
    status: { type: String, enum: ["open", "in_review", "resolved", "closed"], default: "open" },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", ReportSchema);
export default Report;


