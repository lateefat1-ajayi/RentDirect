import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaEnvelope,
  FaBell,
  FaFileContract,
  FaUser,
  FaCog,
  FaBuilding,
  FaUsers,
  FaStar,
  FaCreditCard,
  FaQuestionCircle
} from "react-icons/fa";
import { cn } from "../../lib/utils";
import Logo from "../../assets/logo.png";

export default function LandlordSidebar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    cn(
      "flex items-center gap-3 px-4 py-2 rounded transition-all text-sm",
      pathname.startsWith(path)
        ? "bg-primary/10 text-primary font-semibold dark:bg-gray-800 dark:text-white"
        : "text-gray-700 hover:bg-primary/10 dark:text-gray-300 dark:hover:bg-gray-800"
    );

  return (
    <aside className="flex flex-col justify-between h-full w-64 p-4 bg-background dark:bg-gray-900 border-r dark:border-gray-700">
      {/* Top */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <img src={Logo} alt="RentDirect" className="h-8 w-8 object-contain" />
          <span className="text-lg font-bold text-primary dark:text-white">RentDirect</span>
        </div>

        {/* Nav */}
        <nav className="space-y-2">
          <Link to="/landlord/dashboard" className={linkClass("/landlord/dashboard")}>
            <FaHome className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <Link to="/landlord/messages" className={linkClass("/landlord/messages")}>
            <FaEnvelope className="w-4 h-4" />
            <span>Messages</span>
          </Link>

          <Link to="/landlord/listings" className={linkClass("/landlord/listings")}>
            <FaBuilding className="w-4 h-4" />
            <span>Listings</span>
          </Link>

          <Link to="/landlord/applicants" className={linkClass("/landlord/applicants")}>
            <FaUsers className="w-4 h-4" />
            <span>Applicants</span>
          </Link>

          <Link to="/landlord/leases" className={linkClass("/landlord/leases")}>
            <FaFileContract className="w-4 h-4" />
            <span>Leases</span>
          </Link>

          <Link to="/landlord/reviews" className={linkClass("/landlord/reviews")}>
            <FaStar className="w-4 h-4" />
            <span>Reviews</span>
          </Link>

          <Link to="/landlord/transactions" className={linkClass("/landlord/transactions")}>
            <FaCreditCard className="w-4 h-4" />
            <span>Transactions</span>
          </Link>
          <Link to="/landlord/notifications" className={linkClass("/landlord/notifications")}>
            <FaBell className="w-4 h-4" />
            <span>Notifications</span>
          </Link>

          <Link to="/landlord/contact-history" className={linkClass("/landlord/contact-history")}>
            <FaQuestionCircle className="w-4 h-4" />
            <span>Contact History</span>
          </Link>

        </nav>
      </div>

      {/* Bottom */}
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
        <Link to="/landlord/profile" className={linkClass("/landlord/profile")}>
          <FaUser className="w-4 h-4" />
          <span>Profile</span>
        </Link>
        <Link to="/landlord/settings" className={linkClass("/landlord/settings")}>
          <FaCog className="w-4 h-4" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
