import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-10 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1 */}
        <div>
          <h3 className="text-xl font-bold text-primary dark:text-yellow-400 mb-2">RentDirect</h3>
          <p className="text-sm">
            Connecting tenants and landlords with tools to ensure trust and prevent property damage.
          </p>
        </div>

        {/* Column 2: Navigation */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-primary dark:hover:text-yellow-400">Home</Link></li>
            <li><Link to="/faq" className="hover:text-primary dark:hover:text-yellow-400">FAQs</Link></li>
            <li><Link to="/login" className="hover:text-primary dark:hover:text-yellow-400">Login</Link></li>
            <li><Link to="/register" className="hover:text-primary dark:hover:text-yellow-400">Register</Link></li>
          </ul>
        </div>

        {/* Column 3: Contact */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Contact</h4>
          <p className="text-sm">Email: support@rentdirect.ng</p>
          <p className="text-sm">Phone: +234 901 234 5678</p>
        </div>
      </div>

      <div className="mt-10 text-center text-xs text-gray-500 dark:text-gray-400">
        &copy; {currentYear} RentDirect. All rights reserved.
      </div>
    </footer>
  );
}
