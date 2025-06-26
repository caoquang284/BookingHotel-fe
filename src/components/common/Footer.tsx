import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";

const Footer = () => {
  const { theme } = useTheme();

  const socialIcons = [
    { Icon: FaFacebook, link: "https://facebook.com" },
    { Icon: FaInstagram, link: "https://instagram.com" },
    { Icon: FaTiktok, link: "https://tiktok.com" },
    { Icon: FaTwitter, link: "https://twitter.com" },
    { Icon: FaLinkedin, link: "https://linkedin.com" },
  ];

  const legalLinks = [
    { label: "Terms of use", path: "/terms" },
    { label: "DMCA", path: "/dmca" },
    { label: "Privacy policy", path: "/privacy" },
    { label: "Refund policy", path: "/refund" },
  ];

  return (
    <footer
      className={`py-1 transition-all duration-300 ${
        theme === "light" ? "bg-gray-900 text-white" : "bg-gray-500 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Main */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          {/* Download App */}
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-4">Download the app</h3>
            <div className="flex gap-4">
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Google Play"
                  className="h-10"
                />
              </a>
              <a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                  alt="App Store"
                  className="h-10"
                />
              </a>
            </div>
          </div>

          {/* Follow */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-lg font-semibold mb-4">Follow us</h3>
            <div className="flex gap-4">
              {socialIcons.map(({ Icon, link }, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-colors ${
                    theme === "light"
                      ? "text-white hover:text-gray-400"
                      : "text-gray-900 hover:text-gray-600"
                  }`}
                >
                  <Icon size={24} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright and Legal */}
        <div
          className={`border-t pt-6 flex flex-col md:flex-row justify-between items-center text-sm ${
            theme === "light" ? "border-gray-700" : "border-gray-300"
          }`}
        >
          <p className="mb-4 md:mb-0">
            2025 © Website đặt phòng khách sạn. Bản quyền thuộc về nhóm 5, Trường Đại học
            Công nghệ thông tin - ĐHQG.TPHCM
          </p>
          <div className="flex gap-4">
            {legalLinks.map((link, index) => (
              <a
                key={index}
                href={link.path}
                className={`transition-colors ${
                  theme === "light"
                    ? "text-white hover:text-gray-400"
                    : "text-gray-900 hover:text-gray-600"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;