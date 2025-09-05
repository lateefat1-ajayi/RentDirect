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
  const [stats, setStats] = useState([
    { id: 1, label: "My Listings", value: 0, link: "/landlord/listings", icon: <FaFileSignature className="text-blue-600" /> },
    { id: 2, label: "Applicants", value: 0, link: "/landlord/applicants", icon: <FaUsers className="text-emerald-600" /> },
    { id: 3, label: "Leases", value: 0, link: "/landlord/leases", icon: <FaFileContract className="text-indigo-600" /> },
    { id: 4, label: "Reviews", value: 0, link: "/landlord/reviews", icon: <FaStar className="text-amber-600" /> },
    { id: 5, label: "Messages", value: 0, link: "/landlord/messages", icon: <FaComments className="text-slate-600" /> },
    { id: 6, label: "Transactions", value: 0, link: "/landlord/transactions", icon: <FaMoneyBillWave className="text-green-600" /> },
  ]);

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

        setStats((s) => s.map((item) => {
          if (item.label === "My Listings") return { ...item, value: listings?.length || 0 };
          if (item.label === "Applicants") return { ...item, value: applicants?.length || 0 };
          if (item.label === "Leases") return { ...item, value: leases?.length || 0 };
          if (item.label === "Reviews") return { ...item, value: reviews?.length || 0 };
          if (item.label === "Messages") return { ...item, value: messages?.length || 0 };
          if (item.label === "Transactions") return { ...item, value: transactions?.length || 0 };
          return item;
        }));
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Welcome back, {landlordName} 👋</h2>

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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link key={stat.id} to={stat.link}>
            <Card className="p-4 flex items-center gap-3 hover:shadow-md transition">
              <div className="text-xl">{stat.icon}</div>
              <div>
                <h3 className="text-lg font-semibold">{stat.value}</h3>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Notifications */}
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <FaBell /> Recent Notifications
          {notifications.filter(n => !n.isRead).length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {notifications.filter(n => !n.isRead).length} new
            </span>
          )}
        </h3>
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No recent notifications</p>
        ) : (
          <ul className="space-y-2">
            {notifications.slice(0, 3).map((n) => (
              <li key={n._id} className="text-sm flex items-start gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className={`mt-1 inline-block h-2 w-2 rounded-full flex-shrink-0 ${n.isRead ? "bg-gray-300 dark:bg-gray-600" : "bg-emerald-500"}`}></span>
                <div className="flex-1">
                  <p className={`${n.isRead ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-white font-medium"}`}>{n.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2">
          <Link to="/landlord/notifications">
            <Button size="sm" variant="outline">View all</Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {profile?.verificationStatus === "approved" ? (
            <Link to="/landlord/listings">
              <Button variant="primary">Add / Manage Listings</Button>
            </Link>
          ) : (
            <Button 
              variant="primary" 
              disabled 
              className="opacity-50 cursor-not-allowed"
              title="Account verification required to list properties"
            >
              Add / Manage Listings
            </Button>
          )}
          <Link to="/landlord/applicants">
            <Button variant="secondary">View Applicants</Button>
          </Link>
          <Link to="/landlord/transactions">
            <Button variant="secondary">Transactions</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
