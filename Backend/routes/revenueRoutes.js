import express from "express";
import {
  getTotalRevenue,
  getRevenueByLandlord,
  getRevenueByDate,
  getMyRevenue,
} from "../controllers/revenueController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin-only
router.get("/total", protect, adminOnly, getTotalRevenue);
router.get("/landlord/:landlordId", protect, adminOnly, getRevenueByLandlord);
router.get("/by-date", protect, adminOnly, getRevenueByDate);

//Landlord-only route 
router.get("/my", protect, getMyRevenue);

export default router;
