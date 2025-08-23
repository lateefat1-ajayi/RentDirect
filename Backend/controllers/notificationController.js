import Message from "../models/Message.js";
import Review from "../models/Review.js";
import Payment from "../models/Payment.js";

// ✅ Get unread counts
export const getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadMessages = await Message.countDocuments({
      receiver: userId,
      isRead: false,
    });

    const unreadReviews = await Review.countDocuments({
      targetUser: userId,
      isRead: false,
    });

    const unreadPayments = await Payment.countDocuments({
      $or: [{ tenant: userId }, { landlord: userId }],
      isRead: false,
    });

    res.json({
      messages: unreadMessages,
      reviews: unreadReviews,
      payments: unreadPayments,
      total: unreadMessages + unreadReviews + unreadPayments,
    });
  } catch (error) {
    console.error("Error fetching unread counts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user._id;

    let updatedDoc;

    switch (type) {
      case "message":
        updatedDoc = await Message.findOneAndUpdate(
          { _id: id, receiver: userId },
          { isRead: true },
          { new: true }
        );
        break;

      case "review":
        updatedDoc = await Review.findOneAndUpdate(
          { _id: id, targetUser: userId },
          { isRead: true },
          { new: true }
        );
        break;

      case "payment":
        updatedDoc = await Payment.findOneAndUpdate(
          { _id: id, $or: [{ tenant: userId }, { landlord: userId }] },
          { isRead: true },
          { new: true }
        );
        break;

      default:
        return res.status(400).json({ message: "Invalid notification type" });
    }

    if (!updatedDoc) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification marked as read", notification: updatedDoc });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    // Update all unread messages
    await Message.updateMany(
      { receiver: userId, read: false },
      { $set: { read: true } }
    );

    // Update all unread reviews
    await Review.updateMany(
      { targetUser: userId, read: false },
      { $set: { read: true } }
    );

    await Payment.updateMany(
      { tenant: userId, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};