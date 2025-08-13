import Message from "../models/Message.js";
import Property from "../models/Property.js";


export const sendMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, token missing or invalid" });
    }

    const { propertyId, content, receiverId } = req.body;

    if (!propertyId || !content) {
      return res.status(400).json({ message: "Property ID and content are required" });
    }

    const property = await Property.findById(propertyId).populate("landlord");
    if (!property) return res.status(404).json({ message: "Property not found" });

    let receiver;
    if (req.user.role === "landlord") {
      if (!receiverId) {
        return res.status(400).json({ message: "Receiver ID required for landlord messages" });
      }
      receiver = receiverId;
    } else {
      receiver = property.landlord._id;
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      property: propertyId,
      content
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const getMessagesByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const messages = await Message.find({ property: propertyId })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: 1 }); // oldest first

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Landlord inbox (all messages tied to landlord's properties)
export const getLandlordMessages = async (req, res) => {
  try {
    if (req.user.role !== "landlord") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const properties = await Property.find({ landlord: req.user._id }).select("_id title");
    const propertyIds = properties.map(p => p._id);

    const messages = await Message.find({ property: { $in: propertyIds } })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("property", "title")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error("Landlord inbox error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Tenant inbox (messages the tenant sent/received)
export const getTenantMessages = async (req, res) => {
  try {
    if (req.user.role !== "tenant") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("property", "title")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error("Tenant inbox error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
