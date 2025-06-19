import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getRoomById } from "../services/apis/room";
import { getAllRoomTypes } from "../services/apis/roomType";
import { getAllFloors } from "../services/apis/floor";
import type { ResponseRoomDTO } from "../types/index.ts";

const formatVND = (amount: number) =>
  amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomId = queryParams.get("roomId");
  const checkIn = queryParams.get("checkIn") || "";
  const checkOut = queryParams.get("checkOut") || "";
  const guests = parseInt(queryParams.get("guests") || "1");

  const [room, setRoom] = useState<ResponseRoomDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qr" | null>(
    null
  );
  const [canConfirmPayment, setCanConfirmPayment] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
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
          floorName: floor?.name || "Không xác định",
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching room:", err);
        setError("Không thể tải thông tin phòng");
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);
  const generateQRCode = async (amount: number) => {
    try {
      setIsGeneratingQR(true);
      const accountNo = "5622889955"; // Xác nhận tài khoản thuộc MBBank
      const accountName = "KHACH SAN 5 SAO"; // Không dấu, in hoa, khớp với ngân hàng
      const acqId = "970418"; // MBBank
      const transferContent = `Thanh toan tien phong #${roomId}`.slice(0, 50); // Giới hạn 50 ký tự

      // Kiểm tra amount hợp lệ
      if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error("Số tiền phải là số nguyên lớn hơn 0");
      }

      // Tạo payload
      const payload = {
        accountNo: accountNo.trim(),
        accountName: accountName.trim(),
        acqId,
        amount,
        addInfo: transferContent,
        format: "text", // Hoặc "qr_only" nếu cần
        template: "compact2", // Thử template khác nếu compact không hoạt động
      };

      console.log("VietQR Payload:", payload);

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
      console.log("VietQR Response:", data);

      if (data.code === "00" && data.data?.qrDataURL) {
        console.log("QR Code URL:", data.data.qrDataURL);
        setQrCodeUrl(data.data.qrDataURL);
      } else {
        throw new Error(`VietQR API failed: ${data.desc || "Unknown error"}`);
      }
    } catch (error) {
      console.error("generateQRCode - Error:", {});
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
    setPaymentMethod("qr"); // hoặc "cash" nếu muốn mặc định tiền mặt
    setShowPaymentModal(true);

    // Nếu mặc định là QR thì tạo mã QR luôn
    await generateQRCode(Number(room?.roomTypePrice));
  };

  if (loading) return <p className="text-center py-12">Đang tải...</p>;
  if (error) return <p className="text-center py-12 text-red-600">{error}</p>;
  if (!room) return <p className="text-center py-12">Không tìm thấy phòng</p>;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Đặt phòng</h2>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Thông tin phòng</h3>
        <div className="mb-6">
          <p>
            <strong>Tên phòng:</strong> {room.name}
          </p>
          <p>
            <strong>Loại phòng:</strong> {room.roomTypeName}
          </p>
          <p>
            <strong>Tầng:</strong> {room.floorName}
          </p>
          <p>
            <strong>Ghi chú:</strong> {room.note || "Không có ghi chú"}
          </p>
          <p>
            <strong>Ngày đến:</strong> {checkIn || "Chưa chọn"}
          </p>
          <p>
            <strong>Ngày đi:</strong> {checkOut || "Chưa chọn"}
          </p>
          <p>
            <strong>Số khách:</strong> {guests}
          </p>
        </div>
        <h3 className="text-xl font-semibold mb-4">Thông tin khách hàng</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Họ và tên
            </label>
            <input
              type="text"
              name="fullName"
              value={customerInfo.fullName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={customerInfo.email}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              value={customerInfo.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Xác nhận
          </button>
        </form>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4">
          <div className="bg-white shadow-xl rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                setShowPaymentModal(false);
                setPaymentMethod(null);
                setQrCodeUrl("");
                setCanConfirmPayment(false);
                setIsLoadingPayment(false);
                setIsProcessingPayment(false);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
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

            <h3 className="text-xl font-semibold text-[#001F3F] mb-4">
              {paymentMethod === "cash"
                ? "Thanh toán tiền mặt"
                : "Thanh toán QR"}
            </h3>

            <div className="space-y-4">
              <p className="text-gray-600">
                Số tiền cần thanh toán:{" "}
                <span className="font-semibold text-[#001F3F]">
                  {formatVND(Number(room.roomTypePrice))}
                </span>
              </p>

              {paymentMethod === "qr" && qrCodeUrl && (
                <div className="flex flex-col items-center space-y-4">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-64 h-64 object-contain"
                  />
                  <p className="text-sm text-gray-500 text-center">
                    Quét mã QR để thanh toán
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentMethod(null);
                    setQrCodeUrl("");
                    setCanConfirmPayment(false);
                    setIsLoadingPayment(false);
                    setIsProcessingPayment(false);
                  }}
                  disabled={isProcessingPayment}
                  className="px-4 py-2 bg-gray-100 text-[#001F3F] rounded hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  disabled={true}
                  className="px-4 py-2 text-white rounded transition-all duration-300 flex items-center bg-blue-500 disabled:opacity-100"
                >
                  {isLoadingPayment ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
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
                      Đang xử lý thanh toán...
                    </div>
                  ) : isProcessingPayment ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
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
                      Đang hoàn tất thanh toán...
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
