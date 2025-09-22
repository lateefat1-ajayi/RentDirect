import Lease from "../models/Lease.js";
import Property from "../models/Property.js";
import Payment from "../models/Payment.js";
import { uploadToCloudinary } from "../middlewares/uploadMiddleware.js";
import PDFDocument from "pdfkit";
import stream from "stream";
import axios from "axios";

export const createLease = async (req, res) => {
  try {
    const { tenantId, propertyId, startDate, endDate, rentAmount } = req.body;

    // Ensure property exists
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });

    // Ensure user is landlord
    if (req.user.role !== "landlord") {
      return res.status(403).json({ message: "Only landlords can create leases" });
    }

    const lease = new Lease({
      tenant: tenantId,
      landlord: req.user._id,
      property: propertyId,
      startDate,
      endDate,
      rentAmount,
      status: "active",
    });

    await lease.save();
    res.status(201).json(lease);
  } catch (error) {
    console.error("Create Lease error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getLeases = async (req, res) => {
  try {
    let leases;

    if (req.user.role === "tenant") {
      leases = await Lease.find({ tenant: req.user._id })
        .populate("property", "title location price")
        .populate("landlord", "name email");
    } else if (req.user.role === "landlord") {
      leases = await Lease.find({ landlord: req.user._id })
        .populate("property", "title location price")
        .populate("tenant", "name email");
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

    console.log(`Found ${leases.length} leases for ${req.user.role} ${req.user._id}`);
    console.log("Sample lease:", leases[0]);

    res.json(leases);
  } catch (error) {
    console.error("Get Leases error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateLease = async (req, res) => {
  try {
    const { leaseId } = req.params;
    const { status } = req.body;

    const lease = await Lease.findById(leaseId);
    if (!lease) return res.status(404).json({ message: "Lease not found" });

    // Only landlord can update
    if (req.user._id.toString() !== lease.landlord.toString()) {
      return res.status(403).json({ message: "Only landlord can update lease" });
    }

    lease.status = status || lease.status;
    await lease.save();

    res.json(lease);
  } catch (error) {
    console.error("Update Lease error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getLeaseById = async (req, res) => {
  try {
    const { leaseId } = req.params;

    const lease = await Lease.findById(leaseId)
      .populate("tenant", "name email")
      .populate("landlord", "name email")
      .populate("property", "title location price");

    if (!lease) return res.status(404).json({ message: "Lease not found" });

    // Fetch payments for this lease
    const payments = await Payment.find({ lease: leaseId }).sort({ createdAt: -1 });

    res.json({ ...lease.toObject(), payments });
  } catch (error) {
    console.error("Get lease error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload or save a signature (tenant or landlord) for a lease
export const uploadLeaseSignature = async (req, res) => {
  try {
    const { leaseId } = req.params;
    const { role, signature } = req.body;

    if (!role || !["tenant", "landlord"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'tenant' or 'landlord'" });
    }

    const lease = await Lease.findById(leaseId);
    if (!lease) return res.status(404).json({ message: "Lease not found" });

    // Authorization: only the tenant or landlord on the lease can sign
    const isTenant = req.user._id.toString() === lease.tenant.toString();
    const isLandlord = req.user._id.toString() === lease.landlord.toString();
    if (!(isTenant || isLandlord)) {
      return res.status(403).json({ message: "Not permitted to sign this lease" });
    }

    // Ensure correct party signs under correct role
    if ((role === "tenant" && !isTenant) || (role === "landlord" && !isLandlord)) {
      return res.status(403).json({ message: "Role does not match your relationship to this lease" });
    }

    let signatureUrl = "";

    // Accept either data URL or multipart file (via multer)
    if (signature && typeof signature === "string" && signature.startsWith("data:")) {
      // Convert base64 data URL into Buffer
      const base64 = signature.split(",")[1];
      const buffer = Buffer.from(base64, "base64");
      const result = await uploadToCloudinary(buffer, `${leaseId}-${role}-signature.png`, { resource_type: "image", format: "png" });
      signatureUrl = result.secure_url;
    } else if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname || `${leaseId}-${role}-signature.png`, { resource_type: "image" });
      signatureUrl = result.secure_url;
    } else {
      return res.status(400).json({ message: "No signature provided" });
    }

    if (role === "tenant") {
      lease.tenantSignatureUrl = signatureUrl;
    } else {
      lease.landlordSignatureUrl = signatureUrl;
    }

    // If both signatures present, set signedAt
    if (lease.tenantSignatureUrl && lease.landlordSignatureUrl && !lease.signedAt) {
      lease.signedAt = new Date();
    }

    await lease.save();

    res.json({
      message: "Signature saved",
      leaseId: lease._id,
      tenantSignatureUrl: lease.tenantSignatureUrl,
      landlordSignatureUrl: lease.landlordSignatureUrl,
      signedAt: lease.signedAt,
    });
  } catch (error) {
    console.error("Upload lease signature error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Generate or fetch lease PDF (includes signatures if present)
export const getLeasePdf = async (req, res) => {
  try {
    const { leaseId } = req.params;
    const lease = await Lease.findById(leaseId)
      .populate("tenant", "name email")
      .populate("landlord", "name email")
      .populate("property", "title location price");

    if (!lease) return res.status(404).json({ message: "Lease not found" });

    // Authorization: tenant, landlord, or admin
    const isTenant = req.user._id.toString() === lease.tenant._id.toString();
    const isLandlord = req.user._id.toString() === lease.landlord._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!(isTenant || isLandlord || isAdmin)) {
      return res.status(403).json({ message: "Not permitted" });
    }

    // If a finalized document exists, stream it (avoid redirect losing auth header)
    if (lease.leaseDocumentUrl) {
      // Fallback to redirect if needed, but try streaming via fetch first (optional enhancement)
    }

    // Require both signatures before allowing download
    if (!(lease.tenantSignatureUrl && lease.landlordSignatureUrl)) {
      return res.status(400).json({ message: "Lease must be signed by both parties before download" });
    }

    // Create PDF with professional margins (1 inch)
    const doc = new PDFDocument({ size: "A4", margins: { top: 72, bottom: 72, left: 72, right: 72 } });

    // Stream PDF directly to response and also capture for optional upload
    const pass = new stream.PassThrough();
    const chunks = [];
    pass.on("data", (c) => chunks.push(c));
    pass.on("end", async () => {
      // If both signatures exist and no stored PDF, upload and persist URL
      if (lease.tenantSignatureUrl && lease.landlordSignatureUrl && !lease.leaseDocumentUrl) {
        const buffer = Buffer.concat(chunks);
        try {
          const uploaded = await uploadToCloudinary(buffer, `${leaseId}-lease.pdf`);
          lease.leaseDocumentUrl = uploaded.secure_url;
          if (!lease.signedAt) lease.signedAt = new Date();
          await lease.save();
        } catch (e) {
          // Non-fatal: continue serving download
          console.error("Lease PDF upload failed:", e.message);
        }
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=lease-${leaseId}.pdf`);
    doc.pipe(pass);
    pass.pipe(res);

    // Header with logo & title
    try {
      if (process.env.APP_LOGO_URL) {
        const logoRes = await axios.get(process.env.APP_LOGO_URL, { responseType: "arraybuffer" });
        const logoBuf = Buffer.from(logoRes.data);
        await doc.image(logoBuf, 72, 36, { width: 80 });
      }
    } catch {}
    doc.fontSize(18).text("Residential Lease Agreement", { align: "center" });
    doc.moveDown();

    // Parties (separated fields)
    doc.fontSize(12);
    doc.text("Landlord");
    doc.text(`Name: ${lease.landlord.name || ""}`);
    doc.text(`Email: ${lease.landlord.email || ""}`);
    if (lease.landlord.phone) doc.text(`Phone: ${lease.landlord.phone}`);
    doc.moveDown(0.5);
    doc.text("Tenant");
    doc.text(`Name: ${lease.tenant.name || ""}`);
    doc.text(`Email: ${lease.tenant.email || ""}`);
    if (lease.tenant.phone) doc.text(`Phone: ${lease.tenant.phone}`);
    doc.moveDown();

    // Property and terms
    const sectionWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    doc.text(`Property: ${lease.property?.title || ""}`, { width: sectionWidth });
    doc.text(`Location: ${lease.property?.location || ""}`, { width: sectionWidth });
    doc.text(`Rent Amount: ₦${Number(lease.rentAmount || 0).toLocaleString()}`, { width: sectionWidth });
    doc.text(`Start Date: ${new Date(lease.startDate).toDateString()}`, { width: sectionWidth });
    doc.text(`End Date: ${new Date(lease.endDate).toDateString()}`, { width: sectionWidth });
    doc.moveDown();

    // Terms & Conditions — placeholder until you provide your official terms
    const appName = process.env.APP_NAME || "RentDirect";
    doc.text(`${appName} Lease Terms & Conditions:`);
    doc.list([
      "Rent is due as per the agreed schedule in this agreement.",
      "The premises must be used lawfully and maintained in good order.",
      "Damage beyond normal wear is the responsibility of the tenant.",
    ], { bulletRadius: 2 });
    doc.moveDown();

    // Signatures side by side
    const startY = doc.y;
    const leftX = doc.page.margins.left;
    const rightX = doc.page.width - doc.page.margins.right - 180;
    doc.text("Tenant Signature:", leftX, startY);
    if (lease.tenantSignatureUrl) {
      try {
        const tRes = await axios.get(lease.tenantSignatureUrl, { responseType: "arraybuffer" });
        const tBuf = Buffer.from(tRes.data);
        await doc.image(tBuf, leftX, startY + 15, { width: 150 });
      } catch {}
    } else {
      doc.text("Pending", leftX, startY + 15);
    }
    doc.text("Landlord Signature:", rightX, startY);
    if (lease.landlordSignatureUrl) {
      try {
        const lRes = await axios.get(lease.landlordSignatureUrl, { responseType: "arraybuffer" });
        const lBuf = Buffer.from(lRes.data);
        await doc.image(lBuf, rightX, startY + 15, { width: 150 });
      } catch {}
    } else {
      doc.text("Pending", rightX, startY + 15);
    }
    doc.moveDown(8);
    if (lease.signedAt) {
      doc.text(`Signed At: ${new Date(lease.signedAt).toLocaleString()}`);
    }

    doc.end();
  } catch (error) {
    console.error("Lease PDF error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Check and update expired leases
export const checkExpiredLeases = async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Find all active leases that have expired
    const expiredLeases = await Lease.find({
      status: "active",
      endDate: { $lt: currentDate }
    }).populate("property");

    console.log(`Found ${expiredLeases.length} expired leases`);

    // Update expired leases and their properties
    for (const lease of expiredLeases) {
      // Update lease status to expired
      lease.status = "expired";
      await lease.save();

      // Update property status to available
      if (lease.property) {
        lease.property.status = "available";
        await lease.property.save();
        console.log(`Updated property ${lease.property.title} status to available`);
      }
    }

    res.json({
      message: `Updated ${expiredLeases.length} expired leases`,
      expiredCount: expiredLeases.length
    });
  } catch (error) {
    console.error("Check expired leases error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
