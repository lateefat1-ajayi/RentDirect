import Application from "../models/Application.js";
import Property from "../models/Property.js";
import Lease from "../models/Lease.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

export const applyForProperty = async (req, res) => {
  try {
    const { propertyId, moveInDate, message, applicant, employment, rentalHistory, occupants, reference, consent, leaseDuration } = req.body;

    console.log("Application attempt - User ID:", req.user._id);
    console.log("Application attempt - User Role:", req.user.role);
    console.log("Application attempt - User Email:", req.user.email);

    if (req.user.role !== "tenant") {
      console.log("Role mismatch - Expected: tenant, Got:", req.user.role);
      console.log("Full user object:", req.user);
      return res.status(403).json({ 
        message: "Only tenants can apply for properties",
        userRole: req.user.role,
        userId: req.user._id 
      });
    }

    const property = await Property.findById(propertyId).populate("landlord", "name email");
    if (!property) return res.status(404).json({ message: "Property not found" });
    
    console.log("Property found:", {
      propertyId: property._id,
      propertyTitle: property.title,
      landlord: property.landlord,
      landlordId: property.landlord._id,
      landlordType: typeof property.landlord._id
    });

    // Check if tenant has already applied for this property
    const existingApplication = await Application.findOne({
      tenant: req.user._id,
      property: propertyId
    });

    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this property" });
    }

    // Check if property is already rented
    if (property.status === "rented") {
      return res.status(400).json({ message: "This property is already rented" });
    }

    const application = await Application.create({
      tenant: req.user._id,
      property: propertyId,
      moveInDate,
      message,
      leaseDuration: leaseDuration || 1, // Default to 1 year if not provided
      applicant,
      employment,
      rentalHistory,
      occupants,
      reference,
      consent,
    });

    console.log("Application created successfully:", {
      applicationId: application._id,
      tenant: application.tenant,
      property: application.property,
      status: application.status,
      createdAt: application.createdAt
    });

    // Create notification for the landlord
    console.log("Creating notification for landlord:", {
      recipient: property.landlord._id,
      landlordType: typeof property.landlord._id,
      propertyLandlord: property.landlord,
      propertyId: property._id,
      tenantName: req.user.name
    });

    await createNotification(
      property.landlord._id,
      "application",
      "New Property Application",
      `${req.user.name} has applied for your property: ${property.title}`,
      `/landlord/applicants`,
      {},
      req
    );

    console.log("Notification created successfully for landlord");

    res.status(201).json(application);
  } catch (error) {
    console.error("Apply error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLandlordApplications = async (req, res) => {
  try {
    console.log("getLandlordApplications called by user:", {
      userId: req.user._id,
      userRole: req.user.role,
      userEmail: req.user.email
    });

    if (req.user.role !== "landlord") {
      console.log("Role check failed - user is not landlord");
      return res.status(403).json({ message: "Only landlords can view applications" });
    }

    console.log("Fetching all applications...");
    const applications = await Application.find()
      .populate("tenant", "name email")
      .populate({
        path: "property",
        select: "title location price landlord",
        populate: {
          path: "landlord",
          select: "name email _id"
        }
      })
      .populate("lease");

    console.log("All applications found:", applications.length);
    console.log("Sample application:", applications[0]);

    const landlordApps = applications.filter(app => {
      // Skip applications with missing or corrupted data
      if (!app.property || !app.property.landlord) {
        console.log("Skipping application with missing property/landlord data:", app._id);
        return false;
      }
      
      // Ensure both are ObjectIds for comparison
      const propertyLandlordId = app.property.landlord._id || app.property.landlord;
      const currentUserId = req.user._id;
      
      if (!propertyLandlordId) {
        console.log("Skipping application with missing landlord ID:", app._id);
        return false;
      }
      
      const isOwner = propertyLandlordId.toString() === currentUserId.toString();
      
      console.log("Application ownership check:", {
        appId: app._id,
        propertyLandlordId: propertyLandlordId.toString(),
        propertyLandlordType: typeof propertyLandlordId,
        currentUserId: currentUserId.toString(),
        currentUserType: typeof currentUserId,
        isOwner: isOwner,
        comparison: `${propertyLandlordId.toString()} === ${currentUserId.toString()}`
      });
      
      return isOwner;
    });

    console.log("Filtered landlord applications:", landlordApps.length);
    console.log("Final applications to return:", landlordApps);

    res.json(landlordApps);
  } catch (error) {
    console.error("Error in getLandlordApplications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTenantApplications = async (req, res) => {
  try {
    // If userId is provided in params, use it (for viewing other users' applications)
    // Otherwise, use the authenticated user's ID (for viewing own applications)
    const targetUserId = req.params.userId || req.user._id;
    
    // If viewing someone else's applications, check permissions
    if (targetUserId !== req.user._id) {
      // Only landlords and admins can view other users' applications
      if (req.user.role !== "landlord" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to view this user's applications" });
      }
    }

    const applications = await Application.find({ tenant: targetUserId })
      .populate("property", "title location price")
      .populate("lease"); 
    res.json(applications);
  } catch (error) {
    console.error("Error fetching tenant applications:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body; 

    const application = await Application.findById(applicationId).populate("property tenant");
    if (!application) return res.status(404).json({ message: "Application not found" });

    const property = application.property;

    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (status === "approved") {
      // Check if property is already rented
      if (property.status === "rented") {
        return res.status(400).json({ message: "Property is already rented" });
      }

      // Check if there's already an approved application for this property
      const existingApprovedApplication = await Application.findOne({
        property: property._id,
        status: "approved"
      });

      if (existingApprovedApplication && existingApprovedApplication._id.toString() !== applicationId) {
        return res.status(400).json({ message: "Another application has already been approved for this property" });
      }
    }

    application.status = status;
    await application.save();

    // Create notifications based on status
    if (status === "rejected") {
      // Notify tenant when application is rejected
      await createNotification(
        application.tenant._id,
        "application",
        "Application Update",
        `Your application for ${property.title} has been ${status}.`,
        `/user/applications`,
        {},
        req
      );
    }

    if (status === "approved") {
      // Calculate total rent amount based on lease duration
      const leaseDuration = application.leaseDuration || 1; // Default to 1 year
      const totalRentAmount = property.price * leaseDuration;
      
      // Calculate end date based on lease duration
      const startDate = new Date(application.moveInDate);
      const endDate = new Date(startDate);
      endDate.setFullYear(startDate.getFullYear() + leaseDuration);
      
      const lease = await Lease.create({
        tenant: application.tenant._id,
        landlord: req.user._id,
        property: property._id,
        startDate: application.moveInDate,
        endDate: endDate,
        rentAmount: totalRentAmount, // Total amount for the entire lease period
        status: "pending" // Start as pending until payment is made
      });

      application.lease = lease._id;
      await application.save();

      // Keep property as "available" until payment is made
      // Property status will change to "rented" only after successful payment

      // Reject all other pending applications for this property
      await Application.updateMany(
        { 
          property: property._id, 
          _id: { $ne: application._id },
          status: "pending"
        },
        { status: "rejected" }
      );

      // Create notification for the tenant
      await createNotification(
        application.tenant._id,
        "application",
        "Application Approved! 🎉",
        `Congratulations! Your application for ${property.title} has been approved. You can now proceed with payment.`,
        `/user/applications`,
        {},
        req
      );

      // Create notification for admin when application is approved
      const adminUser = await User.findOne({ role: "admin" });
      if (adminUser) {
        await createNotification(
          adminUser._id,
          "application",
          "New Lease Created",
          `Landlord ${req.user.name} has approved a tenant application for ${property.title}. A new lease has been created.`,
          `/admin/applications`,
          {},
          req
        );
      }
    }

    res.json(application);
  } catch (error) {
    console.error("Update Application Status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
