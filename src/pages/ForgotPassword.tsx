import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/apis/auth";
import type { ForgotPasswordDTO } from "../types";

function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null : "Email không hợp lệ!";
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
      setSuccess("Mật khẩu mới đã được gửi đến email của bạn! Vui lòng kiểm tra hộp thư.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error: any) {
      setError(error.message || "Không thể gửi mật khẩu mới. Vui lòng thử lại!");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-64 h-64 bg-indigo-200 opacity-20 rounded-full blur-3xl animate-pulse top-20 left-20"></div>
        <div className="absolute w-80 h-80 bg-pink-200 opacity-20 rounded-full blur-3xl animate-pulse bottom-20 right-20"></div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md z-10">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Quên mật khẩu</h2>
        {error && (
          <p className="text-red-500 text-center mb-4 bg-red-50 p-3 rounded-lg">{error}</p>
        )}
        {success && (
          <p className="text-green-500 text-center mb-4 bg-green-50 p-3 rounded-lg">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
            <div className="flex items-center">
              <span className="absolute left-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all duration-300"
                placeholder="Tên đăng nhập"
                required
                aria-label="Tên đăng nhập"
              />
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="flex items-center">
              <span className="absolute left-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all duration-300"
                placeholder="Email"
                required
                aria-label="Email"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition duration-300"
            >
              Gửi mật khẩu mới
            </button>
          </div>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            <a href="/login" className="text-indigo-500 hover:text-indigo-600 font-medium">
              Quay lại đăng nhập
            </a>
          </p>
        </div>
      </div>
    );
  }
  
  export default ForgotPassword;