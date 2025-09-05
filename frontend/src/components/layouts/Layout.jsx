import { Outlet } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import Sidebar from "../sidebar/Sidebar";

export default function Layout({ showNavbar = true, showSidebar = true }) {
  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}

      <div className="flex-1 flex flex-col">
        {showNavbar && <Navbar />}
        
        <main className="flex-1 p-4 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
