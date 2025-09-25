import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createShare,
  getSharedProperty,
  trackShareRegistration,
  getSharingStats
} from "../controllers/shareController.js";

const router = express.Router();

// Create a share (protected)
router.post("/property/:propertyId", protect, createShare);

// Get shared property (public - for registration gate)
router.get("/property/:propertyId/:shareToken", getSharedProperty);

// Track registration from share (public)
router.post("/track-registration", trackShareRegistration);

// Get user's sharing statistics (protected)
router.get("/stats", protect, getSharingStats);

export default router;
