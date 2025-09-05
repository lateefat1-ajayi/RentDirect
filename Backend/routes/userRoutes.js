import express from "express";
import { getProfile, updateProfile, getUserProfile } from "../controllers/userController.js";
import { getUserNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Notification routes
router.get("/notifications", protect, getUserNotifications);
router.put("/notifications/:id/read", protect, markAsRead);
router.put("/notifications/mark-all-read", protect, markAllAsRead);

router.get("/:id", getUserProfile);

export default router;
