import { Outlet } from "react-router-dom";
import LandlordSidebar from "../sidebar/LandlordSidebar";
import LandlordNavbar from "../navbar/LandlordNavbar";
import useSidebarToggle from "../../hooks/useSidebarToggle";

export default function LandlordLayout() {
  const { isOpen, toggle } = useSidebarToggle();

  return (
    <div className="flex h-screen bg-background dark:bg-gray-900 text-text dark:text-white transition-colors duration-300">
      {/* Sidebar */}
      <div
        className={`absolute z-40 md:static bg-white dark:bg-gray-900 w-64 h-full transition-transform duration-300 border-r dark:border-gray-700 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <LandlordSidebar />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        <LandlordNavbar onToggle={toggle} />
        <main className="p-4 flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
