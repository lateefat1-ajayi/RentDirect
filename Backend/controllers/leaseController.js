import Lease from "../models/Lease.js";
import Property from "../models/Property.js";
import Payment from "../models/Payment.js";

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
