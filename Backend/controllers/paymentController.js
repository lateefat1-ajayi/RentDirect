import axios from "axios";
import Payment from "../models/Payment.js";
import Lease from "../models/Lease.js";
import Revenue from "../models/Revenue.js";

export const initiatePayment = async (req, res) => {
  try {
    const { amount, tenantId, landlordId, leaseId, propertyId, email } = req.body;

    const paystackAmount = amount * 100; // Paystack wants kobo

    const response = await axios.post("https://api.paystack.co/transaction/initialize", {
      amount: paystackAmount,
      email,
      metadata: { tenantId, landlordId, leaseId, propertyId }
    }, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const payment = await Payment.create({
      reference: response.data.data.reference,
      amount: paystackAmount,
      tenant: tenantId,
      landlord: landlordId,
      lease: leaseId,
      property: propertyId
    });

    res.json({ authorizationUrl: response.data.data.authorization_url, payment });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Payment initiation failed" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    const payment = await Payment.findOne({ reference });
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    if (response.data.data.status === "success") {
      payment.status = "success";
      await payment.save();

      // ✅ Update Lease
      await Lease.findByIdAndUpdate(payment.lease, { status: "rented" });

      // ✅ Calculate revenue (5% platform fee)
      const platformFee = Math.round(payment.amount * 0.05);
      const landlordEarning = payment.amount - platformFee;

      await Revenue.create({
        payment: payment._id,
        landlord: payment.landlord,
        platformFee,
        landlordEarning,
      });
    } else {
      payment.status = "failed";
      await payment.save();
    }

    res.json({ payment });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Payment verification failed" });
  }
};


export const getTenantPayments = async (req, res) => {
  try {
    const tenantId = req.user._id; 

    const payments = await Payment.find({ tenant: tenantId })
      .populate("property", "title price")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const refundPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/refund",
      { transaction: reference },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: err.response?.data || err.message });
  }
};
