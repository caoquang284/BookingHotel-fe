import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/apis/auth";
import { useTheme } from "../contexts/ThemeContext";
import type { ForgotPasswordDTO } from "../types";
import { useScrollToTop } from "../hooks/useScrollToTop";

function ForgotPassword() {
  const { theme } = useTheme();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? null
      : "Email không hợp lệ!";
  };

  const validateUsername = (username: string) => {
    return /^[a-zA-Z0-9]{6,20}$/.test(username)
      ? null
      : "Tên đăng nhập phải từ 6-20 ký tự, chỉ chứa chữ và số!";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const emailError = validateEmail(email);
    const usernameError = validateUsername(username);
    if (emailError) {
      setError(emailError);
      return;
    }
    if (usernameError) {
      setError(usernameError);
      return;
    }

    try {
      await forgotPassword({ username, email });
      setSuccess(
        "Mật khẩu mới đã được gửi đến email của bạn! Vui lòng kiểm tra hộp thư."
      );
      setTimeout(() => navigate("/login"), 3000);
    } catch (error: any) {
      setError(
        error.message || "Không thể gửi mật khẩu mới. Vui lòng thử lại!"
      );
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
        <div
          className={`absolute w-64 h-64 opacity-20 rounded-full blur-3xl animate-pulse top-20 left-20 ${
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
        className={`p-8 rounded-2xl shadow-xl w-full max-w-md z-10 transition-all duration-300 ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        }`}
      >
        <h2
          className={`text-3xl font-bold text-center mb-6 ${
            theme === "light" ? "text-gray-800" : "text-gray-100"
          }`}
        >
          Quên mật khẩu
        </h2>
        {error && (
          <p
            className={`text-center mb-4 p-3 rounded-lg ${
              theme === "light"
                ? "text-red-500 bg-red-50"
                : "text-red-400 bg-red-900/50"
            }`}
          >
            {error}
          </p>
        )}
        {success && (
          <p
            className={`text-center mb-4 p-3 rounded-lg ${
              theme === "light"
                ? "text-green-500 bg-green-50"
                : "text-green-400 bg-green-900/50"
            }`}
          >
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                className={`absolute left-3 ${
                  theme === "light" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`pl-10 pr-4 py-3 w-full rounded-lg border text-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                  theme === "light"
                    ? "border-gray-200 text-black focus:ring-indigo-500"
                    : "border-gray-600 text-gray-100 bg-gray-700 focus:ring-indigo-400"
                }`}
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
              Email
            </label>
            <div className="flex items-center">
              <span
                className={`absolute left-3 ${
                  theme === "light" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 pr-4 py-3 w-full rounded-lg border text-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                  theme === "light"
                    ? "border-gray-200 text-black focus:ring-indigo-500"
                    : "border-gray-600 text-gray-100 bg-gray-700 focus:ring-indigo-400"
                }`}
                placeholder="Email"
                required
                aria-label="Email"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className={`text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 ${
                theme === "light"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              }`}
            >
              Gửi mật khẩu mới
            </button>
          </div>
        </form>
        <p
          className={`text-center text-sm mt-4 ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          <a
            href="/login"
            className={`font-medium ${
              theme === "light"
                ? "text-indigo-500 hover:text-indigo-600"
                : "text-indigo-400 hover:text-indigo-500"
            }`}
          >
            Quay lại đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
