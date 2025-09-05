import express from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  createConversation,
} from "../controllers/conversationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getConversations);
router.get("/:conversationId/messages", protect, getMessages);
router.post("/", protect, createConversation);
router.post("/:conversationId/messages", protect, sendMessage);
router.put("/:conversationId/messages/:messageId", protect, updateMessage);
router.delete("/:conversationId/messages/:messageId", protect, deleteMessage);

export default router;
