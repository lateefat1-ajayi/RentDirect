import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import UserSidebar from "../sidebar/UserSidebar";
import UserNavbar from "../navbar/UserNavbar";
import { apiFetch } from "../../lib/api";
import useDarkMode from "../../hooks/useDarkMode";

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [shellLoading, setShellLoading] = useState(true);
  const location = useLocation();
  
  // Initialize dark mode
  useDarkMode();

  const isMessagesPage = location.pathname.startsWith("/user/messages");

  const fetchProfile = async () => {
    try {
      setShellLoading(true);
              const [me, counts] = await Promise.all([
          apiFetch("/users/profile"),
          apiFetch("/notifications/unread-counts").catch(() => ({ unreadCount: 0 })),
        ]);
      console.log("UserLayout - Profile fetched:", me);
      setProfile(me || null);
      setUnreadCount(counts?.unreadCount || 0);
    } catch (e) {
      console.error("UserLayout - Error fetching profile:", e);
      setProfile(null);
      setUnreadCount(0);
    } finally {
      setShellLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="flex h-screen bg-background dark:bg-primaryDark text-text dark:text-white transition-colors duration-300">
      {/* Sidebar */}
      <div
        className={`absolute z-40 md:static bg-white dark:bg-gray-900 w-64 h-full transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 border-r dark:border-gray-700`}
      >
        <UserSidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <UserNavbar
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
            <Outlet context={{ profile, setProfile, unreadCount, refreshProfile: fetchProfile }} />
          </main>
        )}
      </div>
    </div>
  );
}
