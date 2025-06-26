import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const getInitialTheme = (): string => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored;

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
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
        <Moon className="absolute inset-0 w-6 h-6 text-secondary transition-all duration-300 opacity-100 rotate-0 scale-100 dark:opacity-0 dark:rotate-90 dark:scale-0" />
        <Sun className="absolute inset-0 w-6 h-6 text-amber-500 transition-all duration-300 dark:opacity-100 dark:rotate-0 dark:scale-100 opacity-0 -rotate-90 scale-0" />
      </div>
    </button>
  );
}
