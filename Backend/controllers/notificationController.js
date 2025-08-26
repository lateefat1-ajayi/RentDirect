import Message from "../models/Message.js";
import Review from "../models/Review.js";
import Payment from "../models/Payment.js";

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

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Try updating across collections
    let updatedDoc =
      (await Message.findOneAndUpdate(
        { _id: id, receiver: userId },
        { isRead: true },
        { new: true }
      )) ||
      (await Review.findOneAndUpdate(
        { _id: id, targetUser: userId },
        { isRead: true },
        { new: true }
      )) ||
      (await Payment.findOneAndUpdate(
        { _id: id, $or: [{ tenant: userId }, { landlord: userId }] },
        { isRead: true },
        { new: true }
      ));

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

    await Message.updateMany(
      { receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );

    await Review.updateMany(
      { targetUser: userId, isRead: false },
      { $set: { isRead: true } }
    );

    await Payment.updateMany(
      { $or: [{ tenant: userId }, { landlord: userId }], isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({ receiver: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const reviews = await Review.find({ targetUser: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const payments = await Payment.find({
      $or: [{ tenant: userId }, { landlord: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const notifications = [
      ...messages.map((m) => ({
        _id: m._id,
        type: "message",
        message: `New message from ${m.senderName || "your landlord"}`,
        link: `/messages/${m._id}`,
        isRead: m.isRead, // ✅ correct field
        createdAt: m.createdAt,
      })),
      ...reviews.map((r) => ({
        _id: r._id,
        type: "review",
        message: `You received a review: ${r.comment}`,
        link: `/user/profile#reviews`,
        isRead: r.isRead, // ✅ correct field
        createdAt: r.createdAt,
      })),
      ...payments.map((p) => ({
        _id: p._id,
        type: "payment",
        message: `Payment of ₦${(p.amount / 100).toFixed(2)} is ${p.status}`,
        link: `/payments/${p._id}`,
        isRead: p.isRead, // ✅ correct field
        createdAt: p.createdAt,
      })),
    ];

    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};
