import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import logo from "../../assets/Image/logo.png";
import ThemeToggle from "./ThemeToggle";

interface NavItem {
  path: string;
  label: string;
  className?: string;
}

interface AuthItemLink {
  path: string;
  label: string;
  className: string;
}

interface AuthItemButton {
  action: () => void;
  label: string;
  className: string;
}

type AuthItem = AuthItemLink | AuthItemButton;

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems: NavItem[] = [
    { path: "/", label: "Trang chủ" },
    ...(user
      ? [
          { path: "/booking-history", label: "Lịch sử đặt phòng" },
          { path: "/profile", label: "Hồ sơ" },
        ]
      : []),
  ];

  const authItems: AuthItem[] = user
    ? [
        {
          action: handleLogout,
          label: "Đăng xuất",
          className:
            "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-2xl",
        },
      ]
    : [
        {
          path: "/login",
          label: "Đăng nhập",
          className:
            "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-2xl",
        },
        {
          path: "/register",
          label: "Đăng ký",
          className:
            "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-2xl",
        },
      ];

  return (
    <nav
      className={`fixed w-full top-0 z-30 px-2 sm:px-4 py-7 transition-all duration-300 shadow-md ${
        isScrolled
          ? isLight
            ? "bg-white text-black"
            : "bg-gray-900 text-gray-100"
          : isLight
            ? "bg-transparent text-black"
            : "bg-transparent text-gray-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center pl-52">
          <img src={logo} alt="Roomify Logo" className="h-12 w-auto mt-2" />
          <div
            className={`text-2xl md:text-5xl font-bold font-playfair ml-2 ${
              isLight ? "text-black" : "text-gray-100"
            }`}
          >
            Roomify
          </div>
        </div>
        <div className="hidden sm:flex flex-1 justify-center gap-6 font-medium">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`py-2 px-4 text-lg md:text-3xl font-medium rounded-md transition-all duration-300 group ${
                location.pathname === item.path
                  ? "font-bold text-blue-600"
                  : isLight
                    ? "text-black"
                    : "text-gray-100"
              }`}
            >
              <span className="relative">
                {item.label}
                <span
                  className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                    location.pathname === item.path
                      ? "bg-blue-600"
                      : isLight
                        ? "bg-black"
                        : "bg-gray-100"
                  }`}
                ></span>
              </span>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4 pr-52">
          <div className="hidden sm:flex items-center gap-4">
            {authItems.map((item) =>
              "path" in item ? (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`py-2 px-4 text-lg md:text-xl font-medium rounded-md transition-all duration-300 bg-gradient-to-r ${item.className} ${
                    isLight ? "text-black" : "text-gray-100"
                  } relative`}
                >
                  <span className="relative">
                    {item.label}
                    <span
                      className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                        isLight ? "bg-black" : "bg-gray-100"
                      }`}
                    ></span>
                  </span>
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`py-2 px-4 text-lg md:text-xl font-medium rounded-md transition-all duration-300 bg-gradient-to-r ${item.className} ${
                    isLight ? "text-black" : "text-gray-100"
                  } relative`}
                >
                  <span className="relative">
                    {item.label}
                    <span
                      className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                        isLight ? "bg-black" : "bg-gray-100"
                      }`}
                    ></span>
                  </span>
                </button>
              )
            )}
          </div>
          <ThemeToggle />
        </div>
        <div className="sm:hidden">
          <button
            onClick={toggleMobileMenu}
            className={`p-2 transition-all duration-300 ${
              isLight
                ? "text-black hover:text-gray-600"
                : "text-gray-100 hover:text-gray-400"
            } focus:outline-none`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className={`sm:hidden mt-2 rounded-lg transition-all duration-300 ${
            isLight ? "bg-white text-black" : "bg-gray-900 text-gray-100"
          }`}
        >
          <div className="flex flex-col px-4 py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 px-4 text-lg md:text-xl font-medium rounded-md transition-all duration-300 group ${
                  location.pathname === item.path
                    ? "font-bold text-blue-600"
                    : isLight
                      ? "text-black"
                      : "text-gray-100"
                }`}
              >
                <span className="relative">
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                      location.pathname === item.path
                        ? "bg-blue-600"
                        : isLight
                          ? "bg-black"
                          : "bg-gray-100"
                    }`}
                  ></span>
                </span>
              </Link>
            ))}
            {authItems.map((item) =>
              "path" in item ? (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`py-2 px-4 text-lg md:text-xl font-medium rounded-md transition-all duration-300 bg-gradient-to-r ${item.className} ${
                    isLight ? "text-black" : "text-gray-100"
                  }`}
                >
                  <span className="relative">
                    {item.label}
                    <span
                      className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                        isLight ? "bg-black" : "bg-gray-100"
                      }`}
                    ></span>
                  </span>
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => {
                    item.action();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`py-2 px-4 text-lg md:text-xl font-medium rounded-md transition-all duration-300 bg-gradient-to-r ${item.className} ${
                    isLight ? "text-black" : "text-gray-100"
                  }`}
                >
                  <span className="relative">
                    {item.label}
                    <span
                      className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                        isLight ? "bg-black" : "bg-gray-100"
                      }`}
                    ></span>
                  </span>
                </button>
              )
            )}
            <div className="py-2 px-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
