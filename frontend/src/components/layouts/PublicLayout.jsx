import { Outlet } from "react-router-dom";
import LandingNavbar from "../landing/LandingNavbar";
import Footer from "../landing/Footer";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-gray-950 dark:text-white">
      <LandingNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
