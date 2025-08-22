import Message from "../models/Message.js";
import Property from "../models/Property.js";

let io;
export const setSocketIO = (socketInstance) => {
  io = socketInstance;
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
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
      content,
      isDeleted: false
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("property", "title");

    //Emit to both participants
    if (io) {
      io.to(propertyId.toString()).emit("newMessage", populatedMessage);
      io.to(receiver.toString()).emit("newMessage", populatedMessage);
      io.to(req.user._id.toString()).emit("newMessage", populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch all messages for a property chat
export const getMessagesByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const messages = await Message.find({ property: propertyId, isDeleted: false })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Landlord inbox
export const getLandlordMessages = async (req, res) => {
  try {
    if (req.user.role !== "landlord") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const properties = await Property.find({ landlord: req.user._id }).select("_id title");
    const propertyIds = properties.map((p) => p._id);

    const messages = await Message.find({ property: { $in: propertyIds }, isDeleted: false })
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

// Tenant inbox
export const getTenantMessages = async (req, res) => {
  try {
    if (req.user.role !== "tenant") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      isDeleted: false
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


export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // only sender or receiver can delete
    if (
      message.sender.toString() !== req.user._id.toString() &&
      message.receiver.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    message.isDeleted = true;
    await message.save();

    res.json({ message: "Message deleted (soft delete)" });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
