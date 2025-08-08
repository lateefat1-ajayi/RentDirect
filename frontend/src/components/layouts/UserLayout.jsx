import { Outlet } from "react-router-dom";
import UserSidebar from "../sidebar/UserSidebar";
import UserNavbar from "../navbar/UserNavbar";
import useSidebarToggle from "../../hooks/useSidebarToggle";

export default function UserLayout() {
  const { isOpen, toggle } = useSidebarToggle();

  return (
    <div className="flex h-screen bg-background dark:bg-primaryDark text-text dark:text-white transition-colors duration-300">
      {/* Sidebar */}
      <div
        className={`absolute z-40 md:static bg-white dark:bg-gray-800 w-64 h-full transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <UserSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <UserNavbar onToggle={toggle} />

        <main className="p-4 flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
