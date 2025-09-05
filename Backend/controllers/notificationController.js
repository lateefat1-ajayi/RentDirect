import User from "../models/User.js";
import Property from "../models/Property.js";
import Application from "../models/Application.js";
import Lease from "../models/Lease.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";

// Get notifications for a specific user
const getUserNotifications = async (req, res) => {
  try {
    console.log("Fetching notifications for user:", {
      userId: req.user._id,
      userRole: req.user.role,
      userEmail: req.user.email
    });

    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`Found ${notifications.length} notifications for user ${req.user._id}`);

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Get unread notification count for a user
const getUnreadCounts = async (req, res) => {
  try {
    console.log("Fetching unread count for user:", {
      userId: req.user._id,
      userRole: req.user.role,
      userEmail: req.user.email
    });

    const count = await Notification.countDocuments({ 
      recipient: req.user._id, 
      isRead: false 
    });

    console.log(`User ${req.user._id} has ${count} unread notifications`);

    res.json({ unreadCount: count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure user can only mark their own notifications as read
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

// Mark all notifications as read for a user
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Failed to mark all notifications as read" });
  }
};

// Admin: Get all notifications
const getAdminNotifications = async (req, res) => {
  try {
    const { limit = 50, type, isRead } = req.query;
    
    // First, get all admin user IDs
    const adminUsers = await User.find({ role: "admin" }).select('_id');
    const adminUserIds = adminUsers.map(admin => admin._id);
    
    let query = { recipient: { $in: adminUserIds } };
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    
    const notifications = await Notification.find(query)
      .populate('recipient', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Admin: Mark notification as read
const adminMarkAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

// Admin: Mark all notifications as read
const adminMarkAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Failed to mark all notifications as read" });
  }
};

// Create notification (used by other controllers)
const createNotification = async (recipientId, type, title, message, link = "", metadata = {}, req = null) => {
  try {
    // If recipientId is "admin", create notifications for all admin users
    if (recipientId === "admin") {
      const adminUsers = await User.find({ role: "admin" });
      
      if (adminUsers.length === 0) {
        console.log("No admin users found for admin notification");
        return null;
      }

      // Create notifications for all admin users
      const notifications = await Promise.all(
        adminUsers.map(adminUser => {
          const notification = new Notification({
            recipient: adminUser._id,
            type,
            title,
            message,
            link,
            metadata
          });
          return notification.save();
        })
      );

      console.log(`Created ${notifications.length} admin notifications for: ${title}`);
      
      // Emit notifications via socket if available
      if (req && req.io) {
        notifications.forEach(notification => {
          console.log(`📢 Emitting admin notification to user_${notification.recipient}:`, {
            notificationId: notification._id,
            title: notification.title,
            message: notification.message,
            recipient: notification.recipient
          });
          req.io.to(`user_${notification.recipient}`).emit("notification", notification);
        });
      } else {
        console.log("❌ Cannot emit admin notifications - req.io not available");
      }
      
      return notifications;
    }

    // Regular notification for specific user
    const notification = new Notification({
      recipient: recipientId,
      type,
      title,
      message,
      link,
      metadata
    });

    await notification.save();
    
    // Emit notification via socket if available
    if (req && req.io) {
      console.log(`📢 Emitting notification to user_${recipientId}:`, {
        notificationId: notification._id,
        title: notification.title,
        message: notification.message,
        recipient: recipientId
      });
      req.io.to(`user_${recipientId}`).emit("notification", notification);
    } else {
      console.log("❌ Cannot emit notification - req.io not available");
    }
    
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// Create grouped message notification
const createGroupedMessageNotification = async (recipientId, senderId, senderName, conversationId, messageId, req = null) => {
  try {
    // Check if there's an existing unread message notification from the same sender
    const existingNotification = await Notification.findOne({
      recipient: recipientId,
      type: "message",
      isRead: false,
      "metadata.senderId": senderId,
      "metadata.conversationId": conversationId
    });

    if (existingNotification) {
      // Update existing notification with new message count
      const currentCount = existingNotification.metadata.messageCount || 1;
      existingNotification.metadata.messageCount = currentCount + 1;
      existingNotification.metadata.lastMessageId = messageId;
      existingNotification.message = `${senderName} sent you ${currentCount + 1} messages`;
      existingNotification.createdAt = new Date(); // Update timestamp
      await existingNotification.save();

      // Emit updated notification via socket
      if (req && req.io) {
        req.io.to(`user_${recipientId}`).emit("notification", existingNotification);
      }

      return existingNotification;
    } else {
      // Create new notification
      return await createNotification(
        recipientId,
        "message",
        "New Message",
        `${senderName} sent you a message`,
        `/messages/${conversationId}`,
        {
          conversationId,
          senderId,
          senderName,
          messageId,
          messageCount: 1
        },
        req
      );
    }
  } catch (error) {
    console.error("Error creating grouped message notification:", error);
    return null;
  }
};

// Create system notifications for various events
const createSystemNotifications = async () => {
  try {
    // Example: Create notification for new user registration
    // This would be called from user registration controller
  } catch (error) {
    console.error("Error creating system notifications:", error);
  }
};

export {
  getUserNotifications,
  getUnreadCounts,
  markAsRead,
  markAllAsRead,
  getAdminNotifications,
  adminMarkAsRead,
  adminMarkAllAsRead,
  createNotification,
  createGroupedMessageNotification,
  createSystemNotifications
};
