import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getUnreadCounts, getNotifications, markAsRead, markAllAsRead} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.get("/unread-counts", protect, getUnreadCounts);
router.patch("/:id/read", protect, markAsRead);
router.put("/mark-all-read", protect, markAllAsRead);

export default router;
