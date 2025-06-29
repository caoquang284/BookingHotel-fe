import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import logo from "../../assets/Image/logo.png";
import ThemeToggle from "./ThemeToggle";

interface NavItem {
  path?: string;
  label: string;
  className?: string;
  dropdown?: NavItem[];
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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
    { path: "/hotel-detail", label: "Về chúng tôi" },
    { path: "/policy", label: "Chính sách" },
    ...(user
      ? [
          { path: "/profile", label: "Hồ sơ" },

          {
            label: "Lịch sử",
            dropdown: [
              { path: "/booking-history", label: "Lịch sử đặt phòng" },
              { path: "/rental-history", label: "Lịch sử thuê phòng" },
            ],
          },
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
      className={`fixed w-full top-0 z-30 px-2 sm:px-4 lg:px-8 py-3 sm:py-5 md:py-7 transition-all duration-300 shadow-md ${
        isScrolled
          ? "bg-[var(--background)] text-[var(--foreground)]"
          : "bg-transparent text-[var(--foreground)]"
      }`}
    >
      <div className="flex items-center justify-between max-w-8xl mx-auto">
        <div className="flex items-center pl-2 sm:pl-4 md:pl-8 lg:pl-52">
          <img
            src={logo}
            alt="Roomify Logo"
            className="h-8 sm:h-10 md:h-12 w-auto mt-1 sm:mt-2"
          />
          <div className="text-lg sm:text-xl md:text-3xl lg:text-5xl font-bold font-playfair ml-1 sm:ml-2 text-[var(--foreground)] transition-colors duration-300">
            Roomify
          </div>
        </div>
        <div className="hidden md:flex flex-1 justify-center gap-3 sm:gap-4 md:gap-6 font-medium">
          {navItems.map((item, index) =>
            item.dropdown ? (
              <div key={index} className="relative">
                <button
                  className="py-1 sm:py-2 px-2 sm:px-3 md:px-4 text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl font-medium rounded-md transition-colors duration-300 text-[var(--primary)]"
                  onClick={toggleDropdown}
                >
                  <span className="relative">
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-[var(--primary)]"></span>
                  </span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-[var(--card)] text-[var(--card-foreground)] transition-colors duration-300">
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path!}
                        onClick={() => {
                          setIsDropdownOpen(false);
                        }}
                        className={`block py-2 px-4 text-sm ${
                          location.pathname === subItem.path
                            ? "font-bold text-[var(--primary)]"
                            : "text-[var(--card-foreground)] hover:bg-[var(--secondary)]"
                        } transition-colors duration-300`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : item.path ? (
              <Link
                key={item.path}
                to={item.path}
                className={`py-1 sm:py-2 px-2 sm:px-3 md:px-4 text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl font-medium rounded-md transition-colors duration-300 group ${
                  location.pathname === item.path
                    ? "font-bold text-[var(--primary)]"
                    : "text-[var(--primary)]"
                }`}
              >
                <span className="relative">
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                      location.pathname === item.path
                        ? "bg-[var(--primary)]"
                        : "bg-[var(--primary)]"
                    }`}
                  ></span>
                </span>
              </Link>
            ) : null
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 pr-2 sm:pr-4 md:pr-8 lg:pr-52">
          <div className="hidden md:flex items-center gap-2 sm:gap-3 md:gap-4">
            {authItems.map((item) =>
              "path" in item ? (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`py-1 sm:py-2 px-2 sm:px-3 md:px-4 text-sm sm:text-base md:text-lg lg:text-xl font-medium rounded-md transition-all duration-300 bg-gradient-to-r ${item.className} text-[var(--primary-foreground)] relative group`}
                >
                  <span className="relative">
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-[var(--primary-foreground)]"></span>
                  </span>
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`py-1 sm:py-2 px-2 sm:px-3 md:px-4 text-sm sm:text-base md:text-lg lg:text-xl font-medium rounded-md transition-all duration-300 bg-gradient-to-r ${item.className} text-[var(--primary-foreground)] relative group`}
                >
                  <span className="relative">
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-[var(--primary-foreground)]"></span>
                  </span>
                </button>
              )
            )}
                      <ThemeToggle />
          </div>
        </div>
        {/* Hamburger + ThemeToggle trên mobile */}
<div className="md:hidden flex items-center gap-2">
  <ThemeToggle /> {/* Thu nhỏ hơn */}
  <button
    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
    className="p-2"
  >
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
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
        <div className="md:hidden mt-2 rounded-lg transition-colors duration-300 bg-[var(--card)] text-[var(--card-foreground)]">
          <div className="flex flex-col px-3 sm:px-4 py-2">
            {navItems.map((item, index) =>
              item.dropdown ? (
                <div key={index} className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="py-2 sm:py-3 px-3 sm:px-4 text-base sm:text-lg font-medium rounded-md transition-colors duration-300 w-full text-left text-[var(--primary)]"
                  >
                    {item.label}
                    <span className="ml-2 inline-block">
                      {isDropdownOpen ? "▲" : "▼"}
                    </span>
                  </button>
                  {isDropdownOpen && (
                    <div className="pl-4">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path!}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setIsDropdownOpen(false);
                          }}
                          className={`block py-2 px-4 text-sm ${
                            location.pathname === subItem.path
                              ? "font-bold text-[var(--primary)]"
                              : "text-[var(--card-foreground)] hover:bg-[var(--secondary)]"
                          } transition-colors duration-300`}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : item.path ? (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`py-1 sm:py-2 px-2 sm:px-3 text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl font-medium rounded-md transition-colors duration-300 group ${
                    location.pathname === item.path
                      ? "font-bold text-[var(--primary)]"
                      : "text-[var(--primary)]"
                  }`}
                >
                  <span className="relative">
                    {item.label}
                    <span
                      className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                        location.pathname === item.path
                          ? "bg-[var(--primary)]"
                          : "bg-[var(--primary)]"
                      }`}
                    ></span>
                  </span>
                </Link>
              ) : null
            )}
            {authItems.map((item) =>
              "path" in item ? (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`py-2 sm:py-3 px-3 sm:px-4 text-base sm:text-lg font-medium rounded-md transition-all duration-300 bg-gradient-to-r ${item.className} text-[var(--primary-foreground)]`}
                >
                  <span className="relative">
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-[var(--primary-foreground)]"></span>
                  </span>
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => {
                    item.action();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`py-2 sm:py-3 px-3 sm:px-4 text-base sm:text-lg font-medium rounded-md transition-all duration-300 bg-gradient-to-r ${item.className} text-[var(--primary-foreground)]`}
                >
                  <span className="relative">
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-[var(--primary-foreground)]"></span>
                  </span>
                </button>
              )
            )}
            <div className="py-2 sm:py-3 px-3 sm:px-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
