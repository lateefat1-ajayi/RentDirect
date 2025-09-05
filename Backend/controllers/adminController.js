import User from "../models/User.js";
import Property from "../models/Property.js";
import Application from "../models/Application.js";
import Lease from "../models/Lease.js";
import Payment from "../models/Payment.js";
import { createNotification } from "./notificationController.js";

// Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProperties,
      totalApplications,
      activeLeases,
      pendingVerifications,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Application.countDocuments(),
      Lease.countDocuments({ status: "active" }),
      User.countDocuments({ role: "landlord", verificationStatus: "pending" }),
      Payment.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    res.json({
      totalUsers,
      totalProperties,
      totalApplications,
      activeLeases,
      pendingVerifications,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
};

// Dashboard Activities
const getDashboardActivities = async (req, res) => {
  try {
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role createdAt");

    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("landlord", "name")
      .select("title price status createdAt");

    const recentApplications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("tenant", "name")
      .populate("property", "title")
      .select("status createdAt");

    const activities = [
      ...recentUsers.map(user => ({
        type: "registration",
        description: `New ${user.role} registered: ${user.name}`,
        user: user.name,
        timestamp: user.createdAt
      })),
      ...recentProperties.map(property => ({
        type: "property",
        description: `New property listed: ${property.title}`,
        user: property.landlord.name,
        timestamp: property.createdAt,
        requiresAction: property.status === "pending",
        action: "approveProperty",
        actionText: "Approve",
        id: property._id
      })),
      ...recentApplications.map(app => ({
        type: "application",
        description: `New application for ${app.property.title}`,
        user: app.tenant.name,
        timestamp: app.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
     .slice(0, 10);

    res.json(activities);
  } catch (error) {
    console.error("Error fetching dashboard activities:", error);
    res.status(500).json({ message: "Failed to fetch dashboard activities" });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    console.log("Get All Users - Admin ID:", req.user._id);
    console.log("Get All Users - Admin Role:", req.user.role);
    console.log("Get All Users - Admin Email:", req.user.email);
    
    const users = await User.find()
      .select("name email role status createdAt lastLogin profileImage")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Get user details
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("properties", "title price status")
      .populate("applications", "status createdAt")
      .populate("reviews", "rating comment");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Failed to fetch user details" });
  }
};

// Suspend user
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent suspending admin users
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot suspend admin users" });
    }

    user.status = "suspended";
    await user.save();

    res.json({ message: "User suspended successfully" });
  } catch (error) {
    console.error("Error suspending user:", error);
    res.status(500).json({ message: "Failed to suspend user" });
  }
};

// Activate user
const activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent activating admin users (they should always be active)
    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin users cannot be suspended or activated" });
    }

    user.status = "active";
    await user.save();

    res.json({ message: "User activated successfully" });
  } catch (error) {
    console.error("Error activating user:", error);
    res.status(500).json({ message: "Failed to activate user" });
  }
};

// Get all landlords
const getAllLandlords = async (req, res) => {
  try {
    console.log("Get All Landlords - Admin ID:", req.user._id);
    console.log("Get All Landlords - Admin Role:", req.user.role);
    console.log("Get All Landlords - Admin Email:", req.user.email);
    
    const landlords = await User.find({ role: "landlord" })
      .select("name email verificationStatus verificationDocuments createdAt profileImage phone status businessName")
      .sort({ createdAt: -1 });

    console.log("Found landlords:", landlords.length);

    // Get properties count for each landlord and format verification data
    const landlordsWithProperties = await Promise.all(
      landlords.map(async (landlord) => {
        const properties = await Property.find({ landlord: landlord._id });
        const landlordObj = landlord.toObject();
        landlordObj.properties = properties;
        
        // Format verification data for admin review
        if (landlordObj.verificationDocuments) {
          // Handle both array and object formats
          const docs = Array.isArray(landlordObj.verificationDocuments) 
            ? landlordObj.verificationDocuments[0] 
            : landlordObj.verificationDocuments;
            
          if (docs) {
            landlordObj.verificationData = {
              businessInfo: {
                businessName: docs.businessName,
                businessAddress: docs.businessAddress,
                phoneNumber: docs.phoneNumber
              },
              identification: {
                type: docs.identificationType,
                number: docs.identificationNumber
              },
              bankInfo: {
                bankName: docs.bankName,
                accountNumber: docs.accountNumber,
                accountName: docs.accountName
              },
              documents: {
                identification: docs.documents?.identification,
                utilityBill: docs.documents?.utilityBill,
                bankStatement: docs.documents?.bankStatement,
                propertyDocuments: docs.documents?.propertyDocuments
              },
              submittedAt: docs.submittedAt
            };
          }
        }
        
        return landlordObj;
      })
    );

    console.log("Returning landlords with properties");
    res.json(landlordsWithProperties);
  } catch (error) {
    console.error("Error fetching landlords:", error);
    res.status(500).json({ message: "Failed to fetch landlords" });
  }
};

