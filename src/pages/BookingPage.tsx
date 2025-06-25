import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getRoomById } from "../services/apis/room";
import { getAllRoomTypes } from "../services/apis/roomType";
import { getAllFloors } from "../services/apis/floor";
import { getGuestByAccountId } from "../services/apis/guest";
import { useAuth } from "../contexts/AuthContext";
import { createBookingConfirmationForm } from "../services/apis/bookingconfirm";
import type { ResponseRoomDTO } from "../types/index.ts";
import type { BookingConfirmationFormDTO } from "../types";

const formatVND = (amount: number) =>
  amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const roomId = queryParams.get("roomId");
  const checkIn = queryParams.get("checkIn") || "";
  const checkOut = queryParams.get("checkOut") || "";
  const guests = parseInt(queryParams.get("guests") || "1");

  const [room, setRoom] = useState<ResponseRoomDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    id: 0,
    fullName: "",
    email: "",
    phone: "",
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qr" | null>(
    null
  );
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!roomId) {
        setError("Không tìm thấy phòng");
        setLoading(false);
        return;
      }
      try {
        const [roomData, roomTypesData, floorsData] = await Promise.all([
          getRoomById(parseInt(roomId)),
          getAllRoomTypes(),
          getAllFloors(),
        ]);
        const roomType = roomTypesData.find(
          (rt) => rt.id === roomData.roomTypeId
        );
        const floor = floorsData.find((f) => f.id === roomData.floorId);
        setRoom({
          ...roomData,
          roomTypeName: roomType?.name || "Không xác định",
          roomTypePrice: roomType?.price || 0,
          floorName: floor?.name || "Không xác định",
        });

        if (user) {
          const guestInfo = await getGuestByAccountId(user.id);
          if (guestInfo) {
            setCustomerInfo({
              id: guestInfo.id,
              fullName: guestInfo.name || "",
              email: guestInfo.email || "",
              phone: guestInfo.phoneNumber || "",
            });
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải thông tin");
        setLoading(false);
      }
    };
    fetchData();
  }, [roomId, user]);

  const generateQRCode = async (amount: number) => {
    try {
      setIsGeneratingQR(true);
      const accountNo = "5622889955";
      const accountName = "KHACH SAN 5 SAO";
      const acqId = "970418";
      const transferContent = `Thanh toan tien phong #${roomId}`.slice(0, 50);

      if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error("Số tiền phải là số nguyên lớn hơn 0");
      }

      const payload = {
        accountNo: accountNo.trim(),
        accountName: accountName.trim(),
        acqId,
        amount,
        addInfo: transferContent,
        format: "text",
        template: "compact2",
      };

      const response = await fetch("https://api.vietqr.io/v2/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": "658ae10f-8dbf-44bf-b943-31745299dd84",
          "x-api-key": "f1ac89af-9c63-48bb-9a09-9c635411954e",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`VietQR API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (data.code === "00" && data.data?.qrDataURL) {
        setQrCodeUrl(data.data.qrDataURL);
      } else {
        throw new Error(`VietQR API failed: ${data.desc || "Unknown error"}`);
      }
    } catch (error) {
      console.error("generateQRCode - Error:", error);
      alert(`Lỗi khi tạo mã QR: ${error}`);
      throw error;
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.fullName || !customerInfo.email || !customerInfo.phone) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setPaymentMethod("qr");
    setShowPaymentModal(true);
    await generateQRCode(Number(room?.roomTypePrice));
  };

  const handleConfirmPayment = async () => {
    if (!user || !roomId || !checkIn || !checkOut) {
      alert("Thông tin không đầy đủ để tạo phiếu đặt phòng");
      return;
    }

    try {
      const rentalDays = Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
          (1000 * 3600 * 24)
      );
      const bookingData: BookingConfirmationFormDTO = {
        bookingGuestId: customerInfo.id,
        bookingState: "PENDING",
        roomId: parseInt(roomId),
        bookingDate: checkIn, // Đảm bảo định dạng yyyy-MM-dd
        rentalDays: rentalDays > 0 ? rentalDays : 1,
      };

      const impactorId = user.id;
      const impactor = "USER";
      console.log(bookingData);
      await createBookingConfirmationForm(bookingData, impactorId, impactor);
      alert("Phiếu đặt phòng đã được tạo thành công!");
      navigate("/");
    } catch (error) {
      console.error("Error creating booking confirmation:", error);
      alert(`Lỗi khi tạo phiếu đặt phòng: ${error}`);
    } finally {
      setShowPaymentModal(false);
      setPaymentMethod(null);
      setQrCodeUrl(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  if (error)
    return (
      <div className="text-center py-12 text-red-600 text-xl font-semibold">
        {error}
      </div>
    );
  if (!room)
    return (
      <div className="text-center py-12 text-gray-600 text-xl font-semibold">
        Không tìm thấy phòng
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 sm:px-6 lg:px-8 py-42 px-48">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-playfair font-extrabold text-gray-900 text-center mb-12">
          Đặt Phòng Khách Sạn
        </h2>
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="p-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 ml-8 mt-4 font-playfair">
              Thông tin phòng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 ml-8">
              <div className="space-y-3">
                <p className="text-gray-600 text-2xl">
                  <span className="font-semibold">Tên phòng:</span> {room.name}
                </p>
                <p className="text-gray-600 text-2xl">
                  <span className="font-semibold">Loại phòng:</span>{" "}
                  {room.roomTypeName}
                </p>
                <p className="text-gray-600 text-2xl">
                  <span className="font-semibold">Tầng:</span> {room.floorName}
                </p>
                <p className="text-gray-600 text-2xl">
                  <span className="font-semibold">Ghi chú:</span>{" "}
                  {room.note || "Không có ghi chú"}
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-600 text-2xl">
                  <span className="font-semibold">Ngày đến:</span>{" "}
                  {checkIn || "Chưa chọn"}
                </p>
                <p className="text-gray-600 text-2xl">
                  <span className="font-semibold">Ngày đi:</span>{" "}
                  {checkOut || "Chưa chọn"}
                </p>
                <p className="text-gray-600 text-2xl">
                  <span className="font-semibold">Số khách:</span> {guests}
                </p>
                <p className="text-gray-600 text-2xl">
                  <span className="font-semibold">Giá:</span>{" "}
                  {formatVND(Number(room.roomTypePrice))}
                </p>
              </div>
            </div>

            <h3 className="text-3xl font-bold text-gray-800 mb-6 ml-8 mt-4 font-playfair">
              Thông tin khách hàng
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6 ml-8">
              <div>
                <label className="block text-2xl font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={customerInfo.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-2xl font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-2xl font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold text-2xl"
              >
                Xác nhận đặt phòng
              </button>
            </form>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <button
              onClick={() => {
                setShowPaymentModal(false);
                setPaymentMethod(null);
                setQrCodeUrl(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {paymentMethod === "cash"
                ? "Thanh toán tiền mặt"
                : "Thanh toán QR"}
            </h3>

            <div className="space-y-6">
              <p className="text-gray-600 text-lg">
                Số tiền cần thanh toán:{" "}
                <span className="font-bold text-blue-600">
                  {formatVND(Number(room?.roomTypePrice))}
                </span>
              </p>

              {paymentMethod === "qr" && (
                <div className="flex flex-col items-center space-y-4">
                  {isGeneratingQR ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                  ) : qrCodeUrl ? (
                    <>
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="w-64 h-64 object-contain rounded-lg shadow-md"
                      />
                      <p className="text-sm text-gray-500 text-center">
                        Vui lòng quét mã QR để thực hiện thanh toán
                      </p>
                    </>
                  ) : (
                    <p className="text-red-600">Đang tạo mã QR...</p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentMethod(null);
                    setQrCodeUrl(null);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={isGeneratingQR || !qrCodeUrl}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 flex items-center"
                >
                  {isGeneratingQR ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang xử lý...
                    </div>
                  ) : (
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Xác nhận thanh toán
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
