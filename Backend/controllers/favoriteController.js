import User from "../models/User.js";
import Property from "../models/Property.js";


export const addFavorite = async (req, res) => {
  try {
    if (req.user.role !== "tenant") {
      return res.status(403).json({ message: "Only tenants can save favorites" });
    }

    const { propertyId } = req.params;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });

    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { favorites: propertyId } }, // prevents duplicates
      { new: true }
    );

    res.status(200).json({ message: "Added to favorites" });
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    if (req.user.role !== "tenant") {
      return res.status(403).json({ message: "Only tenants can manage favorites" });
    }

    const { propertyId } = req.params;

    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { favorites: propertyId } },
      { new: true }
    );

    res.status(200).json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Remove favorite error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const listFavorites = async (req, res) => {
  try {
    if (req.user.role !== "tenant") {
      return res.status(403).json({ message: "Only tenants can view favorites" });
    }

    const user = await User.findById(req.user._id).populate({
      path: "favorites",
      select: "title price location images status landlord bedrooms bathrooms size description",
      populate: {
        path: "landlord",
        select: "name email _id profileImage"
      }
    });

    res.json(user.favorites || []);
  } catch (error) {
    console.error("List favorites error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const isFavorited = async (req, res) => {
  try {
    if (req.user.role !== "tenant") {
      return res.status(403).json({ message: "Only tenants can check favorites" });
    }

    const { propertyId } = req.params;
    const user = await User.findById(req.user._id).select("favorites");
    const favorited = user.favorites?.some(
      (id) => id.toString() === propertyId.toString()
    );
    res.json({ favorited: !!favorited });
  } catch (error) {
    console.error("Check favorite error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
