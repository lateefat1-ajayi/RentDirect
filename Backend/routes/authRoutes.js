import express from "express";
import { registerUser, loginUser, confirmEmail, resendConfirmation, forgotPassword, resetPassword } from "../controllers/authController.js";
import rateLimit from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/confirm-email/:token", confirmEmail); 
router.post("/resend-confirmation", rateLimit({ windowMs: 60_000, max: 3 }), resendConfirmation);
router.post("/forgot-password", rateLimit({ windowMs: 60_000, max: 3 }), forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
