import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiFetch } from "../lib/api"; 
import socket, { ensureSocketAuth } from "../services/socket";

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Not authenticated; skip fetching
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return [];
    }
    try {
      setLoading(true);
      const data = await apiFetch("/notifications").catch(() => []);
      setNotifications(data);
      
      // Calculate unread count from notifications data
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCounts = useCallback(async () => {
    try {
      const counts = await apiFetch("/notifications/unread-counts");
      setUnreadCount(counts.unreadCount || 0);
      return counts;
    } catch (err) {
      console.error("Error fetching unread counts:", err);
      return { unreadCount: 0 };
    }
  }, []);

  useEffect(() => {
    // Only fetch notifications and connect socket if authenticated
    const token = localStorage.getItem("token");
    if (token) {
      fetchNotifications();
      ensureSocketAuth();
    } else {
      setLoading(false);
    }

    // Set up notification listener on the shared socket
    const handleNotification = (notif) => {
      console.log("New notification received:", notif);
      // Ensure the notification has proper structure
      const newNotification = {
        ...notif,
        isRead: false,
        createdAt: notif.createdAt || new Date().toISOString(),
        _id: notif._id || notif.id || Date.now().toString()
      };
      
      setNotifications((prev) => [newNotification, ...prev]);
      // Increment unread count for new notifications
      setUnreadCount(prev => prev + 1);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, []); // Remove dependencies to prevent re-runs

  const markAsRead = async (id) => {
    try {
      console.log("Marking notification as read:", id);
      await apiFetch(`/notifications/${id}/read`, { method: "PUT" });
      
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true } : n))
      );
      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log("Marking all notifications as read");
      await apiFetch("/notifications/read/all", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      // Reset unread count to 0
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        loading,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        fetchUnreadCounts,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
