import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getGuestByAccountId } from "../services/apis/guest";
import { changePassword } from "../services/apis/auth";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import type { GuestDTO, Sex } from "../types";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface GuestFormData {
  id?: number;
  name: string;
  sex: Sex;
  age: number;
  identificationNumber: string;
  phoneNumber: string;
  email: string;
}

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Errors {
  name?: string;
  sex?: string;
  age?: string;
  identificationNumber?: string;
  phoneNumber?: string;
  email?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const Profile: React.FC = () => {
  const { user, accessToken, refreshAccessToken } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [guest, setGuest] = useState<GuestFormData>({
    id: undefined,
    name: "",
    sex: "MALE",
    age: 18,
    identificationNumber: "",
    phoneNumber: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!user?.id || !accessToken) {
      console.warn("User or accessToken missing, redirecting to login");
      navigate("/login");
      return;
    }

    const fetchGuest = async () => {
      try {
        setLoading(true);
        console.log("Fetching guest data for account ID:", user.id);
        const guestData = await getGuestByAccountId(user.id);
        console.log("Guest data received:", guestData);
        if (!guestData || typeof guestData.id === "undefined") {
          throw new Error(
            "Không tìm thấy thông tin khách hàng hoặc ID không hợp lệ"
          );
        }
        setGuest({
          id: guestData.id,
          name: guestData.name || "",
          sex: guestData.sex || "MALE",
          age: guestData.age || 18,
          identificationNumber: guestData.identificationNumber || "",
          phoneNumber: guestData.phoneNumber || "",
          email: guestData.email || "",
        });
      } catch (error) {
        console.error("Error fetching guest data:", error);
        toast.error("Không thể tải thông tin hồ sơ: " + (error as Error).message, {
          position: "top-right",
          autoClose: 3000,
          theme: theme === "light" ? "light" : "dark",
        });
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchGuest();
  }, [user?.id, accessToken, navigate]);

  const validateGuestInfo = (): boolean => {
    const newErrors: Errors = {};

    if (!guest.name.trim()) {
      newErrors.name = "Họ và tên không được để trống!";
    }
    if (!/^[0-9]{12}$/.test(guest.identificationNumber)) {
      newErrors.identificationNumber = "Số CCCD phải là 12 chữ số!";
    }
    if (!/^\d{10,11}$/.test(guest.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải có 10 hoặc 11 chữ số!";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) {
      newErrors.email = "Email không hợp lệ!";
    }
    if (guest.age < 18) {
      newErrors.age = "Tuổi phải lớn hơn hoặc bằng 18!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordInfo = (): boolean => {
    const newErrors: Errors = {};

    if (!passwordData.oldPassword) {
      newErrors.oldPassword = "Mật khẩu cũ không được để trống!";
    }
    if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự!";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  useScrollToTop();
  const handleGuestInputChange = (
    field: keyof GuestFormData,
    value: string | number | Sex
  ) => {
    setGuest((prev) => ({ ...prev, [field]: value }));
    const newErrors = { ...errors };
    switch (field) {
      case "name":
        if (!String(value).trim())
          newErrors.name = "Họ và tên không được để trống!";
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
  };

  const handlePasswordInputChange = (
    field: keyof PasswordFormData,
    value: string
  ) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    const newErrors = { ...errors };
    switch (field) {
      case "oldPassword":
        if (!value) newErrors.oldPassword = "Mật khẩu cũ không được để trống!";
        else delete newErrors.oldPassword;
        break;
      case "newPassword":
        if (value.length < 6) {
          newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự!";
        } else delete newErrors.newPassword;
        break;
      case "confirmPassword":
        if (value !== passwordData.newPassword) {
          newErrors.confirmPassword = "Mật khẩu xác nhận không khớp!";
        } else delete newErrors.confirmPassword;
        break;
    }
    setErrors(newErrors);
  };

  const handleGuestInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateGuestInfo() || !user?.id || !accessToken || !guest.id) {
      toast.warn("Vui lòng kiểm tra thông tin hoặc tải lại trang để lấy thông tin khách hàng.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "light" ? "light" : "dark",
      });
      return;
    }
    try {
      setLoading(true);
      const updatedGuest: GuestDTO = {
        name: guest.name,
        sex: guest.sex,
        age: guest.age,
        identificationNumber: guest.identificationNumber,
        phoneNumber: guest.phoneNumber,
        email: guest.email,
        accountId: user.id,
      };
      const response = await fetch(
        `http://localhost:8081/api/guest/${guest.id}/${user.id}/GUEST`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updatedGuest),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Cập nhật thông tin thất bại");
      }
      toast.success("Cập nhật thông tin thành công!", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "light" ? "light" : "dark",
      });
    } catch (error) {
      console.error("Error updating guest:", error);
      toast.error("Cập nhật thông tin thất bại: " + (error as Error).message, {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "light" ? "light" : "dark",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordInfo() || !accessToken) {
      toast.warn("Vui lòng kiểm tra thông tin.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "light" ? "light" : "dark",
      });
      return;
    }
    try {
      setLoading(true);
      await changePassword(passwordData, accessToken);
      toast.success("Thay đổi mật khẩu thành công!", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "light" ? "light" : "dark",
      });
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error((error as Error).message, {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "light" ? "light" : "dark",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-screen ${
          theme === "light"
            ? "bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100"
            : "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700"
        }`}
      >
        <div
          className={`text-center text-lg font-semibold ${
            theme === "light" ? "text-gray-800" : "text-gray-100"
          }`}
        >
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center transition-all duration-300 pt-35 pb-8 ${
        theme === "light"
          ? "bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100"
          : "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700"
      } overflow-hidden`}
    >
      <ToastContainer position="top-right" autoClose={3000} theme={theme === "light" ? "light" : "dark"} />
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
          Hồ Sơ Cá Nhân
        </h2>

        <div className="mb-12">
          <h3
            className={`text-xl font-semibold mb-4 ${
              theme === "light" ? "text-gray-700" : "text-gray-200"
            }`}
          >
            Thông Tin Cá Nhân
          </h3>
          <form
            onSubmit={handleGuestInfoSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
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
                  className={`absolute left-3 ${
                    theme === "light" ? "text-gray-400" : "text-gray-300"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                </span>
                <input
                  type="text"
                  value={guest.name}
                  onChange={(e) =>
                    handleGuestInputChange("name", e.target.value)
                  }
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                    theme === "light"
                      ? `border-gray-200 bg-white text-gray-900 focus:ring-indigo-500 ${
                          errors.name ? "border-red-500" : ""
                        }`
                      : `border-gray-600 bg-gray-700 text-gray-100 focus:ring-indigo-400 ${
                          errors.name ? "border-red-400" : ""
                        }`
                  } focus:outline-none focus:ring-2 text-sm`}
                  placeholder="Họ và tên"
                  aria-label="Họ và tên"
                />
              </div>
              {errors.name && (
                <p
                  className={`text-sm mt-1 ${
                    theme === "light" ? "text-red-500" : "text-red-400"
                  }`}
                >
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
                  className={`absolute left-3 ${
                    theme === "light" ? "text-gray-400" : "text-gray-300"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    ></path>
                  </svg>
                </span>
                <select
                  value={guest.sex}
                  onChange={(e) =>
                    handleGuestInputChange("sex", e.target.value as Sex)
                  }
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                    theme === "light"
                      ? "border-gray-200 bg-white text-gray-900 focus:ring-indigo-500"
                      : "border-gray-600 bg-gray-700 text-gray-100 focus:ring-indigo-400"
                  } focus:outline-none focus:ring-2 text-sm`}
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
                  className={`absolute left-3 ${
                    theme === "light" ? "text-gray-400" : "text-gray-300"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                </span>
                <input
                  type="number"
                  value={guest.age}
                  onChange={(e) =>
                    handleGuestInputChange("age", parseInt(e.target.value))
                  }
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                    theme === "light"
                      ? `border-gray-200 bg-white text-gray-900 focus:ring-indigo-500 ${
                          errors.age ? "border-red-500" : ""
                        }`
                      : `border-gray-600 bg-gray-700 text-gray-100 focus:ring-indigo-400 ${
                          errors.age ? "border-red-400" : ""
                        }`
                  } focus:outline-none focus:ring-2 text-sm`}
                  placeholder="Tuổi"
                  min="18"
                  aria-label="Tuổi"
                />
              </div>
              {errors.age && (
                <p
                  className={`text-sm mt-1 ${
                    theme === "light" ? "text-red-500" : "text-red-400"
                  }`}
                >
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
                  className={`absolute left-3 ${
                    theme === "light" ? "text-gray-400" : "text-gray-300"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    ></path>
                  </svg>
                </span>
                <input
                  type="text"
                  value={guest.identificationNumber}
                  onChange={(e) =>
                    handleGuestInputChange(
                      "identificationNumber",
                      e.target.value
                    )
                  }
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                    theme === "light"
                      ? `border-gray-200 bg-white text-gray-900 focus:ring-indigo-500 ${
                          errors.identificationNumber ? "border-red-500" : ""
                        }`
                      : `border-gray-600 bg-gray-700 text-gray-100 focus:ring-indigo-400 ${
                          errors.identificationNumber ? "border-red-400" : ""
                        }`
                  } focus:outline-none focus:ring-2 text-sm`}
                  placeholder="Số CCCD"
                  aria-label="Số CCCD"
                />
              </div>
              {errors.identificationNumber && (
                <p
                  className={`text-sm mt-1 ${
                    theme === "light" ? "text-red-500" : "text-red-400"
                  }`}
                >
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
                  className={`absolute left-3 ${
                    theme === "light" ? "text-gray-400" : "text-gray-300"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.616l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    ></path>
                  </svg>
                </span>
                <input
                  type="text"
                  value={guest.phoneNumber}
                  onChange={(e) =>
                    handleGuestInputChange("phoneNumber", e.target.value)
                  }
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                    theme === "light"
                      ? `border-gray-200 bg-white text-gray-900 focus:ring-indigo-500 ${
                          errors.phoneNumber ? "border-red-500" : ""
                        }`
                      : `border-gray-600 bg-gray-700 text-gray-100 focus:ring-indigo-400 ${
                          errors.phoneNumber ? "border-red-400" : ""
                        }`
                  } focus:outline-none focus:ring-2 text-sm`}
                  placeholder="Số điện thoại"
                  aria-label="Số điện thoại"
                />
              </div>
              {errors.phoneNumber && (
                <p
                  className={`text-sm mt-1 ${
                    theme === "light" ? "text-red-500" : "text-red-400"
                  }`}
                >
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
                  className={`absolute left-3 ${
                    theme === "light" ? "text-gray-400" : "text-gray-300"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>
                </span>
                <input
                  type="email"
                  value={guest.email}
                  onChange={(e) =>
                    handleGuestInputChange("email", e.target.value)
                  }
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                    theme === "light"
                      ? `border-gray-200 bg-white text-gray-900 focus:ring-indigo-500 ${
                          errors.email ? "border-red-500" : ""
                        }`
                      : `border-gray-600 bg-gray-700 text-gray-100 focus:ring-indigo-400 ${
                          errors.email ? "border-red-400" : ""
                        }`
                  } focus:outline-none focus:ring-2 text-sm`}
                  placeholder="Email"
                  aria-label="Email"
                />
              </div>
              {errors.email && (
                <p
                  className={`text-sm mt-1 ${
                    theme === "light" ? "text-red-500" : "text-red-400"
                  }`}
                >
                  {errors.email}
                </p>
              )}
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`bg-gradient-to-r text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 ${
                  theme === "light"
                    ? "from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                    : "from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                }`}
              >
                {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
              </button>
            </div>
          </form>
        </div>

        <div>
          <h3
            className={`text-xl font-semibold mb-4 ${
              theme === "light" ? "text-gray-700" : "text-gray-200"
            }`}
          >
            Thay Đổi Mật Khẩu
          </h3>
          <form
            onSubmit={handlePasswordSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="relative">
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === "light" ? "text-gray-700" : "text-gray-200"
                }`}
              >
                Mật khẩu cũ
              </label>
              <div className="flex items-center">
                <span
                  className={`absolute left-3 ${
                    theme === "light" ? "text-gray-400" : "text-gray-300"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 11c1.10457-0 2-0.89543 2-2 0-1.10457-0.89543-2-2-2-1.10457 0-2 0.89543-2 2 0 1.10457 0.89543 2 2 2zM12 17c-2.76142 0-5 2.23858-5 5h10c0-2.76142-2.23858-5-5-5z"
                    ></path>
                  </svg>
                </span>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    handlePasswordInputChange("oldPassword", e.target.value)
                  }
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                    theme === "light"
                      ? `border-gray-200 bg-white text-gray-900 focus:ring-indigo-500 ${
                          errors.oldPassword ? "border-red-500" : ""
                        }`
                      : `border-gray-600 bg-gray-700 text-gray-100 focus:ring-indigo-400 ${
                          errors.oldPassword ? "border-red-400" : ""
                        }`
                  } focus:outline-none focus:ring-2 text-sm`}
                  placeholder="Mật khẩu cũ"
                  aria-label="Mật khẩu cũ"
                />
              </div>
              {errors.oldPassword && (
                <p
                  className={`text-sm mt-1 ${
                    theme === "light" ? "text-red-500" : "text-red-400"
                  }`}
                >
                  {errors.oldPassword}
                </p>
              )}
            </div>
            <div className="relative">
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === "light" ? "text-gray-700" : "text-gray-200"
                }`}
              >
                Mật khẩu mới
              </label>
              <div className="flex items-center">
                <span
                  className={`absolute left-3 ${
                    theme === "light" ? "text-gray-400" : "text-gray-300"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 11c1.10457-0 2-0.89543 2-2 0-1.10457-0.89543-2-2-2-1.10457 0-2 0.89543-2 2 0 1.10457 0.89543 2 2 2zM12 17c-2.76142 0-5 2.23858-5 5h10c0-2.76142-2.23858-5-5-5z"
                    ></path>
                  </svg>
                </span>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    handlePasswordInputChange("newPassword", e.target.value)
                  }
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                    theme === "light"
                      ? `border-gray-200 bg-white text-gray-900 focus:ring-indigo-500 ${
                          errors.newPassword ? "border-red-500" : ""
                        }`
                      : `border-gray-600 bg-gray-700 text-gray-100 focus:ring-indigo-400 ${
                          errors.newPassword ? "border-red-400" : ""
                        }`
                  } focus:outline-none focus:ring-2 text-sm`}
                  placeholder="Mật khẩu mới"
                  aria-label="Mật khẩu mới"
                />
              </div>
              {errors.newPassword && (
                <p
                  className={`text-sm mt-1 ${
                    theme === "light" ? "text-red-500" : "text-red-400"
                  }`}
                >
                  {errors.newPassword}
                </p>
              )}
            </div>
            <div className="relative">
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === "light" ? "text-gray-700" : "text-gray-200"
                }`}
              >
                Xác nhận mật khẩu
              </label>
              <div className="flex items-center">
                <span
                  className={`absolute left-3 ${
                    theme === "light" ? "text-gray-400" : "text-gray-300"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 11c1.10457-0 2-0.89543 2-2 0-1.10457-0.89543-2-2-2-1.10457 0-2 0.89543-2 2 0 1.10457 0.89543 2 2 2zM12 17c-2.76142 0-5 2.23858-5 5h10c0-2.76142-2.23858-5-5-5z"
                    ></path>
                  </svg>
                </span>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    handlePasswordInputChange("confirmPassword", e.target.value)
                  }
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border transition-all duration-300 ${
                    theme === "light"
                      ? `border-gray-200 bg-white text-gray-900 focus:ring-indigo-500 ${
                          errors.confirmPassword ? "border-red-500" : ""
                        }`
                      : `border-gray-600 bg-gray-700 text-gray-100 focus:ring-indigo-400 ${
                          errors.confirmPassword ? "border-red-400" : ""
                        }`
                  } focus:outline-none focus:ring-2 text-sm`}
                  placeholder="Xác nhận mật khẩu"
                  aria-label="Xác nhận mật khẩu"
                />
              </div>
              {errors.confirmPassword && (
                <p
                  className={`text-sm mt-1 ${
                    theme === "light" ? "text-red-500" : "text-red-400"
                  }`}
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`bg-gradient-to-r text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 ${
                  theme === "light"
                    ? "from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                    : "from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                }`}
              >
                {loading ? "Đang thay đổi..." : "Thay đổi mật khẩu"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;