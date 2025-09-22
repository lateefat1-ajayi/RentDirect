import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createLease, getLeases, updateLease, getLeaseById, checkExpiredLeases, uploadLeaseSignature, getLeasePdf } from "../controllers/leaseController.js";

const router = express.Router();

router.post("/", protect, createLease);
router.get("/", protect, getLeases); 
router.get("/:leaseId", protect, getLeaseById); 
router.put("/:leaseId/status", protect, updateLease);
router.post("/check-expired", protect, checkExpiredLeases);
// Signatures: accept dataURL in JSON or multipart file upload
router.post("/:leaseId/signature", protect, uploadLeaseSignature);
// Lease PDF download
router.get("/:leaseId/pdf", protect, getLeasePdf);

export default router;
