import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  applyForProperty,
  getLandlordApplications,
  getTenantApplications,
  updateApplicationStatus
} from "../controllers/applicationController.js";

const router = express.Router();

router.post("/", protect, applyForProperty);

router.get("/tenant", protect, getTenantApplications);

router.get("/landlord", protect, getLandlordApplications);

router.get("/tenant/:userId", protect, getTenantApplications);

router.put("/:applicationId", protect, updateApplicationStatus);

export default router;
