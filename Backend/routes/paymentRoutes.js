import express from "express";
import { initiatePayment, verifyPayment } from "../controllers/paymentController.js";
import { refundPayment } from "../controllers/paymentController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { getTenantPayments } from "../controllers/paymentController.js";
const router = express.Router();

router.post("/initiate", initiatePayment);
router.get("/verify/:reference", verifyPayment);
router.get("/history", protect, getTenantPayments);
router.post("/refund", protect, adminOnly, refundPayment);

export default router;
