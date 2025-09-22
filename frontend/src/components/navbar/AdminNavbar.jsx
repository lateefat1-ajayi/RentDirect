import { FaBars, FaBell, FaShieldAlt, FaSignOutAlt, FaKey, FaUser, FaMoon, FaSun } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useNotifications } from "../../context/NotificationsContext";
import useDarkMode from "../../hooks/useDarkMode";
import { toast } from "react-toastify";

export default function AdminNavbar({ onToggle, profile }) {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [showDropdown, setShowDropdown] = useState(false);
  const name = profile?.name || "Admin";
  const src = profile?.profileImage || "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/auth/login");
  };

  const handleResetPassword = () => {
    navigate("/auth/forgot-password");
  };

  return (
    <nav className="flex items-center justify-between px-4 h-16 border-b shadow-sm bg-white dark:bg-gray-900 dark:text-white">
      <button onClick={onToggle} className="text-gray-600 dark:text-gray-200 md:hidden">
        <FaBars size={20} />
      </button>

      <div></div>

      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/notifications")} className="relative" aria-label="Notifications">
          <FaBell size={20} className="text-gray-700 dark:text-gray-200" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <button 
          onClick={() => setShowDropdown(!showDropdown)} 
          aria-label="Open profile menu" 
          className="relative"
        >
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <FaShieldAlt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-4 top-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2 w-48 z-50">
            <div className="px-4 py-2 border-b dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{profile?.email}</p>
            </div>
            
            <button
              onClick={() => {
                navigate("/admin/profile");
                setShowDropdown(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <FaUser className="w-4 h-4" />
              Profile
            </button>
            
            <button
              onClick={() => {
                toggleDarkMode();
                setShowDropdown(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              {isDark ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
            
            
          </div>
        )}
      </div>

      {/* Overlay to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  );
}
