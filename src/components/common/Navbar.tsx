import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface NavItem {
  path: string;
  label: string;
  className?: string;
}

interface AuthItemLink extends NavItem {
  path: string;
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/"; 
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Các mục menu (hiển thị khi đã đăng nhập)
  const navItems: NavItem[] = [
    { path: "/", label: "Trang chủ" },
    ...(user
      ? [
          { path: "/booking-history", label: "Lịch sử đặt phòng" },
        ]
      : []),
  ];

  const authItems: AuthItem[] = user
    ? [
        {
          action: handleLogout,
          label: "Đăng xuất",
          className: "from-black to-gray-700 hover:from-red-700 hover:to-red-800",
        },
      ]
    : [
        { path: "/login", label: "Đăng nhập", className: "from-black to-gray-700" },
        { path: "/register", label: "Đăng ký", className: "from-blue-700 to-blue-800" },
      ];

  return (
    <nav className="bg-white text-black px-4 sm:px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-xl font-bold text-gray-800">ZenRooms</div>
        <div className="hidden sm:flex flex-1 justify-center gap-6 font-medium">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`hover:text-gray-800 transition-colors ${
                location.pathname === item.path ? "font-bold text-blue-800" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-4">
          {authItems.map((item) =>
            "path" in item ? (
              <Link
                key={item.path}
                to={item.path}
                className={`px-5 py-2 rounded-full font-semibold shadow hover:scale-105 transition-transform bg-gradient-to-r ${item.className} text-white`}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={item.action}
                className={`px-5 py-2 rounded-full font-semibold shadow hover:scale-105 transition-transform bg-gradient-to-r ${item.className} text-white`}
              >
                {item.label}
              </button>
            )
          )}
        </div>
        <div className="sm:hidden">
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
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
        <div className="sm:hidden bg-white shadow-md mt-2 rounded-lg">
          <div className="flex flex-col px-4 py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 px-4 text-sm font-medium hover:bg-gray-100 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? "font-bold text-blue-600"
                    : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
            {authItems.map((item) =>
              "path" in item ? (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`py-2 px-4 text-sm font-medium hover:bg-gray-100 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? "font-bold text-blue-600"
                      : ""
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => {
                    item.action();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`py-2 px-4 text-sm font-medium bg-${item.className} text-white rounded-md hover:bg-${item.className.replace(
                    "600",
                    "700"
                  )} transition-colors`}
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;