// Get landlord details
const getLandlordDetails = async (req, res) => {
  try {
    const landlord = await User.findById(req.params.id)
      .populate("properties", "title price status address");

    if (!landlord || landlord.role !== "landlord") {
      return res.status(404).json({ message: "Landlord not found" });
    }

    // Format verification data for admin review
    let verificationData = null;
    
    if (landlord.verificationDocuments) {
      // Handle both array and object formats
      const docs = Array.isArray(landlord.verificationDocuments) 
        ? landlord.verificationDocuments[0] 
        : landlord.verificationDocuments;
        
      if (docs) {
        verificationData = {
          businessInfo: {
            businessName: docs.businessName,
            businessAddress: docs.businessAddress,
            phoneNumber: docs.phoneNumber
          },
          identification: {
            type: docs.identificationType,
            number: docs.identificationNumber
          },
          bankInfo: {
            bankName: docs.bankName,
            accountNumber: docs.accountNumber,
            accountName: docs.accountName
          },
          documents: {
            identification: docs.documents?.identification,
            utilityBill: docs.documents?.utilityBill,
            bankStatement: docs.documents?.bankStatement,
            propertyDocuments: docs.documents?.propertyDocuments
          },
          submittedAt: docs.submittedAt
        };
      }
    }



    const landlordData = {
      _id: landlord._id,
      name: landlord.name,
      email: landlord.email,
      phone: landlord.phone,
      profileImage: landlord.profileImage,
      role: landlord.role,
      status: landlord.status,
      verificationStatus: landlord.verificationStatus,
      verificationNote: landlord.verificationNote,
      verifiedAt: landlord.verifiedAt,
      verifiedBy: landlord.verifiedBy,
      businessName: landlord.businessName,
      createdAt: landlord.createdAt,
      properties: landlord.properties || [],
      verificationData
    };

    res.json(landlordData);
  } catch (error) {
    console.error("Error fetching landlord details:", error);
    res.status(500).json({ message: "Failed to fetch landlord details" });
  }
};

// Verify landlord
const verifyLandlord = async (req, res) => {
  try {
    const { action, note } = req.body;
    const landlord = await User.findById(req.params.id);

    if (!landlord || landlord.role !== "landlord") {
      return res.status(404).json({ message: "Landlord not found" });
    }

    // Check if landlord has submitted verification documents
    if (action === "approve" && (!landlord.verificationDocuments || !landlord.verificationDocuments.documents)) {
      return res.status(400).json({ 
        message: "Cannot approve landlord without verification documents. Please ensure they have submitted required documents first." 
      });
    }

    // Check if landlord has completed verification form
    if (action === "approve" && landlord.verificationStatus !== "pending") {
      return res.status(400).json({ 
        message: "Cannot approve landlord who hasn't completed verification process. Please ensure they have submitted verification details first." 
      });
    }

    landlord.verificationStatus = action === "approve" ? "approved" : "rejected";
    if (note) {
      landlord.verificationNote = note;
    }
    landlord.verifiedAt = new Date();
    landlord.verifiedBy = req.user._id;

    await landlord.save();

    // Create notification for the landlord
    const notificationTitle = action === "approve" ? "Verification Approved" : "Verification Rejected";
    const notificationMessage = action === "approve" 
      ? "Your landlord verification has been approved. You can now list properties."
      : `Your landlord verification has been rejected. Reason: ${note || "Please review and resubmit."}`;
    
    await createNotification(
      landlord._id,
      "verification",
      notificationTitle,
      notificationMessage,
      "/landlord/verification",
      {},
      req
    );

    res.json({ message: `Landlord ${action}d successfully` });
  } catch (error) {
    console.error("Error verifying landlord:", error);
    res.status(500).json({ message: "Failed to verify landlord" });
  }
};

