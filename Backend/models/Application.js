import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true
  },
  moveInDate: {
    type: Date,
    required: true
  },
  employmentStatus: {
    type: String,
    enum: ["employed", "student", "self-employed", "unemployed"],
    required: true
  },
  income: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }
}, { timestamps: true });

export default mongoose.model("Application", applicationSchema);
