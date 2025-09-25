import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";
import { FaUsers, FaHome, FaFileAlt, FaMoneyBillWave, FaExclamationTriangle, FaCheckCircle, FaCreditCard, FaPlus, FaFileContract, FaClipboardList, FaBell } from "react-icons/fa";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalApplications: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    activeLeases: 0
  });
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("Admin");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch admin profile for name
      const profileData = await apiFetch("/admin/profile");
      if (profileData?.name) {
        setAdminName(profileData.name);
      }
      
      // Fetch dashboard statistics
      const statsData = await apiFetch("/admin/dashboard/stats");
      // Convert revenue from kobo to naira
      statsData.totalRevenue = statsData.totalRevenue / 100;
      setStats(statsData);

      // Fetch recent notifications (limit to 5 for dashboard)
      const notificationsData = await apiFetch("/admin/notifications?limit=5");
      setRecentNotifications(notificationsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action, id) => {
    try {
      switch (action) {
        case "verifyLandlord":
          await apiFetch(`/admin/landlords/${id}/verify`, { method: "PUT" });
          toast.success("Landlord verified successfully");
          break;
        case "approveProperty":
          await apiFetch(`/admin/properties/${id}/approve`, { method: "PUT" });
          toast.success("Property approved successfully");
          break;
        case "suspendUser":
          await apiFetch(`/admin/users/${id}/suspend`, { method: "PUT" });
          toast.success("User suspended successfully");
          break;
        default:
          break;
      }
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error performing action:", error);
      toast.error("Failed to perform action");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Welcome Section */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-500 to-teal-400 rounded-lg p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              {getGreeting()}, {adminName}! 👋
            </h1>
          </div>
          <div className="hidden md:block">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics (3 only) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <FaUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Properties</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProperties}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <FaHome className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">₦{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <FaMoneyBillWave className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/admin/users"
              className="flex items-center gap-3 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors group"
            >
              <div className="p-2 bg-teal-600 rounded-lg group-hover:bg-teal-700 transition-colors">
                <FaUsers className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Manage Users</p>
                <p className="text-sm text-gray-500">View all users</p>
              </div>
            </a>

            <a
              href="/admin/verifications"
              className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
            >
              <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                <FaCheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Verifications</p>
                <p className="text-sm text-gray-500">Review requests</p>
              </div>
            </a>

            <a
              href="/admin/properties"
              className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
            >
              <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors">
                <FaHome className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">All Properties</p>
                <p className="text-sm text-gray-500">Manage listings</p>
              </div>
            </a>

            <a
              href="/admin/applications"
              className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
            >
              <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
                <FaFileAlt className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Applications</p>
                <p className="text-sm text-gray-500">Review submissions</p>
              </div>
            </a>
          </div>
        </Card>

        {/* Recent Notifications - Compact */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Notifications</h2>
            <a 
              href="/admin/notifications" 
              className="text-primary hover:underline text-sm font-medium"
            >
              View All
            </a>
          </div>
          <div className="space-y-3">
            {recentNotifications.length > 0 ? (
              recentNotifications.slice(0, 3).map((notification) => (
                <div key={notification._id} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  notification.isRead 
                    ? 'bg-gray-50 dark:bg-gray-800' 
                    : 'bg-white dark:bg-gray-700 border-l-4 border-l-primary'
                }`}>
                  <div className={`p-1.5 rounded-full ${
                    notification.type === 'registration' ? 'bg-blue-100 dark:bg-blue-900' :
                    notification.type === 'property' ? 'bg-green-100 dark:bg-green-900' :
                    notification.type === 'application' ? 'bg-purple-100 dark:bg-purple-900' :
                    notification.type === 'payment' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    notification.type === 'verification' ? 'bg-orange-100 dark:bg-orange-900' :
                    'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {notification.type === 'registration' && <FaUsers className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                    {notification.type === 'property' && <FaHome className="w-3 h-3 text-green-600 dark:text-green-400" />}
                    {notification.type === 'application' && <FaFileAlt className="w-3 h-3 text-purple-600 dark:text-purple-400" />}
                    {notification.type === 'payment' && <FaCreditCard className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />}
                    {notification.type === 'verification' && <FaExclamationTriangle className="w-3 h-3 text-orange-600 dark:text-orange-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{notification.title}</p>
                    <p className="text-xs text-gray-500 truncate">{notification.message}</p>
                  </div>
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <FaBell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent notifications</p>
              </div>
            )}
          </div>
        </Card>
      </div>

    </div>
  );
}
