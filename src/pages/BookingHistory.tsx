import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getGuestByAccountId } from "../services/apis/guest";
import { getRoomById } from "../services/apis/room";
import { getAllBookingConfirmationForms } from "../services/apis/bookingconfirm";
import { deleteBookingConfirmationForm } from "../services/apis/bookingconfirm";
import { createReview } from "../services/apis/review";
import type { ResponseGuestDTO } from "../types/index.ts";
import type { ResponseBookingConfirmationFormDTO } from "../types";
import { getRoomTypeById } from "../services/apis/roomType";
import starIconFilled from "../assets/Icon/starIconFilled.svg";
import starIconOutlined from "../assets/Icon/starIconOutlined.svg";
import { toast } from "react-toastify";

const BookingHistory: React.FC = () => {
  const { user } = useAuth();
  const [guestId, setGuestId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<
    ResponseBookingConfirmationFormDTO[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
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
  const canShowCancelButton = (bookingDate: string): boolean => {
    const bookingDateObj = new Date(bookingDate);
    const threeDaysAfterBooking = new Date(bookingDateObj);
    threeDaysAfterBooking.setDate(bookingDateObj.getDate() + 3);
    const currentDate = new Date();
    console.log("3 ngay sau", threeDaysAfterBooking);
    console.log(currentDate);
    return threeDaysAfterBooking < currentDate;
  };

  useEffect(() => {
    const fetchBookingHistory = async () => {
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
        }
        setBookings(userBookings);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching booking history:", err);
        setError("Không thể tải lịch sử đặt phòng");
        setLoading(false);
      }
    };

    fetchBookingHistory();
  }, [user?.id]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!user?.id) {
      setError("Vui lòng đăng nhập để hủy đặt phòng");
      return;
    }

    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn hủy đơn đặt phòng này? Hành động này không thể hoàn tác."
    );

    if (confirmed) {
      try {
        await deleteBookingConfirmationForm(bookingId, user.id, "GUEST");
        setBookings(bookings.filter((booking) => booking.id !== bookingId));
        toast.success("Hủy đặt phòng thành công!");
      } catch (err) {
        console.error("Error cancelling booking:", err);
        setError("Không thể hủy đặt phòng. Vui lòng thử lại sau.");
      }
    }
  };

  const handleSubmitReview = async (bookingId: number) => {
    if (!user?.id || !guestId) {
      setError("Vui lòng đăng nhập để đánh giá");
      return;
    }

    if (rating === 0) {
      setError("Vui lòng chọn số sao để đánh giá");
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
      setError("Không thể gửi đánh giá. Vui lòng thử lại sau.");
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
  if (!bookings.length)
    return (
      <div className="text-center py-12 text-gray-600 text-2xl font-semibold py-48 px-42">
        Không có lịch sử đặt phòng
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 sm:px-6 lg:px-8 py-42 px-48">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-playfair font-extrabold text-gray-900 text-center mb-12">
          Lịch Sử Đặt Phòng
        </h2>
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600 text-2xl">
                  <span className="font-semibold">Mã phiếu:</span> {booking.id}
                </span>
                <span className="text-gray-600 text-2xl">
                  <span className="font-semibold">Trạng thái:</span>{" "}
                  <span
                    className={`${bookingStateColor[booking.bookingState]}`}
                  >
                    {bookingState[booking.bookingState]}
                  </span>
                </span>
              </div>
              <p className="text-gray-600 text-2xl mb-3">
                <span className="font-semibold">Phòng:</span> {booking.roomName}{" "}
                - {booking.roomTypeName}
              </p>
              <p className="text-gray-600 text-2xl mb-3">
                <span className="font-semibold">Ngày đặt:</span>{" "}
                {new Date(booking.bookingDate).toLocaleDateString("vi-VN")}
              </p>
              <p className="text-gray-600 text-2xl mb-3">
                <span className="font-semibold">Số ngày thuê:</span>{" "}
                {booking.rentalDays}
              </p>
              {(booking.bookingState === "PENDING" ||
                booking.bookingState === "COMMITED") &&
                canShowCancelButton(booking.bookingDate) && (
                  <div className="flex justify-end gap-4 mt-4">
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="bg-red-500 text-white text-xl font-semibold py-2 px-6 rounded-lg hover:bg-red-600 transition"
                    >
                      Hủy
                    </button>
                    {booking.bookingState === "COMMITED" && (
                      <button
                        onClick={() => setShowReviewForm(booking.id)}
                        className="bg-blue-500 text-white text-xl font-semibold py-2 px-6 rounded-lg hover:bg-blue-600 transition"
                      >
                        Đánh giá
                      </button>
                    )}
                  </div>
                )}
              {showReviewForm === booking.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-2">
                    Đánh giá phòng
                  </h3>
                  <div className="mb-2 flex gap-1">
                    <label className="block text-xl font-medium mb-1">
                      Số sao:
                    </label>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setRating(star)}
                        className="cursor-pointer text-2xl"
                      >
                        {star <= rating ? (
                          <img
                            src={starIconFilled}
                            alt="star"
                            className="w-6 h-6"
                          />
                        ) : (
                          <img
                            src={starIconOutlined}
                            alt="star"
                            className="w-6 h-6"
                          />
                        )}
                      </span>
                    ))}
                  </div>
                  <div className="mb-2">
                    <label className="block text-xl font-medium mb-1">
                      Bình luận:
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full p-2 border rounded-lg text-xl"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    {
                      <button
                        onClick={() => setShowReviewForm(null)}
                        className="bg-gray-500 text-white text-xl font-semibold py-2 px-6 rounded-lg hover:bg-gray-600 transition"
                      >
                        Hủy
                      </button>
                    }
                    <button
                      onClick={() => handleSubmitReview(booking.id)}
                      className="bg-green-500 text-white text-xl font-semibold py-2 px-6 rounded-lg hover:bg-green-600 transition"
                    >
                      Gửi đánh giá
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
