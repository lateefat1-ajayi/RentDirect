import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createLease, getLeases, updateLease } from "../controllers/leaseController.js";

const router = express.Router();

router.post("/", protect, createLease);
router.get("/", protect, getLeases); 
router.put("/:leaseId", protect, updateLease); 

export default router;
