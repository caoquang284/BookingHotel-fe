import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRoomsByState } from "../services/apis/room";
import { getAllRoomTypes } from "../services/apis/roomType";
import { getAllFloors } from "../services/apis/floor";
import type { ResponseRoomDTO } from "../types/index.ts";
import { RoomStates } from "../types/index.ts";

// Định nghĩa interface cho payload phân trang
interface PaginatedResponse {
  content: ResponseRoomDTO[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { empty: boolean; sorted: boolean; unsorted: boolean };
    offset: number;
  };
  size: number;
  sort: { empty: boolean; sorted: boolean; unsorted: boolean };
  totalElements: number;
  totalPages: number;
}

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
const RoomCard: React.FC<{ room: ResponseRoomDTO }> = ({ room }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full max-w-xs mx-auto">
      <img
        src="https://xuonggooccho.com/ckfinder/userfiles/files/anh-phong-ngu.jpg"
        alt={room.name}
        className="w-full h-52 object-cover"
        onError={() => console.error("Image failed to load for", room.name)}
      />
      <div className="p-8">
        <p className="text-2xl font-semibold truncate">
          Tên phòng: {room.name}
        </p>
        <p className="text-gray-600 text-base">
          Loại phòng: {room.roomTypeName}
        </p>
        <p className="text-gray-600 text-base">Tầng: {room.floorName}</p>
        <p className="text-gray-600 text-base truncate">
          Ghi chú: {room.note || "Không có ghi chú"}
        </p>
        <button
          onClick={() => navigate(`/room/${room.id}`)}
          className="mt-4 w-full bg-indigo-600 text-white text-base py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

// Component chính cho trang Home
const Home: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ResponseRoomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsResponse, roomTypesData, floorsData] = await Promise.all([
          getRoomsByState(RoomStates.READY_TO_SERVE), // Chỉ lấy phòng READY_TO_SERVE
          getAllRoomTypes(),
          getAllFloors(),
        ]);
        const roomsData = (roomsResponse as unknown as PaginatedResponse)
          .content; // Lấy mảng phòng từ content
        console.log("Rooms fetched:", roomsData.length); // Kiểm tra số phòng
        const mappedRooms = roomsData.map((room) => {
          const roomType = roomTypesData.find(
            (rt) => rt.id === room.roomTypeId
          );
          const floor = floorsData.find((f) => f.id === room.floorId);
          return {
            ...room,
            roomTypeName: roomType?.name || "Không xác định",
            floorName: floor?.name || "Không xác định",
          };
        });
        setRooms(mappedRooms);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải dữ liệu");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (params: {
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => {
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
        <h2 className="text-3xl font-bold text-center mb-8">
          Các phòng đang có sẵn
        </h2>
        {loading && <p className="text-center">Đang tải...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && rooms.length === 0 && (
          <p className="text-center">Không có phòng nào sẵn sàng</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rooms.slice(0, 5).map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
