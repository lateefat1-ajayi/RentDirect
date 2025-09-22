import express from "express";
import { initiatePayment, verifyPayment, getTenantPayments, getLeasePayments, getLandlordPayments, getPaymentReceipt } from "../controllers/paymentController.js";
import { refundPayment } from "../controllers/paymentController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/initiate", protect, initiatePayment);
router.get("/verify/:reference", verifyPayment);
router.get("/history", protect, getTenantPayments);
router.get("/lease/:leaseId", protect, getLeasePayments);
router.get("/landlord", protect, getLandlordPayments);
router.post("/refund", protect, adminOnly, refundPayment);
// Payment receipt PDF download
router.get("/:paymentId/receipt", protect, getPaymentReceipt);

export default router;
