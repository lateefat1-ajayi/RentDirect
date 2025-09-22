import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../navbar/AdminNavbar";
import useSidebarToggle from "../../hooks/useSidebarToggle";
import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";

export default function AdminLayout() {
  const { isOpen, toggle, close } = useSidebarToggle();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      // Debug: Check what token we're using
      const token = localStorage.getItem("token");
      console.log("Admin Layout - Token being used:", token ? token.substring(0, 20) + "..." : "No token");
      
      // Fetch admin profile from backend to ensure it's always the correct admin
      const adminProfile = await apiFetch("/admin/profile");
      console.log("Admin Layout - Profile fetched:", adminProfile);
      setProfile(adminProfile);
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      if (error.message.includes("Access denied. Admins only")) {
        toast.error("Authentication error. Please log out and log back in as admin.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else {
        toast.error("Failed to load admin profile");
      }
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  return (
    <div className="flex h-screen bg-background dark:bg-gray-900 text-text dark:text-white transition-colors duration-300">
      {/* Sidebar */}
      <div
        className={`absolute z-40 md:static bg-white dark:bg-gray-900 w-64 h-full transition-transform duration-300 border-r dark:border-gray-700 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <AdminSidebar onClose={close} />
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={close}
        />
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        <AdminNavbar onToggle={toggle} profile={profile} />
                 <main
           className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900"
         >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
