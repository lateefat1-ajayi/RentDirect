import User from "../models/User.js";
import { uploadToCloudinary } from "../middlewares/uploadMiddleware.js";

export const uploadVerificationDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload file to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    // Update user's verificationDocument field
    req.user.verificationDocument = result.secure_url;
    req.user.isVerified = false; // still needs admin approval
    await req.user.save();

    res.status(200).json({
      message: "Verification document uploaded successfully, pending admin approval",
      documentUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Verification upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const approveVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "User verification approved" });
  } catch (error) {
    console.error("Verification approval error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const rejectVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isVerified = false;
    user.verificationDocument = null;
    await user.save();

    res.status(200).json({ message: "User verification rejected" });
  } catch (error) {
    console.error("Verification rejection error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
