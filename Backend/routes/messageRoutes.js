import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  sendMessage,
  getMessagesByProperty,
  getLandlordMessages,
  getTenantMessages,
  deleteMessage
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/", protect, sendMessage);

router.get("/property/:propertyId", protect, getMessagesByProperty);

router.get("/landlord", protect, getLandlordMessages);

router.get("/tenant", protect, getTenantMessages);

router.delete("/:id", protect, deleteMessage);

export default router;


