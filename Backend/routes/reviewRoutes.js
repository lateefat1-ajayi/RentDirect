import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createReview, getReviewsForUser } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", protect, createReview);

router.get("/user/:userId", protect, getReviewsForUser);

export default router;
