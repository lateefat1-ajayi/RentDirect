import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import {
  getDashboardStats,
  getDashboardActivities,
  getAllUsers,
  getUserDetails,
  suspendUser,
  activateUser,
  getAllLandlords,
  getLandlordDetails,
  verifyLandlord,
  getAllProperties,
  approveProperty,
  rejectProperty,
  getAllPayments,
  getRevenueStats,
  getAdminProfile,
  updateAdminProfile
} from "../controllers/adminController.js";
import {
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact
} from "../controllers/contactController.js";
import {
  getAdminNotifications,
  adminMarkAsRead,
  adminMarkAllAsRead
} from "../controllers/notificationController.js";

const router = express.Router();

// Apply middleware to all routes
router.use(protect, isAdmin);

// Dashboard routes
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/activities", getDashboardActivities);

// User management routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetails);
router.put("/users/:id/suspend", suspendUser);
router.put("/users/:id/activate", activateUser);

// Landlord management routes
router.get("/landlords", getAllLandlords);
router.get("/landlords/:id", getLandlordDetails);
router.put("/landlords/:id/verify", verifyLandlord);

// Property management routes
router.get("/properties", getAllProperties);
router.put("/properties/:id/approve", approveProperty);
router.put("/properties/:id/reject", rejectProperty);

// Payment and revenue routes
router.get("/payments", getAllPayments);
router.get("/revenue", getRevenueStats);

// Profile routes
router.get("/profile", getAdminProfile);
router.put("/profile", updateAdminProfile);

// Contact management routes
router.get("/contacts", getAllContacts);
router.get("/contacts/:id", getContactById);
router.put("/contacts/:id", updateContact);
router.delete("/contacts/:id", deleteContact);

// Notification routes
router.get("/notifications", getAdminNotifications);
router.put("/notifications/:id/read", adminMarkAsRead);
router.put("/notifications/mark-all-read", adminMarkAllAsRead);

export default router;
