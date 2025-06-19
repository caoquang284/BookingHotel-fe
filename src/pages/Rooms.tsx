// RoomsPage.tsx
import React from "react";
import { useLocation } from "react-router-dom";

// Mock data cho các phòng
const suggestedRooms = [
  {
    id: 1,
    name: "Phòng Deluxe",
    price: 1000000,
    image: "https://placehold.co/400x300",
    description: "Phòng sang trọng với view biển",
  },
  {
    id: 2,
    name: "Phòng Suite",
    price: 1500000,
    image: "https://placehold.co/400x300",
    description: "Phòng rộng rãi với ban công",
  },
  {
    id: 3,
    name: "Phòng Standard",
    price: 800000,
    image: "https://placehold.co/400x300",
    description: "Phòng tiện nghi giá hợp lý",
  },
];

// Component cho thẻ phòng
const RoomCard: React.FC<{
  room: {
    id: number;
    name: string;
    price: number;
    image: string;
    description: string;
  };
}> = ({ room }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={room.image}
        alt={room.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{room.name}</h3>
        <p className="text-gray-600">{room.description}</p>
        <p className="text-indigo-600 font-bold mt-2">
          {room.price.toLocaleString()} VND/đêm
        </p>
        <button className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
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

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Danh sách phòng</h2>
      <p className="text-center text-gray-600 mb-8">
        Kết quả tìm kiếm: {checkIn} đến {checkOut}, {guests} khách
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {suggestedRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
};

export default RoomsPage;
