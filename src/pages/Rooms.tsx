import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllRooms } from "../services/apis/room";
import { getAllRoomTypes } from "../services/apis/roomType";
import { getAllFloors } from "../services/apis/floor";
import type { ResponseRoomDTO } from "../types/index.ts";

// Component cho thẻ phòng
const RoomCard: React.FC<{ room: ResponseRoomDTO }> = ({ room }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full max-w-xs mx-auto">
      <img
        src="https://placehold.co/300x200"
        alt={room.name}
        className="w-full h-32 object-cover"
      />
      <div className="p-3">
        <h3 className="text-base font-semibold truncate">{room.name}</h3>
        <p className="text-gray-600 text-sm">Loại phòng: {room.roomTypeName}</p>
        <p className="text-gray-600 text-sm">Tầng: {room.floorName}</p>
        <p className="text-gray-600 text-sm truncate">
          Ghi chú: {room.note || "Không có ghi chú"}
        </p>
        <button className="mt-2 w-full bg-indigo-600 text-white text-sm py-1 px-2 rounded-md hover:bg-indigo-700">
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

const RoomsPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const checkIn = queryParams.get("checkIn");
  const checkOut = queryParams.get("checkOut");
  const guests = queryParams.get("guests");

  const [rooms, setRooms] = useState<ResponseRoomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsData, roomTypesData, floorsData] = await Promise.all([
          getAllRooms(),
          getAllRoomTypes(),
          getAllFloors(),
        ]);

        // Ánh xạ dữ liệu phòng với tên loại phòng và tên tầng
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
        setError("Không thể tải dữ liệu");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Danh sách phòng</h2>
      <p className="text-center text-gray-600 mb-8">
        Kết quả tìm kiếm: {checkIn} đến {checkOut}, {guests} khách
      </p>
      {loading && <p className="text-center">Đang tải...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}
      {!loading && !error && rooms.length === 0 && (
        <p className="text-center">Không có phòng nào</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
};

export default RoomsPage;
