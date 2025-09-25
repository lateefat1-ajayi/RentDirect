import { uploadToCloudinary } from "../middlewares/uploadMiddleware.js";
import Property from "../models/Property.js";


export const createProperty = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      price, 
      location, 
      bedrooms, 
      bathrooms, 
      size,
      availableDurations: availableDurationsStr,
      address: addressStr,
      coordinates: coordinatesStr
    } = req.body;

    // Parse JSON strings for address, coordinates, and availableDurations
    let address = {};
    let coordinates = {};
    let availableDurations = [1, 2, 3]; // Default durations
    
    try {
      if (addressStr) {
        address = typeof addressStr === 'string' ? JSON.parse(addressStr) : addressStr;
      }
    } catch (error) {
      console.error("Error parsing address:", error);
    }
    
    try {
      if (coordinatesStr) {
        coordinates = typeof coordinatesStr === 'string' ? JSON.parse(coordinatesStr) : coordinatesStr;
      }
    } catch (error) {
      console.error("Error parsing coordinates:", error);
    }
    
    try {
      if (availableDurationsStr) {
        availableDurations = typeof availableDurationsStr === 'string' ? JSON.parse(availableDurationsStr) : availableDurationsStr;
      }
    } catch (error) {
      console.error("Error parsing availableDurations:", error);
    }

    console.log("Creating property - User details:", {
      userId: req.user._id,
      userRole: req.user.role,
      userEmail: req.user.email
    });

    if (!req.user || req.user.role !== "landlord") {
      return res.status(403).json({ message: "Only landlords can create properties" });
    }

    // Check if landlord is verified
    if (req.user.verificationStatus !== "approved") {
      return res.status(403).json({ 
        message: "Your account needs to be verified by an admin before you can list properties. Please contact support." 
      });
    }

    // Check if at least 4 images are uploaded
    if (!req.files || req.files.length < 4) {
      return res.status(400).json({ 
        message: "At least 4 property images are required. Please upload photos showing different rooms and angles." 
      });
    }

    let images = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, file.originalname);
      images.push({ url: result.secure_url, public_id: result.public_id });
    }

    const property = await Property.create({
      title,
      description,
      price,
      location,
      bedrooms,
      bathrooms,
      size,
      availableDurations,
      landlord: req.user._id,
      images,
      address: address || {},
      coordinates: coordinates || {},
      status: "available" // Set status to available so users can see the property immediately
    });

    console.log("Property created successfully:", {
      propertyId: property._id,
      title: property.title,
      landlord: property.landlord,
      createdAt: property.createdAt
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

    // Price filter - only apply if minPrice or maxPrice is specified
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    // If no price filter is specified, don't add any price constraints

    const total = await Property.countDocuments(query);

    const properties = await Property.find(query)
      .populate("landlord", "name email _id")
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

// Get properties for the authenticated landlord
export const getMyProperties = async (req, res) => {
  try {
    console.log("getMyProperties called by user:", {
      userId: req.user._id,
      userRole: req.user.role,
      userEmail: req.user.email
    });

    if (!req.user || req.user.role !== "landlord") {
      return res.status(403).json({ message: "Only landlords can view their listings" });
    }

    console.log("Searching for properties with landlord ID:", req.user._id);
    const properties = await Property.find({ landlord: req.user._id })
      .sort({ createdAt: -1 });

    // Get application counts for each property
    const Application = (await import("../models/Application.js")).default;
    const Payment = (await import("../models/Payment.js")).default;
    
    const propertiesWithCounts = await Promise.all(
      properties.map(async (property) => {
        const [applicationCount, paymentCount] = await Promise.all([
          Application.countDocuments({ property: property._id }),
          Payment.countDocuments({ property: property._id })
        ]);
        
        return {
          ...property.toObject(),
          applicationCount,
          paymentCount,
          hasApplications: applicationCount > 0,
          hasPayments: paymentCount > 0
        };
      })
    );

    console.log("Properties found:", propertiesWithCounts.length);
    console.log("Sample property:", propertiesWithCounts[0]);

    res.json(propertiesWithCounts);
  } catch (error) {
    console.error("Error fetching landlord properties:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("landlord", "name email _id");
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

// Get properties by landlord ID
export const getPropertiesByLandlord = async (req, res) => {
  try {
    const { landlordId } = req.params;
    
    const properties = await Property.find({ landlord: landlordId })
      .populate("landlord", "name email profileImage verificationStatus")
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    console.error("Get properties by landlord error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
