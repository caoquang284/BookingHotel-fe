import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Trang chủ" },
    { path: "/booking-history", label: "Lịch sử đặt phòng" },
    { path: "/dashboard", label: "Quản lý" },
    { path: "/profile", label: "Hồ sơ" },
  ];

  const authItems = [
    { path: "/login", label: "Đăng nhập" },
    { path: "/register", label: "Đăng ký" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white text-black px-4 sm:px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-xl font-bold text-gray-800">ZenRooms</div>
        <div className="hidden sm:flex flex-1 justify-center gap-6 font-medium">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`hover:text-gray-600 transition-colors ${
                location.pathname === item.path ? "font-bold text-blue-600" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-4">
          {authItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-5 py-2 rounded-full font-semibold shadow hover:scale-105 transition-transform ${
                item.label === "Đăng nhập"
                  ? "bg-gradient-to-r from-black to-gray-700 text-white"
                  : "bg-gradient-to-r from-blue-600 to-blue-800 text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
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
            {authItems.map((item) => (
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
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;