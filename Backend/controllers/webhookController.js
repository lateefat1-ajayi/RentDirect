import crypto from "crypto";
import Payment from "../models/Payment.js";
import Lease from "../models/Lease.js";
import Revenue from "../models/Revenue.js";

// Handle Paystack Webhook
export const paystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // Verify Paystack signature
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = req.body.event;

    if (event === "charge.success") {
      const data = req.body.data;

      const payment = await Payment.findOne({ reference: data.reference });
      if (!payment) return res.status(404).json({ error: "Payment not found" });

      if (data.status === "success") {
        payment.status = "success";
        await payment.save();

        // ✅ Update Lease
        await Lease.findByIdAndUpdate(payment.lease, { status: "rented" });

        // ✅ Calculate revenue (5% fee)
        const platformFee = Math.round(payment.amount * 0.05);
        const landlordEarning = payment.amount - platformFee;

        await Revenue.create({
          payment: payment._id,
          landlord: payment.landlord,
          platformFee,
          landlordEarning,
        });
      }
    }

    res.sendStatus(200); // Always respond 200 so Paystack stops retrying
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};
