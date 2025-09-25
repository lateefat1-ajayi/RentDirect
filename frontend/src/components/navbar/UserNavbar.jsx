import { FaBars, FaBell, FaMoon, FaSun, FaUser, FaCheck } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Avatar from "../../components/ui/Avatar";
import useDarkMode from "../../hooks/useDarkMode";
import { toast } from "react-toastify";
import { useNotifications } from "../../context/NotificationsContext";

export default function UserNavbar({ onToggle, profile, unreadCount }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const notificationRef = useRef(null);
  const name = profile?.name || "User";
  const src = profile?.profileImage || "";

  const getPageTitle = (pathname) => {
    const pathMap = {
      '/user/dashboard': 'Dashboard',
      '/user/properties': 'Properties',
      '/user/favorites': 'Favorites',
      '/user/applications': 'Applications',
      '/user/leases': 'Leases',
      '/user/messages': 'Messages',
      '/user/notifications': 'Notifications',
      '/user/payments': 'Payments',
      '/user/profile': 'Profile',
      '/user/settings': 'Settings'
    };
    
    return pathMap[pathname] || 'User Portal';
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/auth/login");
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowDropdown(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleResetPassword = () => {
    navigate("/auth/forgot-password");
  };

  return (
    <nav className="flex items-center justify-between px-3 sm:px-4 h-16 border-b shadow-sm bg-white dark:bg-gray-900 dark:text-white">
      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={onToggle} className="text-gray-600 dark:text-gray-200 md:hidden">
          <FaBars size={18} />
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => navigate("/user/notifications")}
          className="relative p-1"
          aria-label="Notifications"
        >
          <FaBell size={18} className={unreadCount > 0 ? "text-primary" : "text-gray-700 dark:text-gray-200"} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <button 
          onClick={() => setShowDropdown(!showDropdown)} 
          aria-label="Open profile menu" 
          className="relative"
        >
          <Avatar name={name} src={src} size="w-8 h-8 sm:w-10 sm:h-10" />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-2 sm:right-4 top-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2 w-44 sm:w-48 z-50">
            <div className="px-4 py-2 border-b dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{profile?.email}</p>
            </div>
            
            <button
              onClick={() => {
                navigate("/user/profile");
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
