import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createLease, getLeases, updateLease, getLeaseById, checkExpiredLeases } from "../controllers/leaseController.js";

const router = express.Router();

router.post("/", protect, createLease);
router.get("/", protect, getLeases); 
router.get("/:leaseId", protect, getLeaseById); 
router.put("/:leaseId/status", protect, updateLease);
router.post("/check-expired", protect, checkExpiredLeases);

export default router;
