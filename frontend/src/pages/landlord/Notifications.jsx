// src/pages/landlord/LandlordNotifications.jsx
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { FaBell, FaCheck, FaCheckDouble, FaFileSignature, FaHome, FaMoneyBillWave, FaComments, FaShieldAlt, FaStar } from "react-icons/fa";
import { useNotifications } from "../../context/NotificationsContext";
import { toast } from "react-toastify";

export default function LandlordNotifications() {
  const { notifications, markAsRead, markAllAsRead, loading, unreadCount } = useNotifications();

  const getNotificationBadge = (type) => {
    switch (type) {
      case "application":
        return <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">Application</span>;
      case "property":
        return <span className="px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">Property</span>;
      case "payment":
        return <span className="px-1.5 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">Payment</span>;
      case "message":
        return <span className="px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">Message</span>;
      case "verification":
        return <span className="px-1.5 py-0.5 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full">Verification</span>;
      case "review":
        return <span className="px-1.5 py-0.5 text-xs bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 rounded-full">Review</span>;
      default:
        return null;
    }
  };

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
          <div className="p-2">
            <FaBell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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
              className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-all ${
                n.isRead 
                  ? 'bg-gray-50 dark:bg-gray-800' 
                  : 'bg-white dark:bg-gray-700 border-l-4 border-l-primary'
              }`}
            >
              <div className={`p-1 sm:p-1.5 rounded-full ${
                n.type === 'application' ? 'bg-blue-100 dark:bg-blue-900' :
                n.type === 'property' ? 'bg-green-100 dark:bg-green-900' :
                n.type === 'payment' ? 'bg-yellow-100 dark:bg-yellow-900' :
                n.type === 'message' ? 'bg-purple-100 dark:bg-purple-900' :
                n.type === 'verification' ? 'bg-orange-100 dark:bg-orange-900' :
                n.type === 'review' ? 'bg-pink-100 dark:bg-pink-900' :
                'bg-gray-100 dark:bg-gray-700'
              }`}>
                {n.type === 'application' && <FaFileSignature className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600 dark:text-blue-400" />}
                {n.type === 'property' && <FaHome className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600 dark:text-green-400" />}
                {n.type === 'payment' && <FaMoneyBillWave className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-600 dark:text-yellow-400" />}
                {n.type === 'message' && <FaComments className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 dark:text-purple-400" />}
                {n.type === 'verification' && <FaShieldAlt className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-600 dark:text-orange-400" />}
                {n.type === 'review' && <FaStar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-pink-600 dark:text-pink-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">{n.title || 'Notification'}</p>
                  {getNotificationBadge(n.type)}
                  {!n.isRead && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0"></span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mb-1">{n.message}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
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
