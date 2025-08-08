import { FaBars, FaMoon, FaSun } from "react-icons/fa";
import useDarkMode from "../../hooks/useDarkMode";

export default function LandlordNavbar({ onToggle }) {
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <nav className="flex items-center justify-between px-4 h-16 border-b shadow-sm bg-white dark:bg-gray-900 dark:text-white">
      <button onClick={onToggle} className="text-gray-600 dark:text-gray-200 md:hidden">
        <FaBars size={20} />
      </button>

      <h1 className="text-lg font-bold text-primary dark:text-white">Landlord Dashboard</h1>

      <button
        onClick={toggleDarkMode}
        className="text-gray-600 dark:text-gray-200 hover:text-primary dark:hover:text-yellow-400"
      >
        {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
      </button>
    </nav>
  );
}
