import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import LandlordSidebar from "../sidebar/LandlordSidebar";
import LandlordNavbar from "../navbar/LandlordNavbar";
import { apiFetch } from "../../lib/api";
import useDarkMode from "../../hooks/useDarkMode";

export default function LandlordLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [shellLoading, setShellLoading] = useState(true);
  const location = useLocation();
  
  // Initialize dark mode
  useDarkMode();

  const isMessagesPage = location.pathname.startsWith("/landlord/messages");

  useEffect(() => {
    (async () => {
      try {
        setShellLoading(true);
        const [me, counts] = await Promise.all([
          apiFetch("/users/profile"),
          apiFetch("/notifications/unread-counts").catch(() => ({ total: 0 })),
        ]);
        setProfile(me || null);
        setUnreadCount(counts?.total || 0);
      } catch (e) {
        setProfile(null);
        setUnreadCount(0);
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
        <LandlordSidebar />
      </div>

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
