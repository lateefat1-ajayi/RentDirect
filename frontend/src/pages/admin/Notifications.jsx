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
        return <FaUser className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600 dark:text-blue-400" />;
      case "property":
        return <FaHome className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600 dark:text-green-400" />;
      case "application":
        return <FaFileAlt className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 dark:text-purple-400" />;
      case "payment":
        return <FaCreditCard className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-600 dark:text-yellow-400" />;
      case "verification":
        return <FaExclamationTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-600 dark:text-orange-400" />;
      default:
        return <FaBell className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600 dark:text-gray-400" />;
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
            <FaBell className="w-5 h-5 text-teal-600 dark:text-teal-300" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
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
            <Button onClick={markAllAsRead} variant="outline" className="flex items-center gap-2">
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
            <div 
              key={notification._id} 
              className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-all ${
                notification.isRead 
                  ? 'bg-gray-50 dark:bg-gray-800' 
                  : 'bg-white dark:bg-gray-700 border-l-4 border-l-primary'
              }`}
            >
              <div className={`p-1 sm:p-1.5 rounded-full ${
                notification.type === 'registration' ? 'bg-blue-100 dark:bg-blue-900' :
                notification.type === 'property' ? 'bg-green-100 dark:bg-green-900' :
                notification.type === 'application' ? 'bg-purple-100 dark:bg-purple-900' :
                notification.type === 'payment' ? 'bg-yellow-100 dark:bg-yellow-900' :
                notification.type === 'verification' ? 'bg-orange-100 dark:bg-orange-900' :
                'bg-gray-100 dark:bg-gray-700'
              }`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                    {notification.title}
                  </h3>
                  {getNotificationBadge(notification.type)}
                  {!notification.isRead && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0"></span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mb-1">
                  {notification.message}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{new Date(notification.createdAt).toLocaleString()}</span>
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
