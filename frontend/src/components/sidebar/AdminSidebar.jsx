import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaEnvelope, FaUserShield, FaUser, FaBuilding, FaFileAlt, FaChartBar, FaBell, FaSignOutAlt } from "react-icons/fa";
import { cn } from "../../lib/utils";
import Logo from "../../assets/logo.png";

export default function AdminSidebar({ onClose }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  const linkClass = (path) =>
    cn(
      "flex items-center gap-3 px-4 py-2 rounded transition-all text-sm",
      pathname === path
        ? "bg-primary/10 text-primary font-semibold dark:bg-gray-800 dark:text-white"
        : "text-gray-700 hover:bg-primary/10 dark:text-gray-300 dark:hover:bg-gray-800"
    );

  return (
    <aside className="flex flex-col h-full w-64 bg-background dark:bg-gray-900 border-r dark:border-gray-700">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 px-4 py-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">RD</span>
        </div>
        <span className="text-lg font-bold text-primary dark:text-white">RentDirect</span>
      </Link>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
        <Link to="/admin/dashboard" className={linkClass("/admin/dashboard")} onClick={onClose}>
          <FaHome className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        <Link to="/admin/users" className={linkClass("/admin/users")} onClick={onClose}>
          <FaUserShield className="w-4 h-4" />
          <span>Users</span>
        </Link>

        <Link to="/admin/contacts" className={linkClass("/admin/contacts")} onClick={onClose}>
          <FaEnvelope className="w-4 h-4" />
          <span>Contacts</span>
        </Link>


        <Link to="/admin/landlords" className={linkClass("/admin/landlords")} onClick={onClose}>
          <FaBuilding className="w-4 h-4" />
          <span>Verification</span>
        </Link>

        <Link to="/admin/properties" className={linkClass("/admin/properties")} onClick={onClose}>
          <FaFileAlt className="w-4 h-4" />
          <span>Review Properties</span>
        </Link>

        <Link to="/admin/reports" className={linkClass("/admin/reports")} onClick={onClose}>
          <FaChartBar className="w-4 h-4" />
          <span>View Reports</span>
        </Link>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded transition-all text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <FaSignOutAlt className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}
