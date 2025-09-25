import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import LandlordSidebar from "../sidebar/LandlordSidebar";
import LandlordNavbar from "../navbar/LandlordNavbar";
import { apiFetch } from "../../lib/api";
import useDarkMode from "../../hooks/useDarkMode";
import { useNotifications } from "../../context/NotificationsContext";

export default function LandlordLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [shellLoading, setShellLoading] = useState(true);
  const location = useLocation();
  const { unreadCount } = useNotifications();
  
  // Initialize dark mode
  useDarkMode();

  const isMessagesPage = location.pathname.startsWith("/landlord/messages");
  const [showFab, setShowFab] = useState(false);
  const [fabTarget, setFabTarget] = useState("reviews"); // 'reviews' | 'contacts'

  useEffect(() => {
    (async () => {
      try {
        setShellLoading(true);
        const me = await apiFetch("/users/profile");
        setProfile(me || null);
      } catch (e) {
        setProfile(null);
      } finally {
        setShellLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex h-screen bg-background dark:bg-primaryDark text-text dark:text-white transition-colors duration-300">
      {/* Sidebar */}
      <div
        className={`absolute z-40 md:static bg-white dark:bg-gray-900 w-64 h-full transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 border-r dark:border-gray-700`}
      >
        <LandlordSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <LandlordNavbar
          onToggle={() => setSidebarOpen((s) => !s)}
          unreadCount={unreadCount}
          profile={profile}
        />

        {shellLoading ? (
          <div className="flex-1 grid place-items-center bg-gray-50 dark:bg-gray-900">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Loading your workspace…
            </div>
          </div>
        ) : (
          <main
            className={`flex-1 ${isMessagesPage ? "overflow-hidden" : "p-4 overflow-y-auto"} bg-gray-50 dark:bg-gray-900`}
          >
            <Outlet context={{ profile, setProfile, unreadCount }} />
          </main>
        )}
      </div>
    </div>
  );
}
