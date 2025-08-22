import { uploadToCloudinary } from "../middlewares/uploadMiddleware.js";
import Property from "../models/Property.js";


export const createProperty = async (req, res) => {
  try {
    const { title, description, price, location, bedrooms, bathrooms, size } = req.body;

    if (!req.user || req.user.role !== "landlord") {
      return res.status(403).json({ message: "Only landlords can create properties" });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, file.originalname);
        images.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    const property = await Property.create({
      title,
      description,
      price,
      location,
      bedrooms,
      bathrooms,
      size,
      landlord: req.user._id,
      images,
    });

    res.status(201).json(property);
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getProperties = async (req, res) => {
  try {
    let { 
      page = 1, 
      limit = 10, 
      keyword = "", 
      location = "", 
      minPrice, 
      maxPrice 
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = { status: "available" }; // Only available properties

    // Keyword search (title & description)
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } }
      ];
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // Price filter
    if (!minPrice && !maxPrice) {
      query.price = { $gte: 300000, $lte: 2000000 };
    } else {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const total = await Property.countDocuments(query);

    const properties = await Property.find(query)
      .populate("landlord", "name email")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      properties,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("landlord", "name email");
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, price, location, bedrooms, bathrooms, size, status } = req.body;

    if (title) property.title = title;
    if (description) property.description = description;
    if (price) property.price = price;
    if (location) property.location = location;
    if (bedrooms) property.bedrooms = bedrooms;
    if (bathrooms) property.bathrooms = bathrooms;
    if (size) property.size = size;
    if (status) property.status = status;

    await property.save();
    res.json(property);
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const deleteProperty = async (req, res) => {
  try {
    console.log("User attempting delete:", req.user?._id, "Role:", req.user?.role);

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    console.log("Property landlord:", property.landlord.toString());

    // Ownership check
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Remove images from Cloudinary (safely)
    if (Array.isArray(property.images) && property.images.length > 0) {
      for (const img of property.images) {
        if (img.public_id) {
          try {
            await cloudinary.uploader.destroy(img.public_id);
            console.log("Deleted from Cloudinary:", img.public_id);
          } catch (err) {
            console.error("Cloudinary deletion failed:", err.message);
          }
        } else {
          console.log("No public_id for image, skipping:", img);
        }
      }
    }

    await property.deleteOne();
    res.json({ message: "Property deleted" });

  } catch (error) {
    console.error("Delete property error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
