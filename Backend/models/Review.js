import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reviewedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: false,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  reviewType: {
    type: String,
    enum: ["landlord_review", "tenant_review"],
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property"
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Prevent users from reviewing themselves
reviewSchema.pre("save", function(next) {
  if (this.reviewer.toString() === this.reviewedUser.toString()) {
    return next(new Error("Users cannot review themselves"));
  }
  next();
});

// Prevent multiple reviews from same user to same user
reviewSchema.index({ reviewer: 1, reviewedUser: 1 }, { unique: true });

// Calculate average rating for a user
reviewSchema.statics.calculateAverageRating = async function(userId) {
  const result = await this.aggregate([
    { $match: { reviewedUser: userId, isPublic: true } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);
  
  return result.length > 0 ? {
    averageRating: Math.round(result[0].avgRating * 10) / 10,
    totalReviews: result[0].count
  } : { averageRating: 0, totalReviews: 0 };
};

const Review = mongoose.model("Review", reviewSchema);

export default Review;
