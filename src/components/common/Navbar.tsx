import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/Image/logo.png";
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

  const navItems: NavItem[] = [
    { path: "/", label: "Trang chủ" },
    ...(user ? [{ path: "/booking-history", label: "Lịch sử đặt phòng" }] : []),
  ];

  const authItems: AuthItem[] = user
    ? [
        {
          action: handleLogout,
          label: "Đăng xuất",
          className:
            "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
        },
      ]
    : [
        {
          path: "/login",
          label: "Đăng nhập",
          className:
            "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
        },
        {
          path: "/register",
          label: "Đăng ký",
          className:
            "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
        },
      ];

  return (
    <nav className="bg-transparent text-white fixed w-full top-0 z-20 px-2 sm:px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center mt-8 pl-52">
          <img src={logo} alt="Roomify Logo" className="h-10 w-auto mr-4" />
          <div className="text-2xl md:text-3xl font-bold text-white ml-4">
            Roomify
          </div>
        </div>
        <div className="hidden sm:flex flex-1 justify-center gap-6 font-medium">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] text-xl md:text-2xl ${
                location.pathname === item.path ? "font-bold text-blue-300" : ""
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
                className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] bg-gradient-to-r ${item.className} text-white text-xl md:text-2xl`}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={item.action}
                className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] bg-gradient-to-r ${item.className} text-white text-xl md:text-2xl`}
              >
                {item.label}
              </button>
            )
          )}
        </div>
        <div className="sm:hidden">
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-white hover:text-gray-300 focus:outline-none"
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
        <div className="sm:hidden bg-transparent mt-2 rounded-lg">
          <div className="flex flex-col px-4 py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 px-4 text-lg md:text-xl font-medium rounded-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] ${
                  location.pathname === item.path
                    ? "font-bold text-blue-300"
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
                  className={`py-2 px-4 text-lg md:text-xl font-medium rounded-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] bg-gradient-to-r ${item.className} text-white`}
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
                  className={`py-2 px-4 text-lg md:text-xl font-medium rounded-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] bg-gradient-to-r ${item.className} text-white`}
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
