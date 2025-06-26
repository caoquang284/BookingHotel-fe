import { useState } from "react";
import { login } from "../services/apis/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { type ResponseLoginDTO } from "../types";
import { type User } from "../contexts/AuthContext";

function Login() {
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { setUser, setAccessToken, setRefreshToken } = useAuth();
  const { theme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response: ResponseLoginDTO = await login({ username: tenDangNhap, password: matKhau });
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);

      const payload = JSON.parse(atob(response.accessToken.split(".")[1]));
      const userInfo: User = {
        id: parseInt(payload.sub),
        username: tenDangNhap,
        role: payload.role || "Guest",
      };
      setUser(userInfo);
      navigate("/");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Đăng nhập thất bại!";
      setError(errorMessage);
      console.error("Lỗi đăng nhập:", error);
    }
  };

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center transition-all duration-300 ${
        theme === "light"
          ? "bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100"
          : "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700"
      } overflow-hidden`}
    >
      <div className="absolute inset-0 -z-10">
        <div className={`absolute w-64 h-64 opacity-20 rounded-full blur-3xl animate-pulse top-20 left-20 ${
            theme === "light" ? "bg-indigo-200" : "bg-indigo-900"
          }`}
        ></div>
        <div
          className={`absolute w-80 h-80 opacity-20 rounded-full blur-3xl animate-pulse bottom-20 right-20 ${
            theme === "light" ? "bg-pink-200" : "bg-pink-900"
          }`}
        ></div>
      </div>

      <div
        className={`p-8 rounded-2xl shadow-xl w-full max-w-md z-10 ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        }`}
      >
        <h2
          className={`text-3xl font-bold text-center mb-6 ${
            theme === "light" ? "text-gray-800" : "text-gray-100"
          }`}
        >
          Đăng nhập
        </h2>
        {error && (
          <p
            className={`text-center mb-4 p-3 rounded-lg ${
              theme === "light" ? "text-red-500 bg-red-50" : "text-red-400 bg-red-900/30"
            }`}
          >
            {error}
          </p>
        )}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <label
              className={`block text-sm font-medium mb-2 ${
                theme === "light" ? "text-gray-700" : "text-gray-200"
              }`}
            >
              Tên đăng nhập
            </label>
            <div className="flex items-center">
              <span
                className={`absolute left-3 ${theme === "light" ? "text-gray-400" : "text-gray-300"}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 present">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>
              <input
                type="text"
                value={tenDangNhap}
                onChange={(e) => setTenDangNhap(e.target.value)}
                className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                  theme === "light"
                    ? "border-gray-200 bg-white text-gray-900 focus:ring-indigo-500"
                    : "border-gray-600 bg-gray-700 text-gray-100 focus:ring-indigo-400"
                } focus:outline-none focus:ring-2 text-sm`}
                placeholder="Tên đăng nhập"
                required
                aria-label="Tên đăng nhập"
              />
            </div>
          </div>
          <div className="relative">
            <label
              className={`block text-sm font-medium mb-2 ${
                theme === "light" ? "text-gray-700" : "text-gray-200"
              }`}
            >
              Mật khẩu
            </label>
            <div className="flex items-center">
              <span
                className={`absolute left-3 ${theme === "light" ? "text-gray-400" : "text-gray-300"}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 11c1.10457-0 2-0.89543 2-2 0-1.10457-0.89543-2-2-2-1.10457 0-2 0.89543-2 2 0 1.10457 0.89543 2 2 2zM12 17c-2.76142 0-5 2.23858-5 5h10c0-2.76142-2.23858-5-5-5z"
                  />
                </svg>
              </span>
              <input
                type="password"
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                  theme === "light"
                    ? "border-gray-200 bg-white text-gray-900 focus:ring-indigo-500"
                    : "border-gray-600 bg-gray-700 text-gray-100 focus:ring-indigo-400"
                } focus:outline-none focus:ring-2 text-sm`}
                placeholder="••••••••"
                required
                aria-label="Mật khẩu"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className={`bg-gradient-to-r text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ${
                theme === "light"
                  ? "from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  : "from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              }`}
            >
              Đăng nhập
            </button>
          </div>
        </form>
        <p
          className={`text-center text-sm mt-4 ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          Chưa có tài khoản?{" "}
          <a
            href="/register"
            className={`font-medium ${
              theme === "light" ? "text-indigo-500 hover:text-indigo-600" : "text-indigo-400 hover:text-indigo-500"
            }`}
          >
            Đăng ký
          </a>
          {" | "}
          <a
            href="/forgot-password"
            className={`font-medium ${
              theme === "light" ? "text-indigo-500 hover:text-indigo-600" : "text-indigo-400 hover:text-indigo-500"
            }`}
          >
            Quên mật khẩu?
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;