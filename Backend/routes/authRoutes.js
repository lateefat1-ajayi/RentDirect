import express from "express";
import { registerUser, loginUser, forgotPassword, resetPassword, verifyCode, resendVerificationCode } from "../controllers/authController.js";
import rateLimit from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-code", verifyCode);
router.post("/resend-verification-code", rateLimit({ windowMs: 60_000, max: 3 }), resendVerificationCode);
router.post("/forgot-password", rateLimit({ windowMs: 60_000, max: 3 }), forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
