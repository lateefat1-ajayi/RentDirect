import { Link, useLocation } from "react-router-dom";
import { FaHome, FaEnvelope, FaList, FaUsers, FaUser } from "react-icons/fa";
import { cn } from "../../lib/utils";
import Logo from "../../assets/logo.png";

export default function UserSidebar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    cn(
      "flex items-center gap-3 px-4 py-2 rounded transition-all text-sm",
      pathname === path
        ? "bg-primary/10 text-primary font-semibold dark:bg-gray-800 dark:text-white"
        : "text-gray-700 hover:bg-primary/10 dark:text-gray-300 dark:hover:bg-gray-800"

    );

  return (
    <aside className="flex flex-col h-full w-64 p-4 space-y-4 bg-background border-r dark:bg-gray-900 dark:border-gray-700">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 mb-6">
        <img src={Logo} alt="RentDirect Logo" className="h-8 w-8 object-contain" />
        <span className="text-lg font-bold text-primary dark:text-white">RentDirect</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        <Link to="/user/dashboard" className={linkClass("/user/dashboard")}>
          <FaHome className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        <Link to="/user/messages" className={linkClass("/user/messages")}>
          <FaEnvelope className="w-4 h-4" />
          <span>Messages</span>
        </Link>

        <Link to="/user/notifications" className={linkClass("/user/notifications")}>
          <FaList className="w-4 h-4" />
          <span>Notifications</span>
        </Link>

        <Link to="/user/applications" className={linkClass("/user/applications")}>
          <FaUsers className="w-4 h-4" />
          <span>Applications</span>
        </Link>

        <Link to="/user/profile" className={linkClass("/user/profile")}>
          <FaUser className="w-4 h-4" />
          <span>Profile</span>
        </Link>
      </nav>
    </aside>
  );
}
