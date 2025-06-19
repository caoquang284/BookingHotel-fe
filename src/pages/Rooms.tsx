import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRoomsByState } from "../services/apis/room";
import { getAllRoomTypes } from "../services/apis/roomType";
import { getAllFloors } from "../services/apis/floor";
import { getAllBookingConfirmationForms } from "../services/apis/bookingconfirm";
import type {
  ResponseRoomDTO,
  ResponseBookingConfirmationFormDTO,
} from "../types/index.ts";
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
  const originalPrice = room.roomTypePrice ? room.roomTypePrice * 1.35 : 0; // Giả định giá gốc là 135% giá hiện tại
  const randomImage = imageLinks[Math.floor(Math.random() * imageLinks.length)];
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full flex h-64">
      <img
        src={randomImage}
        alt={room.name}
        className="w-1/3 h-full object-cover"
        onError={() => console.error("Image failed to load for", room.name)}
      />
      <div
        className="w-2/3 p-2 flex flex-col justify-between relative ml-4"
        style={{ minHeight: 180 }}
      >
        <div className="space-y-2">
          <p className="text-gray-800 text-3xl font-bold">
            Tên phòng: {room.name}
          </p>
          {/* 5 ngôi sao */}
          {/* random sao từ 3 đến 5 */}
          <div className="flex items-center">
            {[...Array(Math.floor(Math.random() * 3) + 3)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-xl">
                &#9733;
              </span>
            ))}
          </div>
          <p className="text-blue-600 text-sm font-semibold">
            Loại phòng: {room.roomTypeName}
          </p>
          {/* Dòng mô tả dịch vụ */}
          {/* random dòng mô tả dịch vụ từ 2 đến 4 */}
          <div>
            <span className="text-gray-600 text-sm mr-2">
              Cơ sở lưu trữ này có:
            </span>
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
              Wifi miễn phí
            </span>
            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
              Bãi đậu xe
            </span>
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
              Bữa sáng
            </span>
            <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              Nhận phòng nhanh
            </span>
          </div>
          <p className="text-gray-800 text-base font-medium flex items-center">
            Tầng: {room.floorName}
            <i className="fa-solid fa-building text-blue-600 ml-2"></i>
          </p>
          <p className="text-gray-600 text-sm font-medium truncate italic">
            Ghi chú: {room.note || "Không có ghi chú"}
          </p>
        </div>
        {/* Giá ở góc phải dưới */}
        <div className="absolute right-2 bottom-2 text-right">
          <p className="text-red-500 font-bold text-lg line-through italic">
            {originalPrice.toLocaleString("vi-VN")} VNĐ/đêm
          </p>
          <p className="text-red-600 font-bold text-xl italic">
            {room.roomTypePrice?.toLocaleString("vi-VN")} VNĐ/đêm
          </p>
        </div>
      </div>
    </div>
  );
};

const Rooms: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const checkIn = queryParams.get("checkIn") || "";
  const checkOut = queryParams.get("checkOut") || "";
  const roomTypeId = Number(queryParams.get("roomTypeId") || "0");

  const [rooms, setRooms] = useState<ResponseRoomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsResponse, roomTypesData, floorsData, bookingForms] =
          await Promise.all([
            getRoomsByState(RoomStates.READY_TO_SERVE),
            getAllRoomTypes(),
            getAllFloors(),
            getAllBookingConfirmationForms(),
          ]);
        const roomsData = (roomsResponse as unknown as PaginatedResponse)
          .content;
        const mappedRooms = roomsData.map((room) => {
          const roomType = roomTypesData.find(
            (rt) => rt.id === room.roomTypeId
          );
          const floor = floorsData.find((f) => f.id === room.floorId);
          return {
            ...room,
            roomTypeName: roomType?.name || "Không xác định",
            floorName: floor?.name || "Không xác định",
            roomTypePrice: roomType?.price || 0,
          };
        });

        // Lọc phòng theo loại phòng
        let filteredRooms = mappedRooms;
        if (roomTypeId) {
          filteredRooms = filteredRooms.filter(
            (room) => room.roomTypeId === roomTypeId
          );
        }

        // Lọc phòng không bị trùng lịch
        if (checkIn && checkOut) {
          const checkInDate = new Date(checkIn);
          const checkOutDate = new Date(checkOut);

          filteredRooms = filteredRooms.filter((room) => {
            // Tìm các booking của phòng này
            const bookings = (
              bookingForms as ResponseBookingConfirmationFormDTO[]
            ).filter((form) => form.roomId === room.id);
            console.log(bookings);
            // Nếu không có booking nào trùng, phòng này hợp lệ
            return !bookings.some((form) => {
              const bookingStart = new Date(form.bookingDate);
              const bookingEnd = new Date(form.bookingDate);
              bookingEnd.setDate(bookingEnd.getDate() + form.rentalDays);
              console.log(bookingStart, bookingEnd);
              console.log(checkInDate, checkOutDate);
              // Kiểm tra giao nhau
              return checkInDate < bookingEnd && checkOutDate > bookingStart;
            });
          });
        }

        setRooms(filteredRooms);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải dữ liệu");
        setLoading(false);
      }
    };
    fetchData();
  }, [checkIn, checkOut, roomTypeId]);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Danh sách phòng</h2>
      <p className="text-center text-gray-600 mb-8">
        Kết quả tìm kiếm: {checkIn || "Chưa chọn"} đến {checkOut || "Chưa chọn"}
        {roomTypeId ? `, loại phòng: ${roomTypeId}` : ""}
      </p>
      {loading && <p className="text-center">Đang tải...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}
      {!loading && !error && rooms.length === 0 && (
        <p className="text-center">Không có phòng nào sẵn sàng</p>
      )}
      <div className="flex flex-col gap-4">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={roomTypeId}
          />
        ))}
      </div>
    </div>
  );
};

export default Rooms;
