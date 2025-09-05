import Review from "../models/Review.js";
import Property from "../models/Property.js";
import { createNotification } from "./notificationController.js";

export const createReview = async (req, res) => {
  try {
    console.log("Review creation request body:", req.body);
    console.log("User making request:", req.user);
    
    const { reviewType, property, rating, title, comment, reviewedUser } = req.body;

    if (!reviewType || !rating || !reviewedUser || !comment) {
      console.log("Missing required fields:", { reviewType, rating, reviewedUser, comment });
      return res.status(400).json({ message: "Review type, rating, comment, and reviewed user are required" });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // If it's a property review, property must exist
    if (property) {
      const prop = await Property.findById(property);
      if (!prop) return res.status(404).json({ message: "Property not found" });
    }

    // Check if user is trying to review themselves
    if (req.user._id.toString() === reviewedUser.toString()) {
      return res.status(400).json({ message: "Users cannot review themselves" });
    }

    const reviewData = {
      reviewType,
      property,
      rating,
      title,
      comment,
      reviewer: req.user._id,
      reviewedUser,
    };

    console.log("Creating review with data:", reviewData);

    const review = await Review.create(reviewData);

    console.log("Review created successfully:", review);

    // Create notification for the reviewed user
    try {
      await createNotification(
        reviewedUser,
        "review",
        "New Review Received",
        `${req.user.name} left you a ${rating}-star review`,
        "",
        { reviewId: review._id, reviewType: reviewType, action: "received" },
        req
      );
      console.log("Notification created for reviewed user");
    } catch (notifError) {
      console.error("Failed to create notification for reviewed user:", notifError);
    }

    // Create notification for the reviewer (confirmation)
    try {
      await createNotification(
        req.user._id,
        "review",
        "Review Submitted",
        `Your review has been submitted successfully`,
        "",
        { reviewId: review._id, reviewType: reviewType, action: "submitted" },
        req
      );
      console.log("Notification created for reviewer");
    } catch (notifError) {
      console.error("Failed to create notification for reviewer:", notifError);
    }

    res.status(201).json(review);
  } catch (error) {
    console.error("Create review error:", error);
    
    // Check for duplicate review error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "You have already reviewed this user. You can only review each person once.",
        error: "duplicate_review"
      });
    }
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationErrors,
        error: "validation_error"
      });
    }
    
    // Check for custom errors (like self-review prevention)
    if (error.message && error.message.includes("cannot review themselves")) {
      return res.status(400).json({ 
        message: "Users cannot review themselves",
        error: "self_review"
      });
    }
    
    res.status(500).json({ message: "Server error" });
  }
};

export const getReviewsForUser = async (req, res) => {
  try {
    console.log("Getting reviews FOR user:", req.params.userId);
    
    const reviews = await Review.find({ reviewedUser: req.params.userId })
      .populate("reviewer", "name email profileImage")
      .populate("property", "title location")
      .sort({ createdAt: -1 });

    console.log("Found reviews:", reviews.length);
    console.log("Sample review:", reviews[0]);

    res.json(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getReviewsByUser = async (req, res) => {
  try {
    console.log("Getting reviews BY user:", req.params.userId);
    
    const reviews = await Review.find({ reviewer: req.params.userId })
      .populate("reviewedUser", "name email profileImage")
      .populate("property", "title location")
      .sort({ createdAt: -1 });

    console.log("Found reviews by user:", reviews.length);
    console.log("Sample review:", reviews[0]);

    res.json(reviews);
  } catch (error) {
    console.error("Get reviews by user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLandlordReviews = async (req, res) => {
  try {
    console.log("Getting reviews FOR landlord:", req.user._id);
    
    const reviews = await Review.find({ reviewedUser: req.user._id })
      .populate("reviewer", "name email profileImage")
      .populate("property", "title location")
      .sort({ createdAt: -1 });

    console.log("Found reviews for landlord:", reviews.length);
    console.log("Sample review:", reviews[0]);

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching landlord reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};
