import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    category: { 
      type: String, 
      enum: ["general", "technical", "billing", "complaint", "suggestion", "partnership"],
      default: "general"
    },
    status: { 
      type: String, 
      enum: ["pending", "in-progress", "resolved", "closed"],
      default: "pending"
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminResponse: { type: String },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    respondedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);
