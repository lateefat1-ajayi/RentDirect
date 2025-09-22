import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Logo from "../../assets/logo.png";
import Button from "../ui/Button";

export default function LandingNavbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    
    if (token && userData._id) {
      setIsAuthenticated(true);
      setUser(userData);
    }
  }, []);

  const getDashboardLink = () => {
    if (!user) return "/auth/login";
    
    switch (user.role) {
      case "landlord":
        return "/landlord/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/user/dashboard";
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={Logo} alt="RentDirect Logo" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold text-primary dark:text-yellow-400">RentDirect</span>
        </Link>

        {/* Center: Links */}
        <nav className="hidden md:flex gap-6 text-sm mx-auto">
          <Link to="/" className="hover:text-primary dark:hover:text-yellow-400">Home</Link>
          <Link to="/about" className="hover:text-primary dark:hover:text-yellow-400">About</Link>
          <Link to="/faq" className="hover:text-primary dark:hover:text-yellow-400">FAQ</Link>
          <Link to="/contact" className="hover:text-primary dark:hover:text-yellow-400">Contact</Link>
        </nav>

        {/* Right: Buttons */}
        <div className="hidden md:flex gap-3 items-center">
          {isAuthenticated ? (
            <Link to="/auth/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
          ) : (
            <>
              <Link to="/auth/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/auth/register">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
