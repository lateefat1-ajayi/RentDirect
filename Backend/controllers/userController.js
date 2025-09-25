import User from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    console.log("Get Profile Request - User ID:", req.user._id);
    console.log("Get Profile Request - User Role:", req.user.role);
    console.log("Get Profile Request - User Email:", req.user.email);
    
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    console.log("Profile fetched - User ID:", user._id);
    console.log("Profile fetched - User Role:", user.role);
    console.log("Profile fetched - User Email:", user.email);
    
    res.json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Common fields for all users
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    // Handle profileImage properly - allow null values to remove image
    if (req.body.profileImage !== undefined) {
      user.profileImage = req.body.profileImage;
    }

    // ✅ Landlord-only fields
    if (user.role === "landlord") {
      if (req.body.businessName !== undefined) user.businessName = req.body.businessName;
      if (req.body.bankName !== undefined) user.bankName = req.body.bankName;
      if (req.body.accountNumber !== undefined) user.accountNumber = req.body.accountNumber;
      // Handle company field (from frontend)
      if (req.body.company !== undefined) user.businessName = req.body.company;
    }

    // Password change
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      ...(updatedUser.role === "landlord" && {
        businessName: updatedUser.businessName,
        company: updatedUser.businessName, // Alias for frontend compatibility
        bankName: updatedUser.bankName,
        accountNumber: updatedUser.accountNumber,
      }),
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
