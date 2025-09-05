import User from "../models/User.js";
import Property from "../models/Property.js";
import Application from "../models/Application.js";
import Lease from "../models/Lease.js";
import { uploadToCloudinary } from "../middlewares/uploadMiddleware.js";

export const submitVerification = async (req, res) => {
  try {
    const {
      businessName,
      businessAddress,
      phoneNumber,
      identificationType,
      identificationNumber,
      bankName,
      accountNumber,
      accountName
    } = req.body;

    // Validate required fields
    if (!businessName || !businessAddress || !phoneNumber || !identificationType || !identificationNumber) {
      return res.status(400).json({ 
        message: "Missing required fields: businessName, businessAddress, phoneNumber, identificationType, identificationNumber" 
      });
    }

    // Check if user is already verified
    if (req.user.verificationStatus === "approved") {
      return res.status(400).json({ 
        message: "User is already verified" 
      });
    }

    // Allow resubmission if status is "rejected" or "pending"
    // This will overwrite the previous submission

    // Upload documents to Cloudinary
    const verificationDocuments = {};
    
    if (req.files.identification) {
      const result = await uploadToCloudinary(
        req.files.identification[0].buffer, 
        req.files.identification[0].originalname
      );
      verificationDocuments.identification = result.secure_url;
    }

    if (req.files.utilityBill) {
      const result = await uploadToCloudinary(
        req.files.utilityBill[0].buffer, 
        req.files.utilityBill[0].originalname
      );
      verificationDocuments.utilityBill = result.secure_url;
    }

    if (req.files.bankStatement) {
      const result = await uploadToCloudinary(
        req.files.bankStatement[0].buffer, 
        req.files.bankStatement[0].originalname
      );
      verificationDocuments.bankStatement = result.secure_url;
    }

    if (req.files.propertyDocuments) {
      const result = await uploadToCloudinary(
        req.files.propertyDocuments[0].buffer, 
        req.files.propertyDocuments[0].originalname
      );
      verificationDocuments.propertyDocuments = result.secure_url;
    }

    // Validate that we have the required data before saving
    const verificationData = {
      businessName,
      businessAddress,
      phoneNumber,
      identificationType,
      identificationNumber,
      bankName,
      accountNumber,
      accountName,
      documents: verificationDocuments,
      submittedAt: new Date()
    };

    // Check if we have at least some documents uploaded
    const hasDocuments = Object.keys(verificationDocuments).length > 0;
    if (!hasDocuments) {
      return res.status(400).json({ 
        message: "Please upload at least one verification document" 
      });
    }

    // Update user with verification data
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        verificationStatus: "pending",
        verificationDocuments: verificationData
      },
      { new: true }
    );

    console.log("Verification data saved:", verificationData);

    res.status(200).json({
      message: "Verification request submitted successfully",
      user: {
        id: updatedUser._id,
        verificationStatus: updatedUser.verificationStatus
      }
    });

  } catch (error) {
    console.error("Verification submission error:", error);
    res.status(500).json({ message: "Failed to submit verification request" });
  }
};

// Get landlord profile
export const getLandlordProfile = async (req, res) => {
  try {
    console.log("Landlord Profile Request - User ID:", req.user._id);
    console.log("Landlord Profile Request - User Role:", req.user.role);
    console.log("Landlord Profile Request - User Email:", req.user.email);
    
    const landlord = await User.findById(req.user._id).select("-password");
    if (!landlord || landlord.role !== "landlord") {
      return res.status(403).json({ message: "Access denied. Landlords only." });
    }

    // Get landlord-specific statistics
    const propertiesCount = await Property.countDocuments({ landlord: landlord._id });
    const applicationsCount = await Application.countDocuments({ 
      property: { $in: await Property.find({ landlord: landlord._id }).select('_id') }
    });
    const activeLeasesCount = await Lease.countDocuments({ 
      property: { $in: await Property.find({ landlord: landlord._id }).select('_id') },
      status: "active"
    });

    // Enhanced landlord profile with statistics
    const landlordProfile = {
      ...landlord.toObject(),
      landlordStats: {
        propertiesCount,
        applicationsCount,
        activeLeasesCount
      }
    };

    res.json(landlordProfile);
  } catch (error) {
    console.error("Error fetching landlord profile:", error);
    res.status(500).json({ message: "Failed to fetch landlord profile" });
  }
};
