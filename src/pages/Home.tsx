import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getRoomsByState } from "../services/apis/room";
import { getAllRoomTypes } from "../services/apis/roomType";
import { getAllFloors } from "../services/apis/floor";
import type { ResponseRoomDTO, ResponseRoomTypeDTO } from "../types/index.ts";
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
    <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-4xl mx-auto -mt-24 relative z-10">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Ngày đến
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-md focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3 px-4"
            required
          />
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Ngày đi
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-md focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3 px-4"
            required
          />
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Số khách
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-md focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3 px-4"
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
            className="w-full bg-indigo-600 text-white text-lg font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 shadow-lg transition-all duration-200"
          >
            Tìm phòng
          </button>
        </div>
      </form>
    </div>
  );
};
const imageLinks = [
  "https://xuonggooccho.com/ckfinder/userfiles/files/anh-phong-ngu.jpg",
  "https://noithattrevietnam.com/uploaded/2019/12/1-thiet-ke-phong-ngu-khach-san%20%281%29.jpg",
  "https://acihome.vn/uploads/17/phong-ngu-khach-san-5-sao.jpg",
  "https://www.vietnambooking.com/wp-content/uploads/2021/02/khach-san-ho-chi-minh-35.jpg",
  "https://ik.imagekit.io/tvlk/blog/2023/09/khach-san-view-bien-da-nang-1.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2",
];

// Component cho thẻ phòng
const RoomCard: React.FC<{
  room: ResponseRoomDTO;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}> = ({ room, checkIn, checkOut, guests }) => {
  const navigate = useNavigate();
  const randomImage = imageLinks[Math.floor(Math.random() * imageLinks.length)];
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full max-w-xs mx-auto">
      <img
        src={randomImage}
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
        <p className="text-gray-600 text-base">
          Giá: {room.roomTypePrice?.toLocaleString("vi-VN")} VNĐ/đêm
        </p>
        <p className="text-gray-600 text-base truncate">
          Ghi chú: {room.note || "Không có ghi chú"}
        </p>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => navigate(`/room/${room.id}`)}
            className="flex-1 bg-indigo-600 text-white text-base py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Xem chi tiết
          </button>
          <button
            onClick={() =>
              navigate(
                `/booking?roomId=${room.id}&checkIn=${checkIn || ""}&checkOut=${
                  checkOut || ""
                }&guests=${guests || 1}`
              )
            }
            className="flex-1 bg-green-600 text-white text-base py-2 px-4 rounded-md hover:bg-green-700"
          >
            Đặt phòng
          </button>
        </div>
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
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(1);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsResponse, roomTypesData, floorsData] = await Promise.all([
          getRoomsByState(RoomStates.READY_TO_SERVE),
          getAllRoomTypes(),
          getAllFloors(),
        ]);
        const roomsData = (roomsResponse as unknown as PaginatedResponse)
          .content;
        console.log("Rooms fetched:", roomsData.length);
        const mappedRooms = roomsData.map((room) => {
          const roomType = roomTypesData.find(
            (rt) => rt.id === room.roomTypeId
          );
          const floor = floorsData.find((f) => f.id === room.floorId);
          return {
            ...room,
            roomType,
            roomTypeName: roomType?.name || "Không xác định",
            roomTypePrice: roomType?.price || 0,
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
    setCheckIn(params.checkIn);
    setCheckOut(params.checkOut);
    setGuests(params.guests);
    navigate(
      `/rooms?checkIn=${params.checkIn}&checkOut=${params.checkOut}&guests=${params.guests}`
    );
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div>
      <div
        className="bg-gray-800 h-96 flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://bonifacio.fr/app/uploads/bonifacio/2023/12/thumbs/plage-santa-giulia-vue-aerienne-porto-vecchio-sud-corse-1920x960.jpg')",
        }}
      >
        <h1 className="text-5xl font-bold text-gray-100 text-center">
          Rong chơi bốn phương, giá vẫn yêu thương
        </h1>
      </div>
      <BookingBox onSearch={handleSearch} />
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-left mb-8">
          Các phòng đang có sẵn
        </h2>
        {loading && <p className="text-center">Đang tải...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && rooms.length === 0 && (
          <p className="text-center">Không có phòng nào sẵn sàng</p>
        )}
        <div className="relative">
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2"
            style={{ display: rooms.length > 2 ? "block" : "none" }}
          >
            &#8592;
          </button>
          <div
            ref={sliderRef}
            className="flex overflow-x-auto gap-8 scrollbar-hide py-2"
            style={{ scrollBehavior: "smooth" }}
          >
            {rooms.map((room) => (
              <div
                key={room.id}
                className="flex-shrink-0"
                style={{ width: 320 }}
              >
                <RoomCard
                  room={room}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  guests={guests}
                />
              </div>
            ))}
          </div>
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2"
            style={{ display: rooms.length > 2 ? "block" : "none" }}
          >
            &#8594;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
