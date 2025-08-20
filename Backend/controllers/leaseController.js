import Lease from "../models/Lease.js";
import Property from "../models/Property.js";

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
      leases = await Lease.find({ tenant: req.user._id }).populate("property landlord");
    } else if (req.user.role === "landlord") {
      leases = await Lease.find({ landlord: req.user._id }).populate("property tenant");
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

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
