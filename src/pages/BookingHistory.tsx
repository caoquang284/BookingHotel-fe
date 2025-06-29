import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { getGuestByAccountId } from "../services/apis/guest";
import { getRoomById, updateRoom } from "../services/apis/room";
import { getAllBookingConfirmationForms } from "../services/apis/bookingconfirm";
import { deleteBookingConfirmationForm } from "../services/apis/bookingconfirm";
import { createReview } from "../services/apis/review"; // Thêm API tạo đánh giá
import { getImagesByRoomId } from "../services/apis/image"; // Thêm API lấy hình ảnh
import type { ResponseGuestDTO } from "../types/index.ts";
import type { ResponseBookingConfirmationFormDTO } from "../types";
import { getRoomTypeById } from "../services/apis/roomType";
import starIconFilled from "../assets/Icon/starIconFilled.svg";
import starIconOutlined from "../assets/Icon/starIconOutlined.svg";
import { toast } from "react-toastify";
import type { ToastContent, ToastOptions } from "react-toastify";
import {
  createRentalForm,
  getAllRentalFormsNoPage,
} from "../services/apis/rentalform";
import { createRentalFormDetail } from "../services/apis/rentalFormDetail";
import { createInvoice } from "../services/apis/invoice";
import { createInvoiceDetail } from "../services/apis/invoicedetail";

