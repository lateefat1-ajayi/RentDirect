import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { createReport, getMyReports, adminListReports, adminUpdateReport } from "../controllers/reportController.js";

const router = express.Router();

// Authenticated user actions
router.post("/", protect, createReport);
router.get("/mine", protect, getMyReports);

// Admin actions
router.get("/admin", protect, adminOnly, adminListReports);
router.put("/:id", protect, adminOnly, adminUpdateReport);

export default router;


