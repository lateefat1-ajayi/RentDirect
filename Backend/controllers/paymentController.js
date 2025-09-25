import Payment from "../models/Payment.js";
import Lease from "../models/Lease.js";
import Revenue from "../models/Revenue.js";
import Notification from "../models/Notification.js";
import paystack from "../config/paystack.js";
import { createNotification } from "./notificationController.js";
import PDFDocument from "pdfkit";

export const initiatePayment = async (req, res) => {
  try {
    const { amount, tenantId, landlordId, leaseId, propertyId, email } = req.body;

    // Check if there's already a successful payment for this lease
    const existingPayment = await Payment.findOne({ 
      lease: leaseId, 
      status: "success" 
    });

    if (existingPayment) {
      return res.status(400).json({ 
        error: "Payment already completed for this lease",
        message: "This lease has already been paid for. You cannot make another payment."
      });
    }

    // Check if there's a pending payment for this lease
    const pendingPayment = await Payment.findOne({ 
      lease: leaseId, 
      status: "pending" 
    });

    if (pendingPayment) {
      return res.status(400).json({ 
        error: "Payment already initiated",
        message: "A payment is already in progress for this lease. Please wait for it to complete or contact support if it's been more than 24 hours."
      });
    }

    const paystackAmount = amount * 100; // Paystack uses kobo

    const response = await paystack.post("/transaction/initialize", {
      amount: paystackAmount,
      email,
      metadata: { tenantId, landlordId, leaseId, propertyId },
    });

    const payment = await Payment.create({
      reference: response.data.data.reference,
      amount: paystackAmount,
      tenant: tenantId,
      landlord: landlordId,
      lease: leaseId,
      property: propertyId,
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

    // First verify with Paystack
    const response = await paystack.get(`/transaction/verify/${reference}`);
    
    if (response.data.data.status !== "success") {
      return res.status(400).json({ error: "Payment not successful" });
    }

    // Check if payment already exists
    let payment = await Payment.findOne({ reference });
    
    if (!payment) {
      // Payment doesn't exist, create it from the reference
      // Extract lease ID from reference (format: RENT_LEASEID_TIMESTAMP)
      const referenceParts = reference.split('_');
      if (referenceParts.length < 3) {
        return res.status(400).json({ error: "Invalid reference format" });
      }
      
      const leaseId = referenceParts[1];
      const lease = await Lease.findById(leaseId).populate('property tenant landlord');
      
      if (!lease) {
        return res.status(404).json({ error: "Lease not found" });
      }

      // Create new payment record
      payment = new Payment({
        reference: reference,
        amount: response.data.data.amount, // Amount in kobo
        tenant: lease.tenant._id,
        landlord: lease.landlord._id,
        lease: lease._id,
        property: lease.property._id,
        status: "success",
        paymentMethod: "card",
        transactionId: response.data.data.id
      });
      
      await payment.save();
      console.log("Created new payment record:", payment._id);
    } else {
      // Payment exists, update status
      payment.status = "success";
      await payment.save();
    }

    // Update Lease status
    await Lease.findByIdAndUpdate(payment.lease, { status: "active" });

    // Update Property status to "rented" when payment is successful
    const leaseForProperty = await Lease.findById(payment.lease).populate('property');
    if (leaseForProperty && leaseForProperty.property) {
      leaseForProperty.property.status = "rented";
      await leaseForProperty.property.save();
    }

    // Calculate revenue (5% platform fee)
    const platformFee = Math.round(payment.amount * 0.05);
    const landlordEarning = payment.amount - platformFee;

    // Check if revenue record already exists
    const existingRevenue = await Revenue.findOne({ payment: payment._id });
    if (!existingRevenue) {
      await Revenue.create({
        payment: payment._id,
        landlord: payment.landlord,
        platformFee,
        landlordEarning,
      });
    }

    // Create notifications for tenant and landlord (only if payment was just created)
    const lease = await Lease.findById(payment.lease).populate('property', 'title');
    
    // Check if notifications already exist for this payment to prevent duplicates
    const existingNotifications = await Notification.find({
      type: "payment",
      "metadata.paymentId": payment._id
    });

    if (existingNotifications.length === 0) {
      // Notify tenant
      await createNotification(
        payment.tenant,
        "payment",
        "Payment Successful",
        `Your rent payment of ₦${(payment.amount / 100).toLocaleString()} for ${lease.property.title} has been processed successfully.`,
        `/user/payments/${payment.lease}`,
        { paymentId: payment._id },
        req
      );

      // Notify landlord
      await createNotification(
        payment.landlord,
        "payment",
        "Rent Payment Received",
        `You have received a rent payment of ₦${(payment.amount / 100).toLocaleString()} for ${lease.property.title}.`,
        `/landlord/transactions`,
        { paymentId: payment._id },
        req
      );

      // Notify admin of successful payment
      await createNotification(
        "admin",
        "payment",
        "New Rent Payment",
        `A rent payment of ₦${(payment.amount / 100).toLocaleString()} has been processed for ${lease.property.title}.`,
        `/admin/payments`,
        { paymentId: payment._id },
        req
      );
    } else {
      console.log(`Notifications already exist for payment ${payment._id}, skipping duplicate creation`);
    }

    res.json({ payment });
  } catch (err) {
    console.error("Payment verification error:", err.response?.data || err.message);
    res.status(500).json({ error: "Payment verification failed" });
  }
};

export const getTenantPayments = async (req, res) => {
  try {
    const tenantId = req.user._id;

    const payments = await Payment.find({ tenant: tenantId })
      .populate("property", "title price")
      .sort({ createdAt: -1 });

    // Convert amounts from kobo to naira for display
    const paymentsWithFormattedAmounts = payments.map(payment => ({
      ...payment.toObject(),
      amountInNaira: payment.amount / 100,
      formattedAmount: `₦${(payment.amount / 100).toLocaleString()}`
    }));

    res.json(paymentsWithFormattedAmounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLeasePayments = async (req, res) => {
  try {
    const { leaseId } = req.params;

    const payments = await Payment.find({ lease: leaseId })
      .populate("property", "title price")
      .sort({ createdAt: -1 });

    // Convert amounts from kobo to naira for display
    const paymentsWithFormattedAmounts = payments.map(payment => ({
      ...payment.toObject(),
      amountInNaira: payment.amount / 100,
      formattedAmount: `₦${(payment.amount / 100).toLocaleString()}`
    }));

    res.json(paymentsWithFormattedAmounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLandlordPayments = async (req, res) => {
  try {
    const landlordId = req.user._id;

    const payments = await Payment.find({ landlord: landlordId })
      .populate("property", "title price")
      .populate("tenant", "name email")
      .sort({ createdAt: -1 });

    // Convert amounts from kobo to naira for display
    const paymentsWithFormattedAmounts = payments.map(payment => ({
      ...payment.toObject(),
      amountInNaira: payment.amount / 100,
      formattedAmount: `₦${(payment.amount / 100).toLocaleString()}`
    }));

    res.json(paymentsWithFormattedAmounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    const response = await paystack.post("/refund", { transaction: reference });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: err.response?.data || err.message });
  }
};

// Generate a payment receipt PDF for a successful payment
export const getPaymentReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId)
      .populate("tenant", "name email")
      .populate("landlord", "name email")
      .populate("property", "title location");

    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.status !== "success") return res.status(400).json({ message: "Receipt available only for successful payments" });

    // Authorization: tenant, landlord, or admin
    const isTenant = req.user._id.toString() === payment.tenant._id.toString();
    const isLandlord = req.user._id.toString() === payment.landlord._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!(isTenant || isLandlord || isAdmin)) {
      return res.status(403).json({ message: "Not permitted" });
    }

    const amountNaira = (payment.amount || 0) / 100;

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=receipt-${payment.reference}.pdf`);
    doc.pipe(res);

    // Header / branding
    doc.fontSize(20).text("RentDirect", { align: "center" });
    doc.fontSize(18).text("Payment Receipt", { align: "center" });
    doc.moveDown();

    // Core details
    doc.fontSize(12).text(`Reference: ${payment.reference}`);
    doc.text(`Date: ${new Date(payment.createdAt).toLocaleString()}`);
    doc.text(`Amount: ₦${amountNaira.toLocaleString()}`);
    doc.text(`Method: ${payment.paymentMethod || "Paystack"}`);
    doc.text(`Status: PAID`);
    doc.moveDown();

    // Parties and property
    doc.text(`Tenant:`);
    doc.text(`Name: ${payment.tenant?.name || "N/A"}`);
    doc.text(`Email: ${payment.tenant?.email || "N/A"}`);
    doc.moveDown(0.5);
    doc.text(`Landlord:`);
    doc.text(`Name: ${payment.landlord?.name || "N/A"}`);
    doc.text(`Email: ${payment.landlord?.email || "N/A"}`);
    doc.moveDown(0.5);
    doc.text(`Property: ${payment.property?.title || "N/A"}`);
    doc.text(`Location: ${payment.property?.location || "N/A"}`);
    doc.moveDown();

    // Additional details
    doc.text(`Transaction ID: ${payment._id}`);
    doc.text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // Footer
    doc.fontSize(10).text("Thank you for using RentDirect!", { align: "center" });
    doc.moveDown();

    // Paid watermark
    doc.fillColor('#0a7').fontSize(24).text('PAID', { align: 'center', opacity: 0.3 });
    doc.fillColor('black').fontSize(12);

    doc.end();
  } catch (err) {
    console.error("Receipt PDF error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
