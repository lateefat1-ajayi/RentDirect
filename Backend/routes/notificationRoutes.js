import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getUnreadCounts,
  markAsRead,
  markAllAsRead,
  getUserNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

router.use(protect);

router.get("/", getUserNotifications);

router.get("/unread-counts", getUnreadCounts);
router.get("/counts", getUnreadCounts); // Add this route for frontend compatibility

router.get("/user/:userId", getUserNotifications);

router.put("/:id/read", markAsRead);

router.put("/read/all", markAllAsRead);

export default router;
