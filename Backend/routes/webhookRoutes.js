import express from "express";
import { paystackWebhook } from "../controllers/webhookController.js";

const router = express.Router();

router.post(
  "/paystack",
  express.json({ verify: (req, res, buf) => { req.rawBody = buf } }),
  paystackWebhook
);

export default router;
