import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";
import { 
  FaBell, 
  FaCheck, 
  FaCheckDouble, 
  FaEye, 
  FaEyeSlash,
  FaUser,
  FaHome,
  FaFileAlt,
  FaCreditCard,
  FaExclamationTriangle
} from "react-icons/fa";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/notifications");
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiFetch(`/admin/notifications/${notificationId}/read`, { method: "PUT" });
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch("/admin/notifications/mark-all-read", { method: "PUT" });
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "registration":
        return <FaUser className="w-4 h-4 text-blue-600" />;
      case "property":
        return <FaHome className="w-4 h-4 text-green-600" />;
      case "application":
        return <FaFileAlt className="w-4 h-4 text-purple-600" />;
      case "payment":
        return <FaCreditCard className="w-4 h-4 text-yellow-600" />;
      case "verification":
        return <FaExclamationTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <FaBell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationBadge = (type) => {
    switch (type) {
      case "registration":
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Registration</span>;
      case "property":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Property</span>;
      case "application":
        return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Application</span>;
      case "payment":
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Payment</span>;
      case "verification":
        return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Verification</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">General</span>;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") return !notification.isRead;
    if (filter === "read") return notification.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="secondary" className="flex items-center gap-2">
              <FaCheckDouble className="w-4 h-4" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification._id} 
              className={`p-4 transition-all ${
                notification.isRead 
                  ? 'bg-gray-50 dark:bg-gray-800' 
                  : 'bg-white dark:bg-gray-700 border-l-4 border-l-primary'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-full">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {getNotificationBadge(notification.type)}
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      {notification.link && (
                        <Link 
                          to={notification.link} 
                          className="text-primary hover:underline"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => markAsRead(notification._id)}
                      className="flex items-center gap-1"
                    >
                      <FaCheck className="w-3 h-3" />
                      Mark Read
                    </Button>
                  )}
                  {notification.isRead && (
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <FaEye className="w-3 h-3" />
                      Read
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <FaBell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === "all" 
                ? "No notifications yet" 
                : filter === "unread" 
                  ? "No unread notifications" 
                  : "No read notifications"
              }
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
