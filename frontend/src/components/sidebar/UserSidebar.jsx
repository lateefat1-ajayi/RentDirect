import { Link, useLocation } from "react-router-dom";
import {
  FaHome, FaEnvelope, FaUsers, FaCreditCard, FaHeart,
  FaFileContract, FaSearch, FaUser, FaCog, FaStar, FaBell, FaQuestionCircle
} from "react-icons/fa";
import { cn } from "../../lib/utils";
import Logo from "../../assets/logo.png";

export default function UserSidebar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    cn(
      "flex items-center gap-3 px-4 py-2 rounded transition-all text-sm",
      pathname.startsWith(path)
        ? "bg-primary/10 text-primary font-semibold dark:bg-gray-800 dark:text-white"
        : "text-gray-700 hover:bg-primary/10 dark:text-gray-300 dark:hover:bg-gray-800"
    );

  return (
    <aside className="flex flex-col h-full w-64 bg-background dark:bg-gray-900 border-r dark:border-gray-700">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <img src={Logo} alt="RentDirect" className="h-8 w-8 object-contain" />
        <span className="text-lg font-bold text-primary dark:text-white">RentDirect</span>
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
        <Link to="/user/dashboard" className={linkClass("/user/dashboard")}>
          <FaHome className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        <Link to="/user/messages" className={linkClass("/user/messages")}>
          <FaEnvelope className="w-4 h-4" />
          <span>Messages</span>
        </Link>

        <Link to="/user/notifications" className={linkClass("/user/notifications")}>
          <FaBell className="w-4 h-4" />
          <span>Notifications</span>
        </Link>

        <Link to="/user/applications" className={linkClass("/user/applications")}>
          <FaUsers className="w-4 h-4" />
          <span>Applications</span>
        </Link>

        <Link to="/user/leases" className={linkClass("/user/leases")}>
          <FaFileContract className="w-4 h-4" />
          <span>Leases</span>
        </Link>

        <Link to="/user/payments" className={linkClass("/user/payments")}>
          <FaCreditCard className="w-4 h-4" />
          <span>Payments</span>
        </Link>

        <Link to="/user/favorites" className={linkClass("/user/favorites")}>
          <FaHeart className="w-4 h-4" />
          <span>Saved</span>
        </Link>

        <Link to="/user/reviews" className={linkClass("/user/reviews")}>
          <FaStar className="w-4 h-4" />
          <span>Reviews</span>
        </Link>

        <Link to="/user/contact-history" className={linkClass("/user/contact-history")}>
          <FaQuestionCircle className="w-4 h-4" />
          <span>Contact History</span>
        </Link>

        <Link to="/user/properties" className={linkClass("/user/properties")}>
          <FaSearch className="w-4 h-4" />
          <span>Browse Properties</span>
        </Link>
      </div>

      {/* Fixed bottom */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
        <Link to="/user/profile" className={linkClass("/user/profile")}>
          <FaUser className="w-4 h-4" />
          <span>Profile</span>
        </Link>
        <Link to="/user/settings" className={linkClass("/user/settings")}>
          <FaCog className="w-4 h-4" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
