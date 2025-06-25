import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getGuestByAccountId } from "../services/apis/guest";
import { getRoomById } from "../services/apis/room";
import { getAllBookingConfirmationForms } from "../services/apis/bookingconfirm";
import type { ResponseGuestDTO } from "../types/index.ts";
import type { ResponseBookingConfirmationFormDTO } from "../types";
import { getRoomTypeById } from "../services/apis/roomType";

const BookingHistory: React.FC = () => {
  const { user } = useAuth();
  const [guestId, setGuestId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<
    ResponseBookingConfirmationFormDTO[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingHistory = async () => {
      if (!user?.id) {
        setError("Vui lòng đăng nhập để xem lịch sử đặt phòng");
        setLoading(false);
        return;
      }

      try {
        // Lấy guestId từ accountId
        const guestData: ResponseGuestDTO = await getGuestByAccountId(user.id);
        setGuestId(guestData.id);

        // Lấy tất cả phiếu đặt phòng
        const allBookings: ResponseBookingConfirmationFormDTO[] =
          await getAllBookingConfirmationForms();
        console.log(guestData.id);
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
      <div className="text-center py-12 text-gray-600 text-xl font-semibold">
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
              <p className="text-gray-600 text-2xl">
                <span className="font-semibold">Mã phiếu:</span> {booking.id}
              </p>

              <p className="text-gray-600 text-2xl">
                <span className="font-semibold">Phòng:</span> {booking.roomName}
              </p>
              <p className="text-gray-600 text-2xl">
                <span className="font-semibold">Ngày đặt:</span>{" "}
                {new Date(booking.bookingDate).toLocaleDateString("vi-VN")}
              </p>
              <p className="text-gray-600 text-2xl">
                <span className="font-semibold">Số ngày thuê:</span>{" "}
                {booking.rentalDays}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
