import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getRoomById } from "../services/apis/room";
import { getAllRoomTypes } from "../services/apis/roomType";
import { getAllFloors } from "../services/apis/floor";
import type { ResponseRoomDTO } from "../types/index.ts";

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.fullName || !customerInfo.email || !customerInfo.phone) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    // Chuyển hướng đến trang xác nhận với thông tin
    navigate("/booking-confirmation", {
      state: {
        room,
        checkIn,
        checkOut,
        guests,
        customerInfo,
      },
    });
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
    </div>
  );
};

export default BookingPage;