// Get all properties
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate("landlord", "name email verificationStatus")
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
};

// Approve property
const approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    property.status = "active";
    property.approvedAt = new Date();
    property.approvedBy = req.user._id;

    await property.save();

    // Create notification for the landlord
    await createNotification(
      property.landlord,
      "property",
      "Property Approved",
      `Your property "${property.title}" has been approved and is now active.`,
      `/landlord/listings`,
      {},
      req
    );

    res.json({ message: "Property approved successfully" });
  } catch (error) {
    console.error("Error approving property:", error);
    res.status(500).json({ message: "Failed to approve property" });
  }
};

// Reject property
const rejectProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    property.status = "rejected";
    property.rejectedAt = new Date();
    property.rejectedBy = req.user._id;

    await property.save();

    res.json({ message: "Property rejected successfully" });
  } catch (error) {
    console.error("Error rejecting property:", error);
    res.status(500).json({ message: "Failed to reject property" });
  }
};

// Get all payments for admin reports
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("tenant", "name email")
      .populate("landlord", "name email")
      .populate("property", "title")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};

// Get revenue statistics for admin reports
const getRevenueStats = async (req, res) => {
  try {
    const [totalRevenue, monthlyRevenue, totalTransactions, averageTransaction] = await Promise.all([
      Payment.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Payment.aggregate([
        { 
          $match: { 
            status: "success",
            createdAt: { 
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
            } 
          } 
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Payment.countDocuments({ status: "success" }),
      Payment.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: null, average: { $avg: "$amount" } } }
      ])
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      totalTransactions,
      averageTransaction: averageTransaction[0]?.average || 0
    });
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    res.status(500).json({ message: "Failed to fetch revenue statistics" });
  }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    console.log("Admin Profile Request - User ID:", req.user._id);
    console.log("Admin Profile Request - User Role:", req.user.role);
    console.log("Admin Profile Request - User Email:", req.user.email);
    
    const admin = await User.findById(req.user._id).select("-password");
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Get pending verifications count
    const pendingVerifications = await User.countDocuments({ 
      role: "landlord", 
      verificationStatus: "pending" 
    });

    // Get properties approved count
    const propertiesApproved = await Property.countDocuments({ 
      status: "active",
      approvedBy: admin._id
    });

    // Get total users managed
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });

    // Get recent verification activities
    const recentVerifications = await User.find({ 
      role: "landlord", 
      verificationStatus: { $in: ["approved", "rejected"] },
      verifiedBy: admin._id
    })
    .select("name email verificationStatus verifiedAt verificationNote")
    .sort({ verifiedAt: -1 })
    .limit(5);

    // Enhanced admin profile with statistics
    const adminProfile = {
      ...admin.toObject(),
      adminStats: {
        pendingVerifications,
        propertiesApproved,
        totalUsers,
        verificationsCompleted: recentVerifications.length
      },
      recentVerifications
    };

    res.json(adminProfile);
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ message: "Failed to fetch admin profile" });
  }
};

// Update admin profile
const updateAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Update allowed fields
    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.phone = req.body.phone || admin.phone;
    admin.profileImage = req.body.profileImage || admin.profileImage;

    // Password change
    if (req.body.password) {
      admin.password = req.body.password;
    }

    const updatedAdmin = await admin.save();

    res.json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      phone: updatedAdmin.phone,
      role: updatedAdmin.role,
      profileImage: updatedAdmin.profileImage
    });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({ message: "Failed to update admin profile" });
  }
};

export {
  getDashboardStats,
  getDashboardActivities,
  getAllUsers,
  getUserDetails,
  suspendUser,
  activateUser,
  getAllLandlords,
  getLandlordDetails,
  verifyLandlord,
  getAllProperties,
  approveProperty,
  rejectProperty,
  getAllPayments,
  getRevenueStats,
  getAdminProfile,
  updateAdminProfile
};
