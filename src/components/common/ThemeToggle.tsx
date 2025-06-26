import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const getInitialTheme = (): string => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored;

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  };

  const [theme, setTheme] = useState<string>(getInitialTheme());

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const changeTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <button
      onClick={changeTheme}
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