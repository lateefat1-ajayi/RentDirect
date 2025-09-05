import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { submitVerification } from "../controllers/landlordController.js";
import { getUserNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";

const router = express.Router();

// Landlord verification submission
router.post("/verification", protect, requireRole("landlord"), upload.fields([
  { name: "identification", maxCount: 1 },
  { name: "utilityBill", maxCount: 1 },
  { name: "bankStatement", maxCount: 1 },
  { name: "propertyDocuments", maxCount: 1 }
]), submitVerification);

// Notification routes
router.get("/notifications", protect, requireRole("landlord"), getUserNotifications);
router.put("/notifications/:id/read", protect, requireRole("landlord"), markAsRead);
router.put("/notifications/mark-all-read", protect, requireRole("landlord"), markAllAsRead);

export default router;
