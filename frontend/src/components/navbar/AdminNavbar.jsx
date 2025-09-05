import { FaBars, FaBell, FaShieldAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationsContext";

export default function AdminNavbar({ onToggle, profile }) {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const name = profile?.name || "Admin";
  const src = profile?.profileImage || "";

  return (
    <nav className="flex items-center justify-between px-4 h-16 border-b shadow-sm bg-white dark:bg-gray-900 dark:text-white">
      <button onClick={onToggle} className="text-gray-600 dark:text-gray-200 md:hidden">
        <FaBars size={20} />
      </button>

      <h1 className="text-lg font-bold text-primary dark:text-white">Admin Panel</h1>

      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/notifications")} className="relative" aria-label="Notifications">
          <FaBell size={20} className="text-gray-700 dark:text-gray-200" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
              {unreadCount}
            </span>
          )}
        </button>

        <button onClick={() => navigate("/admin/profile")} aria-label="Open profile" className="rounded-full">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <FaShieldAlt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        </button>
      </div>
    </nav>
  );
}
