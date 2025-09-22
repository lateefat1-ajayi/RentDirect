import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { FaBell, FaCheck, FaCheckDouble } from "react-icons/fa";
import { useNotifications } from "../../context/NotificationsContext";
import { toast } from "react-toastify";

export default function UserNotifications() {
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
    <div className="p-6 space-y-6">
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
        {notifications.length > 0 && unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2"
          >
            <FaCheckDouble className="w-4 h-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBell className="text-gray-400 dark:text-gray-500 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications</h3>
          <p className="text-gray-500 dark:text-gray-400">You're all caught up! We'll notify you when something important happens.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id || n.id}
              className={`group relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer
                ${n.isRead 
                  ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700" 
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 border-l-4 border-l-primary"
                }`}
            >
              <div className="flex items-start gap-3">
                {/* Status indicator */}
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-2 h-2 rounded-full ${n.isRead ? "bg-gray-300 dark:bg-gray-600" : "bg-primary"}`}></div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${n.isRead ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-white font-medium"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(n._id || n.id);
                      }}
                      className="p-1 text-primary hover:text-primary/80 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                      aria-label="Mark as read"
                    >
                      <FaCheck className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
