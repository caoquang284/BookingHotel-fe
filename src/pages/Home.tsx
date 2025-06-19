import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Mock data cho các phòng gợi ý
const suggestedRooms = [
  {
    id: 1,
    name: "Phòng 101",
    type: "Deluxe",
    floor: 1,
    note: "View biển, có ban công",
  },
  {
    id: 2,
    name: "Phòng 202",
    type: "Suite",
    floor: 2,
    note: "Phòng rộng, có bồn tắm",
  },
  {
    id: 3,
    name: "Phòng 305",
    type: "Standard",
    floor: 3,
    note: "Gần thang máy, tiện di chuyển",
  },
];

// Component cho box đặt phòng
const BookingBox: React.FC<{
  onSearch: (params: {
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => void;
}> = ({ onSearch }) => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ checkIn, checkOut, guests });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto -mt-16 relative z-10">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ngày đến
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ngày đi
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Số khách
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} khách
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Tìm phòng
          </button>
        </div>
      </form>
    </div>
  );
};

// Component cho thẻ phòng
const RoomCard: React.FC<{
  room: { id: number; name: string; type: string; floor: number; note: string };
}> = ({ room }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <h3 className="text-lg font-semibold">{room.name}</h3>
        <p className="text-gray-600">Loại phòng: {room.type}</p>
        <p className="text-gray-600">Tầng: {room.floor}</p>
        <p className="text-gray-600">Ghi chú: {room.note}</p>
        <button
          onClick={() => navigate(`/room/${room.id}`)}
          className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

// Component chính cho trang Dashboard
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSearch = (params: {
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => {
    // Chuyển hướng đến trang danh sách phòng với query params
    navigate(
      `/rooms?checkIn=${params.checkIn}&checkOut=${params.checkOut}&guests=${params.guests}`
    );
  };

  return (
    <div>
      <div
        className="bg-gray-800 h-96 flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url(https://placehold.co/1920x600)" }}
      >
        <h1 className="text-4xl font-bold text-white">
          Đặt khách sạn của bạn ngay hôm nay
        </h1>
      </div>
      <BookingBox onSearch={handleSearch} />
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Phòng gợi ý</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {suggestedRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
