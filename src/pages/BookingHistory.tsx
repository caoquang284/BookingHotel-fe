import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { getGuestByAccountId } from "../services/apis/guest";
import { getRoomById, updateRoom } from "../services/apis/room";
import {
  getAllBookingConfirmationForms,
  getBookingConfirmationFormById,
} from "../services/apis/bookingconfirm";
import { deleteBookingConfirmationForm } from "../services/apis/bookingconfirm";
import { createReview } from "../services/apis/review"; // Thêm API tạo đánh giá
import { getImagesByRoomId } from "../services/apis/image"; // Thêm API lấy hình ảnh
import type { ResponseGuestDTO } from "../types/index.ts";
import type {
  ResponseBookingConfirmationFormDTO,
  ResponseRentalFormDetailDTO,
} from "../types";
import { getRoomTypeById } from "../services/apis/roomType";
import starIconFilled from "../assets/Icon/starIconFilled.svg";
import starIconOutlined from "../assets/Icon/starIconOutlined.svg";
import { toast } from "react-toastify";
import type { ToastContent, ToastOptions } from "react-toastify";
import {
  createRentalForm,
  getAllRentalFormsNoPage,
} from "../services/apis/rentalform";
import {
  createRentalFormDetail,
  getAllRentalFormDetailsByUserId,
} from "../services/apis/rentalFormDetail";
import { createInvoice, sendEmailToGuests } from "../services/apis/invoice";
import { createInvoiceDetail } from "../services/apis/invoicedetail";
import {
  createRentalExtensionForm,
  getDayRemains,
  getRentalExtensionFormsByRentalFormId,
} from "../services/apis/rentalFormExtension";
import { updateRentalForm } from "../services/apis/rentalform";

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
  const [rentalFormDetails, setRentalFormDetails] = useState<
    ResponseRentalFormDetailDTO[]
  >([]);
  const [roomImages, setRoomImages] = useState<{ [roomId: number]: string }>(
    {}
  ); // State lưu hình ảnh phòng
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [selectedBookingForExtension, setSelectedBookingForExtension] =
    useState<ResponseBookingConfirmationFormDTO | null>(null);
  const [extensionDays, setExtensionDays] = useState<number>(1);
  const [existingRentalFormId, setExistingRentalFormId] = useState<
    number | null
  >(null);
  const [extensionInfo, setExtensionInfo] = useState<{
    totalDays: number;
    extensionDays: number;
    extensionCost: number;
  } | null>(null);
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

        // Lấy toàn bộ rental form details
        const allRentalFormDetails = await getAllRentalFormDetailsByUserId(
          guestData.id
        );
        setRentalFormDetails(allRentalFormDetails);

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
                const booking = await getBookingConfirmationFormById(bookingId);
                const room = await getRoomById(booking.roomId);
                await deleteBookingConfirmationForm(
                  bookingId,
                  user.id,
                  "GUEST"
                );
                const updatedRoom = {
                  name: room.name,
                  note: room.note,
                  roomState: "READY_TO_SERVE" as import("../types").RoomState,
                  roomTypeId: room.roomTypeId,
                  floorId: room.floorId,
                };
                await updateRoom(room.id, updatedRoom, 1, "MANAGER");
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
    setExtensionInfo(null);
    console.log(extensionInfo);
    // Lấy thông tin phòng từ API
    try {
      const room = await getRoomById(booking.roomId);
      const roomType = await getRoomTypeById(room.roomTypeId);
      const price = roomType.price ?? 0;
      setQrPrice(price);

      // Kiểm tra xem có rental form và extension forms không
      const allRentalForms = await getAllRentalFormsNoPage();
      const guestRentalFormDetails = await getAllRentalFormDetailsByUserId(
        booking.guestId
      );

      const guestRentalFormIds = guestRentalFormDetails.map(
        (detail: ResponseRentalFormDetailDTO) => detail.rentalFormId
      );

      const existingRentalForm = allRentalForms.find(
        (rental: any) =>
          guestRentalFormIds.includes(rental.id) &&
          rental.roomId === booking.roomId &&
          rental.numberOfRentalDays === booking.rentalDays
      );

      if (existingRentalForm) {
        // Tính toán thông tin gia hạn
        const extensionForms = await getRentalExtensionFormsByRentalFormId(
          existingRentalForm.id
        );
        const extensionDays = extensionForms.reduce(
          (
            total: number,
            ext: import("../types").ResponseRentalExtensionFormDTO
          ) => total + ext.numberOfRentalDays,
          0
        );
        const extensionCost = extensionDays * price;
        const totalDays = booking.rentalDays + extensionDays;

        setExtensionInfo({
          totalDays,
          extensionDays,
          extensionCost,
        });

        const totalAmount = totalDays * price;
        await generateQRCode(totalAmount, booking.id);
      } else {
        const amount = (booking.rentalDays || 1) * price;
        await generateQRCode(amount, booking.id);
      }
    } catch (error) {
      toast.error("Không thể lấy thông tin phòng để tạo mã QR");
      setQrCodeUrl("");
    }
  };

  const handleShowExtensionModal = async (
    booking: ResponseBookingConfirmationFormDTO
  ) => {
    try {
      // Kiểm tra xem khách đã checkin chưa
      const allRentalForms = await getAllRentalFormsNoPage();
      const guestRentalFormDetails = await getAllRentalFormDetailsByUserId(
        booking.guestId
      );

      const guestRentalFormIds = guestRentalFormDetails.map(
        (detail: ResponseRentalFormDetailDTO) => detail.rentalFormId
      );

      const existingRentalForm = allRentalForms.find(
        (rental: any) =>
          guestRentalFormIds.includes(rental.id) &&
          rental.roomId === booking.roomId &&
          rental.numberOfRentalDays === booking.rentalDays
      );

      console.log(booking.rentalDays);

      if (!existingRentalForm) {
        toast.error(
          "Bạn phải checkin tại khách sạn trước rồi mới được gia hạn!"
        );
        return;
      }

      setSelectedBookingForExtension(booking);
      setExistingRentalFormId(existingRentalForm.id);
      setExtensionDays(1);
      setShowExtensionModal(true);
    } catch (error) {
      toast.error("Không thể mở modal gia hạn: " + error);
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
            // Lấy danh sách rental form details có guestId trùng với guest hiện tại
            const guestRentalFormDetails = rentalFormDetails.filter(
              (detail: ResponseRentalFormDetailDTO) =>
                detail.guestId === booking.guestId
            );

            // Lấy danh sách rentalFormId từ rental form details
            const guestRentalFormIds = guestRentalFormDetails.map(
              (detail: ResponseRentalFormDetailDTO) => detail.rentalFormId
            );

            // Tìm rental form khớp với booking từ danh sách rentalFormId của guest
            const rentalForm = rentalForms.find((rf) => {
              return (
                guestRentalFormIds.includes(rf.id) &&
                rf.roomId === booking.roomId &&
                rf.numberOfRentalDays === booking.rentalDays
              );
            });

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
                              onClick={() => handleShowExtensionModal(booking)}
                              className="bg-purple-500 text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold py-1 sm:py-2 px-3 sm:px-4 md:px-6 rounded-lg hover:bg-purple-600 transition"
                            >
                              Gia hạn
                            </button>
                            <button
                              onClick={() => handleShowQRModal(booking)}
                              className="bg-green-500 text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold py-1 sm:py-2 px-3 sm:px-4 md:px-6 rounded-lg hover:bg-green-600 transition"
                            >
                              Check Out
                            </button>
                          </>
                        )}
                        {isPaid && (
                          <button
                            className="bg-gray-400 text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold py-1 sm:py-2 px-3 sm:px-4 md:px-6 rounded-lg cursor-not-allowed"
                            disabled
                          >
                            Đã thanh toán
                          </button>
                        )}
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
            className={`rounded-2xl shadow-2xl max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl w-full p-3 sm:p-4 relative transition-all duration-300 ${
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
              className={`absolute top-2 sm:top-3 right-2 sm:right-3 transition-all duration-300 ${
                theme === "light"
                  ? "text-gray-500 hover:text-gray-700"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
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
              className={`text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-center transition-all duration-300 ${
                theme === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              Thanh toán QR
            </h3>

            <div
              className={`mb-3 sm:mb-4 text-center text-sm sm:text-base md:text-lg space-y-1 sm:space-y-2 ${
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
                Số ngày thuê gốc: <b>{selectedBookingForQR.rentalDays}</b>
              </div>
              {extensionInfo && extensionInfo.extensionDays > 0 && (
                <>
                  <div>
                    Số ngày gia hạn: <b>{extensionInfo.extensionDays}</b>
                  </div>
                  <div>
                    Tổng số ngày thuê: <b>{extensionInfo.totalDays}</b>
                  </div>
                  <div>
                    Chi phí gia hạn:{" "}
                    <b>
                      {extensionInfo.extensionCost.toLocaleString("vi-VN")} VNĐ
                    </b>
                  </div>
                </>
              )}
              <div
                className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${
                  theme === "light" ? "text-green-600" : "text-green-400"
                }`}
              >
                Tổng số tiền:{" "}
                <b>
                  {extensionInfo
                    ? (extensionInfo.totalDays * qrPrice).toLocaleString(
                        "vi-VN"
                      )
                    : (
                        (selectedBookingForQR.rentalDays || 1) * qrPrice
                      ).toLocaleString("vi-VN")}{" "}
                  VNĐ
                </b>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-3">
              {isGeneratingQR ? (
                <div
                  className={`animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 border-t-4 transition-all duration-300 ${
                    theme === "light" ? "border-blue-500" : "border-blue-400"
                  }`}
                ></div>
              ) : qrCodeUrl ? (
                <>
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain rounded-lg shadow-md mb-3"
                  />
                  <p
                    className={`text-sm sm:text-base md:text-lg text-center transition-all duration-300 ${
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

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-3 sm:mt-4">
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
                    // Bước 1: Kiểm tra xem khách đã checkin chưa bằng cách tìm rental form
                    const allRentalForms = await getAllRentalFormsNoPage();
                    const guestRentalFormDetails =
                      await getAllRentalFormDetailsByUserId(
                        selectedBookingForQR.guestId
                      );

                    // Lấy danh sách rental form IDs của khách
                    const guestRentalFormIds = guestRentalFormDetails.map(
                      (detail: ResponseRentalFormDetailDTO) =>
                        detail.rentalFormId
                    );

                    // Tìm rental form có roomId và rentalDate trùng với booking
                    const existingRentalForm = allRentalForms.find(
                      (rental: any) =>
                        guestRentalFormIds.includes(rental.id) &&
                        rental.roomId === selectedBookingForQR.roomId &&
                        rental.numberOfRentalDays ===
                          selectedBookingForQR.rentalDays
                    );

                    if (!existingRentalForm) {
                      toast.error(
                        "Bạn phải checkin tại khách sạn trước rồi mới được checkout!"
                      );
                      setShowQRModal(false);
                      setQrCodeUrl("");
                      setQrPrice(0);
                      setSelectedBookingForQR(null);
                      return;
                    }

                    // Bước 2: Tạo hóa đơn (invoice) cho rental form đã tồn tại
                    const totalCost =
                      Number(Number(selectedBookingForQR.rentalDays) || 1) *
                      qrPrice;

                    const extensionForms =
                      await getRentalExtensionFormsByRentalFormId(
                        existingRentalForm.id
                      );

                    // Sử dụng bản ghi đầu tiên từ danh sách extensionForms
                    const firstExtensionForm =
                      extensionForms && extensionForms.length > 0
                        ? extensionForms[0]
                        : null;

                    const finalTotalCost = firstExtensionForm
                      ? Number(firstExtensionForm.numberOfRentalDays) * qrPrice
                      : totalCost;

                    const invoiceData = {
                      totalReservationCost: finalTotalCost,
                      payingGuestId: selectedBookingForQR.guestId,
                      staffId: 1,
                    };
                    const invoice = await createInvoice(
                      invoiceData,
                      1,
                      "MANAGER"
                    );
                    console.log(invoice);
                    console.log(firstExtensionForm);
                    console.log(finalTotalCost);
                    // Bước 3: Tạo invoice detail
                    const invoiceDetailData = {
                      numberOfRentalDays: firstExtensionForm
                        ? firstExtensionForm.numberOfRentalDays
                        : selectedBookingForQR.rentalDays,
                      invoiceId: invoice.id,
                      reservationCost: finalTotalCost,
                      rentalFormId: existingRentalForm.id,
                    };

                    console.log(invoiceDetailData);
                    await createInvoiceDetail(invoiceDetailData, 1, "STAFF");

                    // Bước 4: Gửi email cho khách hàng
                    try {
                      await sendEmailToGuests(invoice.id, 1, "MANAGER");
                    } catch (emailError) {
                      console.error("Lỗi khi gửi email:", emailError);
                      // Không dừng quá trình nếu gửi email thất bại
                    }

                    // Bước 5: Update trạng thái phòng thành BEING_CLEANED
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
                  } catch (error) {
                    toast.error("Lỗi khi tạo hóa đơn: " + error);
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

      {/* Modal Gia hạn */}
      {showExtensionModal && selectedBookingForExtension && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-opacity-50"></div>
          <div
            className={`rounded-2xl shadow-2xl max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl w-full p-4 sm:p-6 relative transition-all duration-300 ${
              theme === "light" ? "bg-white" : "bg-gray-800"
            }`}
          >
            <button
              onClick={() => {
                setShowExtensionModal(false);
                setSelectedBookingForExtension(null);
                setExistingRentalFormId(null);
                setExtensionDays(1);
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
              Gia hạn thêm ngày
            </h3>

            <div
              className={`mb-4 sm:mb-6 md:mb-8 text-center text-sm sm:text-base md:text-lg lg:text-2xl space-y-2 sm:space-y-3 ${
                theme === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              <div>
                Mã phiếu: <b>{selectedBookingForExtension.id}</b>
              </div>
              <div>
                Phòng: <b>{selectedBookingForExtension.roomName}</b>
              </div>
              <div>
                Loại phòng: <b>{selectedBookingForExtension.roomTypeName}</b>
              </div>
              <div>
                Ngày nhận phòng:{" "}
                <b>
                  {new Date(
                    selectedBookingForExtension.bookingDate
                  ).toLocaleDateString("vi-VN")}
                </b>
              </div>
              <div>
                Số ngày thuê hiện tại:{" "}
                <b>{selectedBookingForExtension.rentalDays}</b>
              </div>
            </div>

            <div className="mb-4 sm:mb-6 md:mb-8">
              <label
                className={`block text-sm sm:text-base md:text-lg lg:text-xl font-medium mb-2 ${
                  theme === "light" ? "text-gray-700" : "text-gray-300"
                }`}
              >
                Số ngày gia hạn thêm:
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={extensionDays}
                onChange={(e) =>
                  setExtensionDays(parseInt(e.target.value) || 1)
                }
                className={`w-full p-2 border rounded-lg text-sm sm:text-base md:text-lg lg:text-xl transition-all duration-300 ${
                  theme === "light"
                    ? "border-gray-300 text-gray-900 bg-white"
                    : "border-gray-600 text-gray-100 bg-gray-800"
                }`}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6 md:mt-8">
              <button
                onClick={() => {
                  setShowExtensionModal(false);
                  setSelectedBookingForExtension(null);
                  setExistingRentalFormId(null);
                  setExtensionDays(1);
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
                  if (!selectedBookingForExtension || !existingRentalFormId)
                    return;
                  try {
                    // Tạo phiếu gia hạn
                    const extensionData = {
                      rentalFormId: existingRentalFormId,
                      numberOfRentalDays: extensionDays,
                      staffId: 1,
                    };

                    const extensionForm = await createRentalExtensionForm(
                      extensionData,
                      1,
                      "MANAGER"
                    );

                    toast.success(
                      `Gia hạn thành công thêm ${extensionDays} ngày!`
                    );
                    setShowExtensionModal(false);
                    setSelectedBookingForExtension(null);
                    setExistingRentalFormId(null);
                    setExtensionDays(1);
                    window.location.reload();
                  } catch (error) {
                    toast.error("Lỗi khi tạo phiếu gia hạn: " + error);
                  }
                }}
                className={`px-4 sm:px-6 py-2 rounded-lg text-white transition-all duration-300 flex items-center justify-center ${
                  theme === "light"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Xác nhận gia hạn
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
