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

  const [stats, setStats] = useState([
    { id: 1, label: "Active Applications", value: 0, link: "/user/applications", icon: <FaFileSignature className="text-emerald-600" /> },
    { id: 2, label: "Leases", value: 0, link: "/user/leases", icon: <FaHandshake className="text-blue-600" /> },
    { id: 3, label: "Payments", value: 0, link: "/user/payments", icon: <FaMoneyBillWave className="text-amber-600" /> },
    { id: 4, label: "Messages", value: 0, link: "/user/messages", icon: <FaComments className="text-slate-600" /> },
  ]);

  const { notifications } = useNotifications(); 

  useEffect(() => {
    (async () => {
      try {
        const apps = await apiFetch("/applications/tenant").catch(() => []);
        const leases = await apiFetch("/leases").catch(() => []);
        const payments = await apiFetch("/payments/history").catch(() => []);
        const msgs = await apiFetch("/conversations").catch(() => []);

        setStats((s) => s.map((item) => {
          if (item.label === "Active Applications") return { ...item, value: apps?.length || 0 };
          if (item.label === "Leases") return { ...item, value: leases?.length || 0 };
          if (item.label === "Payments") return { ...item, value: payments?.length || 0 };
          if (item.label === "Messages") return { ...item, value: msgs?.length || 0 };
          return item;
        }));
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Welcome back, {userName} 👋</h2>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.id} to={stat.link}>
            <Card className="p-4 hover:shadow-md transition flex items-center gap-3">
              <div className="text-xl">{stat.icon}</div>
              <div>
                <h3 className="text-lg font-semibold">{stat.value}</h3>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Notifications Preview */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <FaBell /> Recent Notifications
          {notifications.filter(n => !n.isRead).length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {notifications.filter(n => !n.isRead).length} new
            </span>
          )}
        </h3>
        {notifications.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">No recent notifications</div>
        ) : (
          <ul className="space-y-2">
            {notifications.slice(0, 5).map((n) => (
              <li key={n._id || n.id} className="text-sm flex items-start gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className={`mt-1 inline-block h-2 w-2 rounded-full flex-shrink-0 ${n.isRead ? "bg-gray-300 dark:bg-gray-600" : "bg-emerald-500"}`}></span>
                <div className="flex-1">
                  <p className={`${n.isRead ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-white font-medium"}`}>{n.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3">
          <Link to="/user/notifications">
            <Button size="sm" variant="outline">View all</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
