import Application from "../models/Application.js";
import Property from "../models/Property.js";

// Tenant applies for a property
export const applyForProperty = async (req, res) => {
  try {
    const { propertyId, moveInDate, employmentStatus, income, message } = req.body;

    if (req.user.role !== "tenant") {
      return res.status(403).json({ message: "Only tenants can apply for properties" });
    }

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });

    const application = await Application.create({
      tenant: req.user._id,
      property: propertyId,
      moveInDate,
      employmentStatus,
      income,
      message,
    });

    res.status(201).json(application);
  } catch (error) {
    console.error("Apply error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Landlord sees all applications for their properties
export const getLandlordApplications = async (req, res) => {
  try {
    if (req.user.role !== "landlord") {
      return res.status(403).json({ message: "Only landlords can view applications" });
    }

    const applications = await Application.find()
      .populate("tenant", "name email")
      .populate("property", "title location landlord");

    // filter only landlord’s properties
    const landlordApps = applications.filter(app => 
      app.property.landlord.toString() === req.user._id.toString()
    );

    res.json(landlordApps);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Tenant sees their applications
export const getTenantApplications = async (req, res) => {
  try {
    if (req.user.role !== "tenant") {
      return res.status(403).json({ message: "Only tenants can view their applications" });
    }

    const applications = await Application.find({ tenant: req.user._id })
      .populate("property", "title location price");

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Landlord approves/rejects an application
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body; // approved | rejected

    const application = await Application.findById(applicationId).populate("property");
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (application.property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
