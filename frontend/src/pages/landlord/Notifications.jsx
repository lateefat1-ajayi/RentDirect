// src/pages/landlord/LandlordNotifications.jsx
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { FaBell, FaCheck, FaCheckDouble } from "react-icons/fa";
import { useNotifications } from "../../context/NotificationsContext";
import { toast } from "react-toastify";

export default function LandlordNotifications() {
  const { notifications, markAsRead, markAllAsRead, loading, unreadCount } = useNotifications();

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      toast.success("Marked as read");
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FaBell /> Notifications
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount} new
            </span>
          )}
        </h2>
        {notifications.length > 0 && unreadCount > 0 && (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2"
          >
            <FaCheckDouble /> Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="p-8 text-center">
          <FaBell className="text-gray-400 dark:text-gray-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No notifications yet.</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n._id || n.id}
              className={`p-4 flex items-start justify-between gap-3 border-l-4 transition-all duration-200 hover:shadow-md
                ${n.isRead 
                  ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 opacity-75" 
                  : "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm"
                }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  {!n.isRead && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  )}
                  <div className="flex-1">
                    <p className={`text-sm ${n.isRead ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-white font-medium"}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n._id || n.id)}
                    className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-emerald-100 transition-colors"
                    aria-label="Mark as read"
                  >
                    <FaCheck className="text-xs" />
                    Mark as read
                  </button>
                )}
                {n.link ? (
                  <Link 
                    to={n.link} 
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                  >
                    View
                  </Link>
                ) : (
                  <span className="text-xs text-gray-400 px-2">—</span>
                )}
              </div>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
