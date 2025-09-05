import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createReview, getReviewsForUser, getReviewsByUser, getLandlordReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", protect, createReview);

router.get("/user/:userId", protect, getReviewsForUser);

router.get("/by-user/:userId", protect, getReviewsByUser);

router.get("/landlord", protect, getLandlordReviews);

export default router;