const BookingHistory: React.FC = () => {
  const { user, isInitialized } = useAuth();
  const { theme } = useTheme();
  useScrollToTop();
  const [guestId, setGuestId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<
    ResponseBookingConfirmationFormDTO[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<number | null>(null); // State để hiển thị form đánh giá
  const [rating, setRating] = useState<number>(0); // Đánh giá (1-5)
  const [comment, setComment] = useState<string>(""); // Bình luận
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [selectedBookingForQR, setSelectedBookingForQR] =
    useState<ResponseBookingConfirmationFormDTO | null>(null);
  const [qrPrice, setQrPrice] = useState<number>(0);
  const [rentalForms, setRentalForms] = useState<any[]>([]);
  const [roomImages, setRoomImages] = useState<{ [roomId: number]: string }>(
    {}
  ); // State lưu hình ảnh phòng
  const bookingState = {
    PENDING: "Chờ xác nhận",
    COMMITED: "Đã xác nhận",
    CANCELLED: "Đã hủy",
    EXPIRED: "Đã hết hạn",
  };

  const bookingStateColor = {
    PENDING: "text-yellow-500",
    COMMITED: "text-green-500",
    CANCELLED: "text-red-500",
    EXPIRED: "text-gray-500",
  };

  // Hàm kiểm tra xem có hiển thị nút Hủy trong form đánh giá không
  const canShowCancelButton = (createAt: string): boolean => {
    const bookingDateObj = new Date(createAt);
    const threeDaysAfterBooking = new Date(bookingDateObj);
    threeDaysAfterBooking.setDate(bookingDateObj.getDate() + 3);
    const currentDate = new Date();
    return threeDaysAfterBooking > currentDate;
  };

  useEffect(() => {
    const fetchBookingHistory = async () => {
      if (!isInitialized) {
        return;
      }

      if (!user?.id) {
        setError("Vui lòng đăng nhập để xem lịch sử đặt phòng");
        setLoading(false);
        return;
      }

      try {
        const guestData: ResponseGuestDTO = await getGuestByAccountId(user.id);
        setGuestId(guestData.id);

        const allBookings: ResponseBookingConfirmationFormDTO[] =
          await getAllBookingConfirmationForms();
        const userBookings = allBookings.filter(
          (booking) => booking.guestId === guestData.id
        );
        for (const booking of userBookings) {
          const room = await getRoomById(booking.roomId);
          const roomType = await getRoomTypeById(room.roomTypeId);
          booking.roomName = room.name;
          booking.roomTypeName = roomType.name;

          // Lấy hình ảnh phòng
          try {
            const images = await getImagesByRoomId(booking.roomId);
            if (images && images.length > 0) {
              setRoomImages((prev) => ({
                ...prev,
                [booking.roomId]: images[0].url, // Lấy ảnh đầu tiên
              }));
            }
          } catch (err) {
            console.error(
              `Error fetching images for room ${booking.roomId}:`,
              err
            );
          }
        }
        setBookings(userBookings);
        // Lấy toàn bộ rental form
        const allRentalForms = await getAllRentalFormsNoPage();
        setRentalForms(allRentalForms);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching booking history:", err);
        setError("Không thể tải lịch sử đặt phòng");
        setLoading(false);
      }
    };

    fetchBookingHistory();
  }, [user?.id, isInitialized]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để hủy đặt phòng");
      return;
    }

    // Custom toast xác nhận
    let toastId: number | string | undefined;
    const ConfirmToast = () => (
      <div>
        <div className="mb-2 text-lg font-semibold">
          Bạn có chắc chắn muốn hủy đơn đặt phòng này? Hành động này không thể
          hoàn tác.
        </div>
        <div className="flex gap-2 justify-end mt-2">
          <button
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded mr-2"
            onClick={() => {
              if (toastId) toast.dismiss(toastId);
            }}
          >
            Hủy
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            onClick={async () => {
              if (toastId) toast.dismiss(toastId);
              try {
                await deleteBookingConfirmationForm(
                  bookingId,
                  user.id,
                  "GUEST"
                );
                setBookings(
                  bookings.filter((booking) => booking.id !== bookingId)
                );
                toast.success("Hủy đặt phòng thành công!");
              } catch (err) {
                console.error("Error cancelling booking:", err);
                toast.error("Không thể hủy đặt phòng. Vui lòng thử lại sau.");
              }
            }}
          >
            Xác nhận
          </button>
        </div>
      </div>
    );
    toastId = toast.info(<ConfirmToast />, {
      autoClose: false,
      closeOnClick: false,
    });
  };

  const handleSubmitReview = async (bookingId: number) => {
    if (!user?.id || !guestId) {
      toast.error("Vui lòng đăng nhập để đánh giá");
      return;
    }

    if (rating === 0) {
      toast.error("Vui lòng chọn số sao để đánh giá");
      return;
    }

    const reviewData = {
      roomId: bookings.find((b) => b.id === bookingId)?.roomId || 0,
      guestId: guestId,
      rating: rating,
      comment: comment,
    };

    try {
      await createReview(reviewData, user.id, "GUEST");
      setShowReviewForm(null);
      setRating(0);
      setComment("");
      toast.success("Đánh giá thành công!");
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error("Không thể gửi đánh giá. Vui lòng thử lại sau.");
    }
  };

  const generateQRCode = async (amount: number, bookingId: number) => {
    try {
      setIsGeneratingQR(true);
      const accountNo = "5622889955";
      const accountName = "KHACH SAN 5 SAO";
      const acqId = "970418";
      const transferContent = `Thanh toan tien phong #${bookingId}`.slice(
        0,
        50
      );

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
      toast.error(`Lỗi khi tạo mã QR: ${error}`);
      setQrCodeUrl("");
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleShowQRModal = async (
    booking: ResponseBookingConfirmationFormDTO
  ) => {
    setSelectedBookingForQR(booking);
    setShowQRModal(true);
    setQrCodeUrl("");
    setQrPrice(0);
    // Lấy thông tin phòng từ API
    try {
      const room = await getRoomById(booking.roomId);
      const roomType = await getRoomTypeById(room.roomTypeId);
      const price = roomType.price ?? 0;
      setQrPrice(price);
      const amount = (booking.rentalDays || 1) * price;
      await generateQRCode(amount, booking.id);
    } catch (error) {
      toast.error("Không thể lấy thông tin phòng để tạo mã QR");
      setQrCodeUrl("");
    }
  };

  if (loading)
    return (
      <div
        className={`min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-42 transition-all duration-300 ${
          theme === "light" ? "bg-gray-100" : "bg-gray-900"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div
            className={`h-8 sm:h-10 md:h-12 lg:h-16 w-3/4 mx-auto ${
              theme === "light" ? "bg-gray-300" : "bg-gray-600"
            } rounded animate-pulse mb-6 sm:mb-8 md:mb-10 lg:mb-12`}
          ></div>

          {/* Booking cards skeleton */}
          <div className="grid gap-4 sm:gap-6">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className={`shadow-md rounded-lg p-4 sm:p-6 transition-all duration-300 ${
                  theme === "light" ? "bg-white" : "bg-gray-800"
                }`}
              >
                {/* Header skeleton */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2 sm:gap-0">
                  <div
                    className={`h-4 sm:h-5 md:h-6 lg:h-7 w-32 sm:w-40 ${
                      theme === "light" ? "bg-gray-300" : "bg-gray-600"
                    } rounded animate-pulse`}
                  ></div>
                  <div
                    className={`h-4 sm:h-5 md:h-6 lg:h-7 w-24 sm:w-32 ${
                      theme === "light" ? "bg-gray-300" : "bg-gray-600"
                    } rounded animate-pulse`}
                  ></div>
                </div>

                {/* Content skeleton */}
                <div className="space-y-2 sm:space-y-3">
                  <div
                    className={`h-4 sm:h-5 md:h-6 lg:h-7 w-3/4 ${
                      theme === "light" ? "bg-gray-300" : "bg-gray-600"
                    } rounded animate-pulse`}
                  ></div>
                  <div
                    className={`h-4 sm:h-5 md:h-6 lg:h-7 w-1/2 ${
                      theme === "light" ? "bg-gray-300" : "bg-gray-600"
                    } rounded animate-pulse`}
                  ></div>
                  <div
                    className={`h-4 sm:h-5 md:h-6 lg:h-7 w-2/3 ${
                      theme === "light" ? "bg-gray-300" : "bg-gray-600"
                    } rounded animate-pulse`}
                  ></div>
                  <div
                    className={`h-4 sm:h-5 md:h-6 lg:h-7 w-1/3 ${
                      theme === "light" ? "bg-gray-300" : "bg-gray-600"
                    } rounded animate-pulse`}
                  ></div>
                </div>

                {/* Buttons skeleton */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4">
                  <div
                    className={`h-8 sm:h-10 w-20 sm:w-24 ${
                      theme === "light" ? "bg-gray-200" : "bg-gray-700"
                    } rounded animate-pulse`}
                  ></div>
                  <div
                    className={`h-8 sm:h-10 w-24 sm:w-28 ${
                      theme === "light" ? "bg-gray-200" : "bg-gray-700"
                    } rounded animate-pulse`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  if (error)
    return (
      <div
        className={`text-center py-8 sm:py-12 text-lg sm:text-xl font-semibold transition-all duration-300 ${
          theme === "light" ? "text-red-600" : "text-red-400"
        }`}
      >
        {toast.error(error)}
      </div>
    );
  if (!bookings.length)
    return (
      <div
        className={`text-center py-12 sm:py-16 md:py-24 lg:py-48 px-4 sm:px-8 md:px-16 lg:px-42 text-xl sm:text-2xl font-semibold transition-all duration-300 ${
          theme === "light" ? "text-gray-600" : "text-gray-300"
        }`}
      >
        Không có lịch sử đặt phòng
      </div>
    );

  return (
    <div
      className={`min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-42 transition-all duration-300 ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <h2
          className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-playfair font-extrabold text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 transition-all duration-300 ${
            theme === "light" ? "text-gray-900" : "text-gray-100"
          }`}
        >
          Lịch Sử Đặt Phòng
        </h2>
        <div className="grid gap-4 sm:gap-6">
          {bookings.map((booking) => {
            // Tìm rental form khớp với booking
            const rentalForm = rentalForms.find(
              (rf) =>
                rf.roomId === booking.roomId &&
                rf.rentalDate === booking.bookingDate &&
                rf.numberOfRentalDays === booking.rentalDays
            );
            const isPaid = rentalForm && rentalForm.isPaidAt;
            return (
              <div
                key={booking.id}
                className={`shadow-md rounded-lg p-4 sm:p-6 transition-all duration-300 ${
                  theme === "light" ? "bg-white" : "bg-gray-800"
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                  {/* Hình ảnh phòng bên trái */}
                  <div className="lg:w-1/3">
                    {roomImages[booking.roomId] ? (
                      <img
                        src={roomImages[booking.roomId]}
                        alt={`Phòng ${booking.roomName}`}
                        className="w-full h-48 sm:h-56 md:h-64 lg:h-68 object-cover rounded-lg shadow-md"
                      />
                    ) : (
                      <div
                        className={`w-full h-48 sm:h-56 md:h-64 lg:h-48 rounded-lg shadow-md flex items-center justify-center ${
                          theme === "light" ? "bg-gray-200" : "bg-gray-700"
                        }`}
                      >
                        <span
                          className={`text-sm sm:text-base md:text-lg ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          Không có hình ảnh
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Thông tin đặt phòng bên phải */}
                  <div className="lg:w-2/3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2 sm:gap-0">
                      <span
                        className={`text-base sm:text-lg md:text-xl lg:text-2xl ${
                          theme === "light" ? "text-gray-600" : "text-gray-300"
                        }`}
                      >
                        <span className="font-semibold">Mã phiếu:</span>{" "}
                        {booking.id}
                      </span>
                      <span
                        className={`text-base sm:text-lg md:text-xl lg:text-2xl ${
                          theme === "light" ? "text-gray-600" : "text-gray-300"
                        }`}
                      >
                        <span className="font-semibold">Trạng thái:</span>{" "}
                        <span
                          className={`${
                            bookingStateColor[booking.bookingState]
                          }`}
                        >
                          {bookingState[booking.bookingState]}
                        </span>
                      </span>
                    </div>
                    <p
                      className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-2 sm:mb-3 ${
                        theme === "light" ? "text-gray-600" : "text-gray-300"
                      }`}
                    >
                      <span className="font-semibold">Phòng:</span>{" "}
                      {booking.roomName} - {booking.roomTypeName}
                    </p>
                    <p
                      className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-2 sm:mb-3 ${
                        theme === "light" ? "text-gray-600" : "text-gray-300"
                      }`}
                    >
                      <span className="font-semibold">Ngày đặt:</span>{" "}
                      {new Date(booking.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                    <p
                      className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-2 sm:mb-3 ${
                        theme === "light" ? "text-gray-600" : "text-gray-300"
                      }`}
                    >
                      <span className="font-semibold">Ngày nhận phòng:</span>{" "}
                      {new Date(booking.bookingDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                    <p
                      className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-2 sm:mb-3 ${
                        theme === "light" ? "text-gray-600" : "text-gray-300"
                      }`}
                    >
                      <span className="font-semibold">Số ngày thuê:</span>{" "}
                      {booking.rentalDays}
                    </p>
                    {booking.bookingState === "PENDING" &&
                      canShowCancelButton(booking.createdAt) && (
                        <div className="flex justify-end gap-2 sm:gap-4 mt-4">
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="bg-red-500 text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold py-1 sm:py-2 px-3 sm:px-4 md:px-6 rounded-lg hover:bg-red-600 transition"
                          >
                            Hủy
                          </button>
                        </div>
                      )}
                    {booking.bookingState === "COMMITED" && (
                      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4">
                        {!isPaid && (
                          <>
                            <button
                              onClick={() => setShowReviewForm(booking.id)}
                              className="bg-blue-500 text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold py-1 sm:py-2 px-3 sm:px-4 md:px-6 rounded-lg hover:bg-blue-600 transition"
                            >
                              Đánh giá
                            </button>
                            <button
                              onClick={() => handleShowQRModal(booking)}
                              className="bg-green-500 text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold py-1 sm:py-2 px-3 sm:px-4 md:px-6 rounded-lg hover:bg-green-600 transition"
                            >
                              Check Out
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    {isPaid && (
                      <div className="flex justify-end mt-4">
                        <button
                          className="bg-gray-400 text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold py-1 sm:py-2 px-3 sm:px-4 md:px-6 rounded-lg cursor-not-allowed"
                          disabled
                        >
                          Đã thanh toán
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* Form đánh giá */}
                {showReviewForm === booking.id && (
                  <div
                    className={`mt-4 p-3 sm:p-4 rounded-lg transition-all duration-300 ${
                      theme === "light" ? "bg-gray-50" : "bg-gray-700"
                    }`}
                  >
                    <h3
                      className={`text-lg sm:text-xl md:text-2xl font-semibold mb-2 ${
                        theme === "light" ? "text-gray-600" : "text-gray-200"
                      }`}
                    >
                      Đánh giá phòng
                    </h3>
                    <div className="mb-2 flex gap-1">
                      <label
                        className={`block text-sm sm:text-base md:text-lg lg:text-xl font-medium mb-1 ${
                          theme === "light" ? "text-gray-600" : "text-gray-200"
                        }`}
                      >
                        Số sao:
                      </label>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          onClick={() => setRating(star)}
                          className="cursor-pointer text-lg sm:text-xl md:text-2xl"
                        >
                          {star <= rating ? (
                            <img
                              src={starIconFilled}
                              alt="star"
                              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                            />
                          ) : (
                            <img
                              src={starIconOutlined}
                              alt="star"
                              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                            />
                          )}
                        </span>
                      ))}
                    </div>
                    <div className="mb-2">
                      <label
                        className={`block text-sm sm:text-base md:text-lg lg:text-xl font-medium mb-1 ${
                          theme === "light" ? "text-gray-600" : "text-gray-200"
                        }`}
                      >
                        Bình luận:
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className={`w-full p-2 border rounded-lg text-sm sm:text-base md:text-lg lg:text-xl transition-all duration-300 ${
                          theme === "light"
                            ? "border-gray-300 text-gray-900 bg-white"
                            : "border-gray-600 text-gray-100 bg-gray-800"
                        }`}
                        rows={3}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                      <button
                        onClick={() => setShowReviewForm(null)}
                        className="bg-gray-500 text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold py-1 sm:py-2 px-3 sm:px-4 md:px-6 rounded-lg hover:bg-gray-600 transition"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleSubmitReview(booking.id)}
                        className={`text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold py-1 sm:py-2 px-3 sm:px-4 md:px-6 rounded-lg transition-all duration-300 ${
                          theme === "light"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        Gửi đánh giá
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Modal QR Code */}
      {showQRModal && selectedBookingForQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-opacity-50"></div>
          <div
            className={`rounded-2xl shadow-2xl max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl w-full p-4 sm:p-6 relative transition-all duration-300 ${
              theme === "light" ? "bg-white" : "bg-gray-800"
            }`}
          >
            <button
              onClick={() => {
                setShowQRModal(false);
                setQrCodeUrl("");
                setQrPrice(0);
                setSelectedBookingForQR(null);
              }}
              className={`absolute top-2 sm:top-4 right-2 sm:right-4 transition-all duration-300 ${
                theme === "light"
                  ? "text-gray-500 hover:text-gray-700"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
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

            <h3
              className={`text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-center transition-all duration-300 ${
                theme === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              Thanh toán QR
            </h3>

            <div
              className={`mb-4 sm:mb-6 md:mb-8 text-center text-sm sm:text-base md:text-lg lg:text-2xl space-y-2 sm:space-y-3 ${
                theme === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              <div>
                Mã phiếu: <b>{selectedBookingForQR.id}</b>
              </div>
              <div>
                Phòng: <b>{selectedBookingForQR.roomName}</b>
              </div>
              <div>
                Loại phòng: <b>{selectedBookingForQR.roomTypeName}</b>
              </div>
              <div>
                Ngày nhận phòng:{" "}
                <b>
                  {new Date(
                    selectedBookingForQR.bookingDate
                  ).toLocaleDateString("vi-VN")}
                </b>
              </div>
              <div>
                Số ngày thuê: <b>{selectedBookingForQR.rentalDays}</b>
              </div>
              <div
                className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${
                  theme === "light" ? "text-green-600" : "text-green-400"
                }`}
              >
                Số tiền:{" "}
                <b>
                  {(
                    (selectedBookingForQR.rentalDays || 1) * qrPrice
                  ).toLocaleString("vi-VN")}{" "}
                  VNĐ
                </b>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-4">
              {isGeneratingQR ? (
                <div
                  className={`animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-t-4 transition-all duration-300 ${
                    theme === "light" ? "border-blue-500" : "border-blue-400"
                  }`}
                ></div>
              ) : qrCodeUrl ? (
                <>
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 object-contain rounded-lg shadow-md mb-4 sm:mb-6"
                  />
                  <p
                    className={`text-sm sm:text-base md:text-lg lg:text-2xl text-center transition-all duration-300 ${
                      theme === "light" ? "text-gray-800" : "text-gray-200"
                    }`}
                  >
                    Vui lòng quét mã QR để thực hiện thanh toán
                  </p>
                </>
              ) : (
                <p
                  className={`transition-all duration-300 ${
                    theme === "light" ? "text-red-600" : "text-red-400"
                  }`}
                >
                  Đang tạo mã QR...
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6 md:mt-8">
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setQrCodeUrl("");
                  setQrPrice(0);
                  setSelectedBookingForQR(null);
                }}
                className={`px-4 sm:px-6 py-2 rounded-lg transition-all duration-300 ${
                  theme === "light"
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                }`}
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  if (!selectedBookingForQR) return;
                  try {
                    // Tạo phiếu thuê (RentalForm)
                    const rentalFormData = {
                      roomId: selectedBookingForQR.roomId,
                      staffId: 1,
                      rentalDate: selectedBookingForQR.bookingDate,
                      numberOfRentalDays: selectedBookingForQR.rentalDays,
                    };
                    const rentalForm = await createRentalForm(
                      rentalFormData,
                      1,
                      "MANAGER"
                    );
                    // Tạo rental form detail
                    const rentalFormDetailData = {
                      rentalFormId: rentalForm.id,
                      guestId: selectedBookingForQR.guestId,
                    };
                    await createRentalFormDetail(
                      rentalFormDetailData,
                      1,
                      "MANAGER"
                    );
                    // Tạo hóa đơn (invoice)
                    const totalCost =
                      (selectedBookingForQR.rentalDays || 1) * qrPrice;
                    const invoiceData = {
                      totalReservationCost: totalCost,
                      payingGuestId: selectedBookingForQR.guestId,
                      staffId: 1,
                    };
                    const invoice = await createInvoice(
                      invoiceData,
                      1,
                      "STAFF"
                    );
                    // Tạo invoice detail
                    const invoiceDetailData = {
                      numberOfRentalDays: selectedBookingForQR.rentalDays,
                      invoiceId: invoice.id,
                      reservationCost: totalCost,
                      rentalFormId: rentalForm.id,
                    };
                    await createInvoiceDetail(invoiceDetailData, 1, "STAFF");
                    // Update trạng thái phòng thành BEING_CLEANED
                    const room = await getRoomById(selectedBookingForQR.roomId);
                    const updatedRoom = {
                      name: room.name,
                      note: room.note,
                      roomState:
                        "BEING_CLEANED" as import("../types").RoomState,
                      roomTypeId: room.roomTypeId,
                      floorId: room.floorId,
                    };
                    await updateRoom(room.id, updatedRoom, 1, "MANAGER");
                    toast.success(
                      "Thanh toán thành công, Roomify xin cảm ơn và hẹn gặp lại quý khách!"
                    );
                    window.location.reload();
                  } catch (error) {
                    toast.error("Lỗi khi tạo phiếu thuê/hóa đơn: " + error);
                  }
                  setShowQRModal(false);
                  setQrCodeUrl("");
                  setQrPrice(0);
                  setSelectedBookingForQR(null);
                }}
                disabled={isGeneratingQR || !qrCodeUrl}
                className={`px-4 sm:px-6 py-2 rounded-lg text-white transition-all duration-300 flex items-center justify-center ${
                  theme === "light"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } disabled:opacity-50`}
              >
                {isGeneratingQR ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className={`transition-all duration-300 ${
                          theme === "light" ? "opacity-25" : "opacity-50"
                        }`}
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
                    <span className="text-sm sm:text-base">Đang xử lý...</span>
                  </div>
                ) : (
                  <span className="flex items-center text-sm sm:text-base">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
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
      )}
    </div>
  );
};

export default BookingHistory;
