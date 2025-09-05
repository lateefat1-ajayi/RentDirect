import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import { createNotification, createGroupedMessageNotification } from "./notificationController.js";

// Get conversations for a user based on their role
const getConversations = async (req, res) => {
  try {
    const { role } = req.query;
    const userId = req.user._id;

    let conversations;
    
    if (role === "admin") {
      // Admin can see all conversations
      conversations = await Conversation.find()
        .populate("participants", "name email profileImage role")
        .populate("messages.sender", "name email profileImage role")
        .sort({ updatedAt: -1 });
    } else {
      // Regular users see conversations they're part of
      conversations = await Conversation.find({
        participants: userId
      })
        .populate("participants", "name email profileImage role")
        .populate("messages.sender", "name email profileImage role")
        .sort({ updatedAt: -1 });
    }

    // Format conversations for frontend
    const formattedConversations = conversations.map(conv => {
      const counterpart = conv.participants.find(p => p._id.toString() !== userId.toString());
      const lastMessage = conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
      
      // Add fromMe property to all messages
      const messagesWithFromMe = conv.messages.map(message => ({
        id: message._id,
        text: message.text,
        sender: message.sender._id,
        senderName: message.sender.name,
        date: message.createdAt,
        createdAt: message.createdAt,
        fromMe: message.sender._id.toString() === userId.toString()
      }));
      
      return {
        id: conv._id,
        participantId: counterpart ? counterpart._id : null,
        participantName: counterpart ? counterpart.name : "Unknown User",
        participantImage: counterpart ? counterpart.profileImage : null,
        participantRole: counterpart ? counterpart.role : null,
        propertyTitle: conv.propertyTitle || "Property",
        messages: messagesWithFromMe,
        lastMessage: lastMessage ? {
          text: lastMessage.text,
          date: lastMessage.createdAt
        } : null,
        updatedAt: conv.updatedAt
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

// Get messages for a conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Check if user is part of this conversation
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Populate sender info and add fromMe property
    const populatedConversation = await Conversation.findById(conversationId)
      .populate("messages.sender", "name email profileImage role");

    const messagesWithFromMe = populatedConversation.messages.map(message => ({
      id: message._id,
      text: message.text,
      sender: message.sender._id,
      senderName: message.sender.name,
      date: message.createdAt,
      createdAt: message.createdAt, // Keep both for compatibility
      fromMe: message.sender._id.toString() === userId.toString()
    }));

    console.log("🔍 getMessages - Messages with fromMe:", {
      conversationId,
      userId: userId.toString(),
      messagesCount: messagesWithFromMe.length,
      sampleMessage: messagesWithFromMe[0]
    });

    res.json(messagesWithFromMe);
  } catch (error) {
    console.error("❌ Error in getMessages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    console.log("🔍 SendMessage - Request details:", {
      conversationId,
      text,
      userId,
      userRole: req.user.role,
      userEmail: req.user.email,
      userObjectId: req.user._id.toString()
    });

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    console.log("🔍 Conversation details:", {
      conversationId: conversation._id,
      participants: conversation.participants.map(p => p.toString()),
      currentUser: userId.toString(),
      isParticipant: conversation.participants.includes(userId)
    });

    // Check if user is part of this conversation
    if (!conversation.participants.includes(userId)) {
      console.log("❌ User not in conversation - Access denied");
      return res.status(403).json({ message: "Access denied" });
    }

    const newMessage = {
      text: text.trim(),
      sender: userId,
      createdAt: new Date()
    };

    console.log("🔍 New message object:", newMessage);

    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date();
    await conversation.save();

    // Populate sender info for socket emission
    const populatedConversation = await Conversation.findById(conversationId)
      .populate("messages.sender", "name email profileImage role");

    const lastMessage = populatedConversation.messages[populatedConversation.messages.length - 1];
    
    console.log("🔍 Populated message details:", {
      messageId: lastMessage._id,
      text: lastMessage.text,
      senderId: lastMessage.sender._id,
      senderName: lastMessage.sender.name,
      senderRole: lastMessage.sender.role,
      senderEmail: lastMessage.sender.email
    });

    // Emit to socket for other users in the conversation
    // The sender will see their message immediately in the frontend
    const socketMessage = {
      conversationId,
      message: {
        id: lastMessage._id,
        text: lastMessage.text,
        sender: lastMessage.sender._id,
        senderName: lastMessage.sender.name,
        date: lastMessage.createdAt,
        createdAt: lastMessage.createdAt
      }
    };
    
    console.log("🔍 Emitting socket message:", {
      conversationId,
      message: socketMessage.message,
      actualSenderId: lastMessage.sender._id,
      actualSenderName: lastMessage.sender.name
    });
    
    // Emit to the conversation room EXCEPT the sender
    // The sender already has their message locally
    req.io.to(conversationId).except(`user_${lastMessage.sender._id}`).emit("receiveMessage", socketMessage);

    // Create notifications for other participants in the conversation
    const otherParticipants = conversation.participants.filter(
      participantId => participantId.toString() !== lastMessage.sender._id.toString()
    );

    // Create grouped notification for each recipient
    for (const recipientId of otherParticipants) {
      try {
        await createGroupedMessageNotification(
          recipientId,
          lastMessage.sender._id,
          lastMessage.sender.name,
          conversationId,
          lastMessage._id,
          req
        );
      } catch (notificationError) {
        console.error("Error creating message notification:", notificationError);
        // Don't fail the message send if notification fails
      }
    }

    res.json({
      id: lastMessage._id,
      text: lastMessage.text,
      sender: lastMessage.sender._id,
      senderName: lastMessage.sender.name,
      date: lastMessage.createdAt,
      createdAt: lastMessage.createdAt
    });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Update a message
const updateMessage = async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Check if user is part of this conversation
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const message = conversation.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user owns this message
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Can only edit your own messages" });
    }

    message.text = text.trim();
    message.updatedAt = new Date();
    await conversation.save();

    // Emit to socket
    req.io.to(conversationId).except(`user_${message.sender}`).emit("messageUpdated", {
      conversationId,
      message: {
        id: message._id,
        text: message.text,
        sender: message.sender,
        date: message.createdAt,
        createdAt: message.createdAt
      }
    });

    res.json({
      id: message._id,
      text: message.text,
      sender: message.sender,
      date: message.createdAt,
      createdAt: message.createdAt
    });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ message: "Failed to update message" });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const userId = req.user._id;

    console.log("🔍 DeleteMessage - Request details:", {
      conversationId,
      messageId,
      userId: userId.toString(),
      userRole: req.user.role
    });

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.log("❌ Conversation not found:", conversationId);
      return res.status(404).json({ message: "Conversation not found" });
    }

    console.log("🔍 Conversation found:", {
      conversationId: conversation._id,
      participants: conversation.participants.map(p => p.toString()),
      messagesCount: conversation.messages.length
    });

    // Check if user is part of this conversation
    if (!conversation.participants.includes(userId)) {
      console.log("❌ User not in conversation - Access denied");
      return res.status(403).json({ message: "Access denied" });
    }

    const message = conversation.messages.id(messageId);
    if (!message) {
      console.log("❌ Message not found:", messageId);
      return res.status(404).json({ message: "Message not found" });
    }

    console.log("🔍 Message found:", {
      messageId: message._id,
      messageSender: message.sender.toString(),
      currentUser: userId.toString(),
      messageText: message.text
    });

    // Check if user owns this message
    if (message.sender.toString() !== userId.toString()) {
      console.log("❌ User doesn't own message - Access denied");
      return res.status(403).json({ message: "Can only delete your own messages" });
    }

    // Remove the message from the array using pull
    conversation.messages.pull(messageId);
    await conversation.save();

    console.log("✅ Message deleted successfully");

    // Emit to socket
    req.io.to(conversationId).except(`user_${message.sender}`).emit("messageDeleted", {
      conversationId,
      messageId
    });

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting message:", error);
    res.status(500).json({ message: "Failed to delete message" });
  }
};

// Create a new conversation
const createConversation = async (req, res) => {
  try {
    const { participantIds } = req.body;
    const userId = req.user._id;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ message: "Participant IDs are required" });
    }

    // Add current user to participants if not already included
    const allParticipants = [...new Set([userId, ...participantIds])];

    // Check if conversation already exists between these participants
    const existingConversation = await Conversation.findOne({
      participants: { $all: allParticipants, $size: allParticipants.length }
    });

    if (existingConversation) {
      return res.status(400).json({ message: "Conversation already exists" });
    }

    const conversation = new Conversation({
      participants: allParticipants,
      messages: []
    });

    await conversation.save();

    // Populate participants for response
    await conversation.populate("participants", "name email profileImage role");

    res.status(201).json({
      id: conversation._id,
      participants: conversation.participants,
      messages: [],
      createdAt: conversation.createdAt
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ message: "Failed to create conversation" });
  }
};

export {
  getConversations,
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  createConversation
};
