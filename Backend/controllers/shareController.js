import Share from "../models/Share.js";
import Property from "../models/Property.js";
import crypto from "crypto";

// Generate a unique share token
const generateShareToken = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Create a new share
export const createShare = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user._id;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if user already shared this property
    const existingShare = await Share.findOne({
      property: propertyId,
      sharedBy: userId
    });

    if (existingShare) {
      // Return existing share
      return res.json({
        success: true,
        shareToken: existingShare.shareToken,
        shareUrl: `${process.env.FRONTEND_URL}/property/shared/${propertyId}/${existingShare.shareToken}`,
        message: "Share link generated successfully"
      });
    }

    // Create new share
    const shareToken = generateShareToken();
    const share = new Share({
      property: propertyId,
      sharedBy: userId,
      shareToken: shareToken
    });

    await share.save();

    res.json({
      success: true,
      shareToken: shareToken,
      shareUrl: `${process.env.FRONTEND_URL}/property/shared/${propertyId}/${shareToken}`,
      message: "Share link generated successfully"
    });
  } catch (error) {
    console.error("Error creating share:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get shared property (for registration gate)
export const getSharedProperty = async (req, res) => {
  try {
    const { propertyId, shareToken } = req.params;

    // Find the share
    const share = await Share.findOne({
      property: propertyId,
      shareToken: shareToken
    }).populate('property', 'title location price images landlord');

    if (!share) {
      return res.status(404).json({ message: "Invalid share link" });
    }

    // Check if share has expired
    if (share.expiresAt < new Date()) {
      return res.status(410).json({ message: "Share link has expired" });
    }

    // Increment view count
    share.views += 1;
    await share.save();

    res.json({
      success: true,
      property: share.property,
      sharedBy: share.sharedBy,
      shareToken: shareToken,
      message: "This property was shared with you! Sign up to view full details."
    });
  } catch (error) {
    console.error("Error getting shared property:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Track registration from share
export const trackShareRegistration = async (req, res) => {
  try {
    const { shareToken } = req.body;

    const share = await Share.findOne({ shareToken });
    if (share) {
      share.registrations += 1;
      await share.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error tracking share registration:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's sharing statistics
export const getSharingStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const shares = await Share.find({ sharedBy: userId })
      .populate('property', 'title location')
      .sort({ createdAt: -1 });

    const totalViews = shares.reduce((sum, share) => sum + share.views, 0);
    const totalRegistrations = shares.reduce((sum, share) => sum + share.registrations, 0);

    res.json({
      success: true,
      totalShares: shares.length,
      totalViews: totalViews,
      totalRegistrations: totalRegistrations,
      shares: shares
    });
  } catch (error) {
    console.error("Error getting sharing stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};
