import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { FaFileSignature, FaUsers, FaFileContract, FaStar, FaComments, FaBell, FaMoneyBillWave, FaShieldAlt, FaExclamationTriangle, FaSync } from "react-icons/fa";
import { useNotifications } from "../../context/NotificationsContext";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";

export default function LandlordDashboard() {
  const { profile, setProfile } = useOutletContext();
  const landlordName = profile?.name || "Landlord";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    pendingApplications: 0,
    activeLeases: 0,
    totalRevenue: 0,
    unreadMessages: 0,
    averageRating: 0
  });

  const { notifications } = useNotifications();

  const refreshProfile = async () => {
    try {
      const updatedProfile = await apiFetch("/users/profile");
      setProfile(updatedProfile);
      toast.success("Profile refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing profile:", error);
      toast.error("Failed to refresh profile");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        console.log("Fetching landlord dashboard data...");
        
        const listings = await apiFetch("/property/landlord/me").catch((error) => {
          console.error("Error fetching listings:", error);
          return [];
        });
        
        const applicants = await apiFetch("/applications/landlord").catch((error) => {
          console.error("Error fetching applicants:", error);
          return [];
        });
        
        const leases = await apiFetch("/leases").catch((error) => {
          console.error("Error fetching leases:", error);
          return [];
        });
        
        const reviews = await apiFetch("/reviews/landlord").catch((error) => {
          console.error("Error fetching reviews:", error);
          return [];
        });
        const messages = await apiFetch("/conversations").catch((error) => {
          console.error("Error fetching messages:", error);
          return [];
        });
        const transactions = await apiFetch("/payments/landlord").catch((error) => {
          console.error("Error fetching transactions:", error);
          return [];
        });

        console.log("Landlord Dashboard Data:", {
          listings: listings?.length || 0,
          applicants: applicants?.length || 0,
          leases: leases?.length || 0,
          reviews: reviews?.length || 0,
          messages: messages?.length || 0,
          transactions: transactions?.length || 0
        });

        console.log("Raw data samples:", {
          listings: listings?.slice(0, 2),
          applicants: applicants?.slice(0, 2),
          leases: leases?.slice(0, 2),
          messages: messages?.slice(0, 2)
        });

        const pendingApps = applicants?.filter(app => app.status === 'pending')?.length || 0;
        const activeLeaseCount = leases?.filter(lease => lease.status === 'active')?.length || 0;
        const unreadMsgCount = messages?.filter(msg => !msg.isRead)?.length || 0;
        const totalRev = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
        const avgRating = reviews?.length > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0;

        setStats({
          totalProperties: listings?.length || 0,
          pendingApplications: pendingApps,
          activeLeases: activeLeaseCount,
          totalRevenue: totalRev,
          unreadMessages: unreadMsgCount,
          averageRating: Math.round(avgRating * 10) / 10
        });
      } catch (error) {
        console.error("Error fetching landlord dashboard data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
              {getGreeting()}, {landlordName}! 👋
            </h2>
          </div>
          <div className="hidden md:block">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Status Banner */}
      {profile?.verificationStatus !== "approved" && (
        <Card className="p-6 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {profile?.verificationStatus === "pending" ? (
                <FaExclamationTriangle className="w-6 h-6 text-yellow-600" />
              ) : (
                <FaShieldAlt className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {profile?.verificationStatus === "pending" 
                  ? "Verification Pending" 
                  : "Verification Required"
                }
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {profile?.verificationStatus === "pending" 
                  ? "Your verification documents are being reviewed by our admin team. You'll be notified once the review is complete."
                  : "You need to verify your account before you can start listing properties. This helps ensure the safety and trust of our community."
                }
              </p>
              <div className="flex gap-2">
                {profile?.verificationStatus !== "pending" && (
                  <Link to="/landlord/verification">
                    <Button variant="primary" className="flex items-center gap-2">
                      <FaShieldAlt className="w-4 h-4" />
                      Get Verified Now
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="secondary" 
                  onClick={refreshProfile}
                  className="flex items-center gap-2"
                >
                                     <FaSync className="w-4 h-4" />
                   Refresh Status
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Properties</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProperties}</p>
            </div>
            <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-full">
              <FaFileSignature className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Applications</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingApplications}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <FaUsers className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">₦{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <FaMoneyBillWave className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Notifications</h2>
          <Link 
            to="/landlord/notifications" 
            className="text-primary hover:underline text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.slice(0, 3).map((notification) => (
              <div key={notification._id} className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                notification.isRead 
                  ? 'bg-gray-50 dark:bg-gray-800' 
                  : 'bg-white dark:bg-gray-700 border-l-4 border-l-primary'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    notification.type === 'application' ? 'bg-blue-100 dark:bg-blue-900' :
                    notification.type === 'property' ? 'bg-green-100 dark:bg-green-900' :
                    notification.type === 'payment' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    notification.type === 'message' ? 'bg-purple-100 dark:bg-purple-900' :
                    notification.type === 'verification' ? 'bg-orange-100 dark:bg-orange-900' :
                    'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {notification.type === 'application' && <FaFileSignature className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                    {notification.type === 'property' && <FaHome className="w-4 h-4 text-green-600 dark:text-green-400" />}
                    {notification.type === 'payment' && <FaMoneyBillWave className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />}
                    {notification.type === 'message' && <FaComments className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                    {notification.type === 'verification' && <FaShieldAlt className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
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
