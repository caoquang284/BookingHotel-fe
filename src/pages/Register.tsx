import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerGuest } from "../services/apis/register";
import { useTheme } from "../contexts/ThemeContext";
import { type GuestDTO, type AccountDTO, type Sex } from "../types";

function Register() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [guestInfo, setGuestInfo] = useState<GuestDTO>({
    name: "",
    sex: "MALE",
    age: 0,
    identificationNumber: "",
    phoneNumber: "",
    email: "",
    accountId: 0,
  });
  const [accountInfo, setAccountInfo] = useState<AccountDTO>({
    username: "",
    password: "",
    userRoleId: 5,
  });
  const [errors, setErrors] = useState<{
    name?: string;
    sex?: string;
    age?: string;
    identificationNumber?: string;
    phoneNumber?: string;
    email?: string;
    username?: string;
    password?: string;
  }>({});

  const validateGuestInfo = (): boolean => {
    const newErrors: typeof errors = {};

    if (!guestInfo.name.trim()) {
      newErrors.name = "Họ và tên không được để trống!";
    }
    if (!/^[0-9]{12}$/.test(guestInfo.identificationNumber)) {
      newErrors.identificationNumber = "Số CCCD phải là 12 chữ số!";
    }
    if (!/^\d{10,11}$/.test(guestInfo.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải có 10 hoặc 11 chữ số!";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email)) {
      newErrors.email = "Email không hợp lệ!";
    }
    if (guestInfo.age < 18) {
      newErrors.age = "Tuổi phải lớn hơn hoặc bằng 18!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAccountInfo = (): boolean => {
    const newErrors: typeof errors = {};

    if (!/^[a-zA-Z0-9]{6,20}$/.test(accountInfo.username)) {
      newErrors.username = "Tên đăng nhập phải từ 6-20 ký tự, chỉ chứa chữ và số!";
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(accountInfo.password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự, chứa chữ hoa, chữ thường và số!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof GuestDTO | keyof AccountDTO, value: string | number | Sex) => {
    if (step === 1) {
      setGuestInfo({ ...guestInfo, [field]: value });
      const newErrors = { ...errors };
      switch (field) {
        case "name":
          if (!String(value).trim()) newErrors.name = "Họ và tên không được để trống!";
          else delete newErrors.name;
          break;
        case "identificationNumber":
          if (!/^[0-9]{12}$/.test(String(value))) {
            newErrors.identificationNumber = "Số CCCD phải là 12 chữ số!";
          } else delete newErrors.identificationNumber;
          break;
        case "phoneNumber":
          if (!/^\d{10,11}$/.test(String(value))) {
            newErrors.phoneNumber = "Số điện thoại phải có 10 hoặc 11 chữ số!";
          } else delete newErrors.phoneNumber;
          break;
        case "email":
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
            newErrors.email = "Email không hợp lệ!";
          } else delete newErrors.email;
          break;
        case "age":
          if (Number(value) < 18) {
            newErrors.age = "Tuổi phải lớn hơn hoặc bằng 18!";
          } else delete newErrors.age;
          break;
      }
      setErrors(newErrors);
    } else {
      setAccountInfo({ ...accountInfo, [field]: value });
      const newErrors = { ...errors };
      switch (field) {
        case "username":
          if (!/^[a-zA-Z0-9]{6,20}$/.test(String(value))) {
            newErrors.username = "Tên đăng nhập phải từ 6-20 ký tự, chỉ chứa chữ và số!";
          } else delete newErrors.username;
          break;
        case "password":
          if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(String(value))) {
            newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự, chứa chữ hoa, chữ thường và số!";
          } else delete newErrors.password;
          break;
      }
      setErrors(newErrors);
    }
  };

  const handleGuestInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateGuestInfo()) {
      setStep(2);
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAccountInfo()) return;

    try {
      await registerGuest({
        guest: guestInfo,
        account: accountInfo,
      });
      alert("Đăng ký thành công!");
      navigate("/login");
    } catch (err: any) {
      const newErrors = { ...errors };

      if (err.field) {
        newErrors[err.field as keyof typeof newErrors] = err.message || "Thông tin không hợp lệ!";
        if (["identificationNumber", "phoneNumber", "email", "name", "age", "sex"].includes(err.field)) {
          setStep(1);
        }
        setErrors(newErrors);
      } else {
        alert(err.message || "Đăng ký thất bại!");
      }
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
        className={`p-8 rounded-2xl shadow-xl w-full max-w-4xl z-10 ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        }`}
      >
        <h2
          className={`text-3xl font-bold text-center mb-6 ${
            theme === "light" ? "text-gray-800" : "text-gray-100"
          }`}
        >
          {step === 1 ? "Thông tin cá nhân" : "Tạo tài khoản"}
        </h2>

        {step === 1 ? (
          <form onSubmit={handleGuestInfoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === "light" ? "text-gray-700" : "text-gray-200"
                }`}
              >
                Họ và tên
              </label>
              <div className="flex items-center">
                <span
                  className={`absolute left-3 ${theme === "light" ? "text-gray-400" : "text-gray-300"}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  value={guestInfo.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                    errors.name
                      ? "border-red-500"
                      : theme === "light"
                      ? "border-gray-200"
                      : "border-gray-600"
                  } ${theme === "light" ? "bg-white text-gray-900" : "bg-gray-700 text-gray-100"} focus:outline-none focus:ring-2 ${
                    theme === "light" ? "focus:ring-indigo-500" : "focus:ring-indigo-400"
                  } text-sm`}
                  placeholder="Họ và tên"
                  required
                  aria-label="Họ và tên"
                />
              </div>
              {errors.name && (
                <p className={`text-sm mt-1 ${theme === "light" ? "text-red-500" : "text-red-400"}`}>
                  {errors.name}
                </p>
              )}
            </div>
            <div className="relative">
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === "light" ? "text-gray-700" : "text-gray-200"
                }`}
              >
                Giới tính
              </label>
              <div className="flex items-center">
                <span
                  className={`absolute left-3 ${theme === "light" ? "text-gray-400" : "text-gray-300"}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </span>
                <select
                  value={guestInfo.sex}
                  onChange={(e) => handleInputChange("sex", e.target.value as Sex)}
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                    theme === "light" ? "border-gray-200" : "border-gray-600"
                  } ${theme === "light" ? "bg-white text-gray-900" : "bg-gray-700 text-gray-100"} focus:outline-none focus:ring-2 ${
                    theme === "light" ? "focus:ring-indigo-500" : "focus:ring-indigo-400"
                  } text-sm`}
                  required
                  aria-label="Giới tính"
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>
            <div className="relative">
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === "light" ? "text-gray-700" : "text-gray-200"
                }`}
              >
                Tuổi
              </label>
              <div className="flex items-center">
                <span
                  className={`absolute left-3 ${theme === "light" ? "text-gray-400" : "text-gray-300"}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </span>
                <input
                  type="number"
                  value={guestInfo.age}
                  onChange={(e) => handleInputChange("age", parseInt(e.target.value))}
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                    errors.age
                      ? "border-red-500"
                      : theme === "light"
                      ? "border-gray-200"
                      : "border-gray-600"
                  } ${theme === "light" ? "bg-white text-gray-900" : "bg-gray-700 text-gray-100"} focus:outline-none focus:ring-2 ${
                    theme === "light" ? "focus:ring-indigo-500" : "focus:ring-indigo-400"
                  } text-sm`}
                  placeholder="Tuổi"
                  required
                  min="18"
                  aria-label="Tuổi"
                />
              </div>
              {errors.age && (
                <p className={`text-sm mt-1 ${theme === "light" ? "text-red-500" : "text-red-400"}`}>
                  {errors.age}
                </p>
              )}
            </div>
            <div className="relative">
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === "light" ? "text-gray-700" : "text-gray-200"
                }`}
              >
                CCCD
              </label>
              <div className="flex items-center">
                <span
                  className={`absolute left-3 ${theme === "light" ? "text-gray-400" : "text-gray-300"}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  value={guestInfo.identificationNumber}
                  onChange={(e) => handleInputChange("identificationNumber", e.target.value)}
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                    errors.identificationNumber
                      ? "border-red-500"
                      : theme === "light"
                      ? "border-gray-200"
                      : "border-gray-600"
                  } ${theme === "light" ? "bg-white text-gray-900" : "bg-gray-700 text-gray-100"} focus:outline-none focus:ring-2 ${
                    theme === "light" ? "focus:ring-indigo-500" : "focus:ring-indigo-400"
                  } text-sm`}
                  placeholder="Số CCCD"
                  required
                  aria-label="Số CCCD"
                />
              </div>
              {errors.identificationNumber && (
                <p className={`text-sm mt-1 ${theme === "light" ? "text-red-500" : "text-red-400"}`}>
                  {errors.identificationNumber}
                </p>
              )}
            </div>
            <div className="relative">
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === "light" ? "text-gray-700" : "text-gray-200"
                }`}
              >
                Số điện thoại
              </label>
              <div className="flex items-center">
                <span
                  className={`absolute left-3 ${theme === "light" ? "text-gray-400" : "text-gray-300"}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  value={guestInfo.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                    errors.phoneNumber
                      ? "border-red-500"
                      : theme === "light"
                      ? "border-gray-200"
                      : "border-gray-600"
                  } ${theme === "light" ? "bg-white text-gray-900" : "bg-gray-700 text-gray-100"} focus:outline-none focus:ring-2 ${
                    theme === "light" ? "focus:ring-indigo-500" : "focus:ring-indigo-400"
                  } text-sm`}
                  placeholder="Số điện thoại"
                  required
                  aria-label="Số điện thoại"
                />
              </div>
              {errors.phoneNumber && (
                <p className={`text-sm mt-1 ${theme === "light" ? "text-red-500" : "text-red-400"}`}>
                  {errors.phoneNumber}
                </p>
              )}
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
                  className={`absolute left-3 ${theme === "light" ? "text-gray-400" : "text-gray-300"}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </span>
                <input
                  type="email"
                  value={guestInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                    errors.email
                      ? "border-red-500"
                      : theme === "light"
                      ? "border-gray-200"
                      : "border-gray-600"
                  } ${theme === "light" ? "bg-white text-gray-900" : "bg-gray-700 text-gray-100"} focus:outline-none focus:ring-2 ${
                    theme === "light" ? "focus:ring-indigo-500" : "focus:ring-indigo-400"
                  } text-sm`}
                  placeholder="Email"
                  required
                  aria-label="Email"
                />
              </div>
              {errors.email && (
                <p className={`text-sm mt-1 ${theme === "light" ? "text-red-500" : "text-red-400"}`}>
                  {errors.email}
                </p>
              )}
            </div>
            <div className="md:col-span-2 flex justify-end space-x-4">
              <button
                type="submit"
                className={`bg-gradient-to-r text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ${
                  theme === "light"
                    ? "from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                    : "from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                }`}
              >
                Tiếp tục
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAccountSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  value={accountInfo.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                    errors.username
                      ? "border-red-500"
                      : theme === "light"
                      ? "border-gray-200"
                      : "border-gray-600"
                  } ${theme === "light" ? "bg-white text-gray-900" : "bg-gray-700 text-gray-100"} focus:outline-none focus:ring-2 ${
                    theme === "light" ? "focus:ring-indigo-500" : "focus:ring-indigo-400"
                  } text-sm`}
                  placeholder="Tên đăng nhập"
                  required
                  aria-label="Tên đăng nhập"
                />
              </div>
              {errors.username && (
                <p className={`text-sm mt-1 ${theme === "light" ? "text-red-500" : "text-red-400"}`}>
                  {errors.username}
                </p>
              )}
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0-1.104-.896-2-2-2s-2 .896-2 2m0-4c0-1.104-.896-2-2-2s-2 .896-2 2m6 4c0-1.104-.896-2-2-2s-2 .896-2 2"></path>
                  </svg>
                </span>
                <input
                  type="password"
                  value={accountInfo.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                    errors.password
                      ? "border-red-500"
                      : theme === "light"
                      ? "border-gray-200"
                      : "border-gray-600"
                  } ${theme === "light" ? "bg-white text-gray-900" : "bg-gray-700 text-gray-100"} focus:outline-none focus:ring-2 ${
                    theme === "light" ? "focus:ring-indigo-500" : "focus:ring-indigo-400"
                  } text-sm`}
                  placeholder="Mật khẩu"
                  required
                  aria-label="Mật khẩu"
                />
              </div>
              {errors.password && (
                <p className={`text-sm mt-1 ${theme === "light" ? "text-red-500" : "text-red-400"}`}>
                  {errors.password}
                </p>
              )}
            </div>
            <div className="md:col-span-2 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`font-semibold py-3 px-6 rounded-lg transition duration-300 ${
                  theme === "light"
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                }`}
              >
                Quay lại
              </button>
              <button
                type="submit"
                className={`bg-gradient-to-r text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ${
                  theme === "light"
                    ? "from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                    : "from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                }`}
              >
                Đăng ký
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;