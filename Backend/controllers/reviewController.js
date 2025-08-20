import Review from "../models/Review.js";
import Property from "../models/Property.js";

export const createReview = async (req, res) => {
  try {
    const { type, property, rating, comment, targetUser } = req.body;

    if (!type || !rating || !targetUser) {
      return res.status(400).json({ message: "Type, rating, and target user are required" });
    }

    // If it's a property review, property must exist
    if (type === "property") {
      const prop = await Property.findById(property);
      if (!prop) return res.status(404).json({ message: "Property not found" });
    }

    const review = await Review.create({
      type,
      property: type === "property" ? property : undefined,
      rating,
      comment,
      reviewer: req.user._id,
      targetUser,
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getReviewsForUser = async (req, res) => {
  try {
    const reviews = await Review.find({ targetUser: req.params.userId })
      .populate("reviewer", "name email")
      .populate("property", "title");

    res.json(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
