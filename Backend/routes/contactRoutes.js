import express from "express";
import {
  submitContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  getUserContacts
} from "../controllers/contactController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route - submit contact form (requires authentication)
router.post("/", protect, submitContact);

// User route - get user's own contact history
router.get("/user", protect, getUserContacts);

// Admin routes - require admin authentication
router.get("/", protect, adminOnly, getAllContacts);
router.get("/:id", protect, adminOnly, getContactById);
router.put("/:id", protect, adminOnly, updateContact);
router.delete("/:id", protect, adminOnly, deleteContact);

export default router;
