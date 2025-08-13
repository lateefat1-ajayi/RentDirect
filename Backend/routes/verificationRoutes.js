import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import {
  uploadVerificationDocument,
  approveVerification,
  rejectVerification
} from "../controllers/verificationController.js";

const router = express.Router();

router.post("/", protect, upload.single("document"), uploadVerificationDocument);
router.patch("/approve/:userId", protect, isAdmin, approveVerification);
router.patch("/reject/:userId", protect, isAdmin, rejectVerification);

export default router;
