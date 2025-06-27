import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="cursor-pointer relative p-2 rounded-full dark:bg-white bg-gray-700 dark:hover:bg-gray-300 hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl"
    >
      <div className="relative w-6 h-6">
        {theme === "dark" ? (
          <Sun className="w-6 h-6 text-amber-500 transition-transform duration-300 ease-in-out" />
        ) : (
          <Moon className="w-6 h-6 text-gray-800 transition-transform duration-300 ease-in-out" />
        )}
      </div>
    </button>
  );
}