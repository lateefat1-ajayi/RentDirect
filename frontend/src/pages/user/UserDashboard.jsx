import { Link, useOutletContext } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { FaFileSignature, FaHandshake, FaMoneyBillWave, FaComments, FaBell } from "react-icons/fa";
import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import { useNotifications } from "../../context/NotificationsContext";

export default function UserDashboard() {
  const { profile } = useOutletContext();
  const userName = profile?.name || "User";
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalApplications: 0,
    activeLeases: 0,
    totalPayments: 0,
    unreadMessages: 0
  });

  const { notifications } = useNotifications(); 

  useEffect(() => {
    (async () => {
      try {
        const apps = await apiFetch("/applications/tenant").catch(() => []);
        const leases = await apiFetch("/leases").catch(() => []);
        const payments = await apiFetch("/payments/history").catch(() => []);
        const msgs = await apiFetch("/conversations").catch(() => []);

        setStats({
          totalApplications: apps?.length || 0,
          activeLeases: leases?.length || 0,
          totalPayments: payments?.length || 0,
          unreadMessages: msgs?.filter(msg => !msg.isRead)?.length || 0
        });
      } catch (_) {}
      finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Welcome Section */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-500 to-teal-400 rounded-lg p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {getGreeting()}, {userName}! 👋
            </h2>
          </div>
          <div className="hidden md:block">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Applications</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalApplications}</p>
            </div>
            <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-full">
              <FaFileSignature className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Leases</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeLeases}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <FaHandshake className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
              <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread Messages</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.unreadMessages}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <FaComments className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
              </div>
            </Card>
      </div>

      {/* Recent Notifications */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Notifications</h2>
          <Link 
            to="/user/notifications" 
            className="text-primary hover:underline text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.slice(0, 3).map((notification) => (
              <div key={notification._id || notification.id} className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                notification.isRead 
                  ? 'bg-gray-50 dark:bg-gray-800' 
                  : 'bg-white dark:bg-gray-700 border-l-4 border-l-primary'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    notification.type === 'application' ? 'bg-teal-100 dark:bg-teal-900' :
                    notification.type === 'lease' ? 'bg-green-100 dark:bg-green-900' :
                    notification.type === 'payment' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    notification.type === 'message' ? 'bg-purple-100 dark:bg-purple-900' :
                    'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {notification.type === 'application' && <FaFileSignature className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                    {notification.type === 'lease' && <FaHandshake className="w-4 h-4 text-green-600 dark:text-green-400" />}
                    {notification.type === 'payment' && <FaMoneyBillWave className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />}
                    {notification.type === 'message' && <FaComments className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                  </div>
      <div>
                    <p className="font-medium text-gray-900 dark:text-white">{notification.title || 'Notification'}</p>
                    <p className="text-sm text-gray-500">{notification.message}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{new Date(notification.createdAt).toLocaleString()}</span>
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent notifications</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
