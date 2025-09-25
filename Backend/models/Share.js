import mongoose from "mongoose";

const shareSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true
  },
  sharedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  shareToken: {
    type: String,
    required: true,
    unique: true
  },
  sharedAt: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  },
  registrations: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

// Index for faster queries
shareSchema.index({ shareToken: 1 });
shareSchema.index({ property: 1, sharedBy: 1 });

export default mongoose.model("Share", shareSchema);
