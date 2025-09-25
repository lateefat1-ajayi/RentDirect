import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { FaFileSignature, FaUsers, FaFileContract, FaStar, FaComments, FaBell, FaMoneyBillWave, FaShieldAlt, FaExclamationTriangle, FaSync, FaPlus, FaHome, FaClipboardList } from "react-icons/fa";
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
          totalRevenue: totalRev / 100, // Convert from kobo to naira
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
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.3) 2px, transparent 0)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
          
          <div className="relative p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  profile?.verificationStatus === "pending" 
                    ? "bg-amber-100 dark:bg-amber-900/30" 
                    : "bg-blue-100 dark:bg-blue-900/30"
                }`}>
              {profile?.verificationStatus === "pending" ? (
                    <FaClock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              ) : (
                    <FaShieldAlt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              )}
                </div>
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {profile?.verificationStatus === "pending" 
                      ? "Verification Under Review" 
                      : "Complete Your Verification"
                }
              </h3>
                  {profile?.verificationStatus === "pending" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                {profile?.verificationStatus === "pending" 
                    ? "Our team is reviewing your verification documents. This usually takes 1-3 business days. You'll receive an email notification once approved."
                    : "Verify your identity to start listing properties and building trust with potential tenants. The process is quick and secure."
                }
              </p>
                <div className="flex items-center gap-3">
                {profile?.verificationStatus !== "pending" && (
                  <Link to="/landlord/verification">
                      <Button variant="primary" className="flex items-center gap-2 px-4 py-2">
                      <FaShieldAlt className="w-4 h-4" />
                        Start Verification
                    </Button>
                  </Link>
                )}
                <Button 
                    variant="outline" 
                  onClick={refreshProfile}
                    className="p-2 border-gray-300 dark:border-gray-600"
                    title="Refresh Status"
                    aria-label="Refresh Status"
                >
                                     <FaSync className="w-4 h-4" />
                </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Properties</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProperties}</p>
            </div>
            <div className="p-2 sm:p-3 bg-teal-100 dark:bg-teal-900 rounded-full">
              <FaFileSignature className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Pending Applications</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingApplications}</p>
            </div>
            <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <FaUsers className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">₦{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <FaMoneyBillWave className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <Link
              to="/landlord/listings?action=add"
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors group"
            >
              <div className="p-1.5 sm:p-2 bg-teal-600 rounded-lg group-hover:bg-teal-700 transition-colors">
                <FaPlus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Add Property</p>
                <p className="text-xs sm:text-sm text-gray-500">List new rental</p>
              </div>
            </Link>

            <Link
              to="/landlord/applicants"
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
            >
              <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                <FaUsers className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">View Applicants</p>
                <p className="text-xs sm:text-sm text-gray-500">Review applications</p>
              </div>
            </Link>

            <Link
              to="/landlord/leases"
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
            >
              <div className="p-1.5 sm:p-2 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors">
                <FaFileContract className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Manage Leases</p>
                <p className="text-xs sm:text-sm text-gray-500">Active agreements</p>
              </div>
            </Link>

            <Link
              to="/landlord/listings"
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
            >
              <div className="p-1.5 sm:p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
                <FaHome className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">My Properties</p>
                <p className="text-xs sm:text-sm text-gray-500">Manage listings</p>
              </div>
            </Link>
          </div>
        </Card>

        {/* Recent Notifications - Compact */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Recent Notifications</h2>
            <Link 
              to="/landlord/notifications" 
              className="text-primary hover:underline text-xs sm:text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {notifications.length > 0 ? (
              notifications.slice(0, 3).map((notification) => (
                <div key={notification._id} className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-all ${
                  notification.isRead 
                    ? 'bg-gray-50 dark:bg-gray-800' 
                    : 'bg-white dark:bg-gray-700 border-l-4 border-l-primary'
                }`}>
                  <div className={`p-1 sm:p-1.5 rounded-full ${
                    notification.type === 'application' ? 'bg-blue-100 dark:bg-blue-900' :
                    notification.type === 'property' ? 'bg-green-100 dark:bg-green-900' :
                    notification.type === 'payment' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    notification.type === 'message' ? 'bg-purple-100 dark:bg-purple-900' :
                    notification.type === 'verification' ? 'bg-orange-100 dark:bg-orange-900' :
                    notification.type === 'review' ? 'bg-pink-100 dark:bg-pink-900' :
                    'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {notification.type === 'application' && <FaFileSignature className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-teal-600 dark:text-teal-400" />}
                    {notification.type === 'property' && <FaHome className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600 dark:text-green-400" />}
                    {notification.type === 'payment' && <FaMoneyBillWave className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-600 dark:text-yellow-400" />}
                    {notification.type === 'message' && <FaComments className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 dark:text-purple-400" />}
                    {notification.type === 'verification' && <FaShieldAlt className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-600 dark:text-orange-400" />}
                    {notification.type === 'review' && <FaStar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-pink-600 dark:text-pink-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">{notification.title || 'Notification'}</p>
                      {getNotificationBadge(notification.type)}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{notification.message}</p>
                  </div>
                  {!notification.isRead && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0"></span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 sm:py-6 text-gray-500">
                <FaBell className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs sm:text-sm">No recent notifications</p>
              </div>
            )}
          </div>
        </Card>
      </div>

    </div>
  );
}
