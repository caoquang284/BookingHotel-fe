import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getRoomsByState } from "../services/apis/room";
import { getAllRoomTypes } from "../services/apis/roomType";
import { getAllFloors } from "../services/apis/floor";
import { getAllBookingConfirmationForms } from "../services/apis/bookingconfirm";
import { useAuth } from "../contexts/AuthContext";
import type { ResponseRoomDTO, ResponseRoomTypeDTO } from "../types/index.ts";
import { RoomStates } from "../types/index.ts";
import type {
  BookingConfirmationFormDTO,
  ResponseBookingConfirmationFormDTO,
} from "../types";

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
    roomTypeId: number;
  }) => void;
  roomTypes: ResponseRoomTypeDTO[];
}> = ({ onSearch, roomTypes }) => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomTypeId, setRoomTypeId] = useState<number>(
    roomTypes.length > 0 ? roomTypes[0].id : 1
  );

  useEffect(() => {
    if (roomTypes.length > 0) setRoomTypeId(roomTypes[0].id);
  }, [roomTypes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ checkIn, checkOut, roomTypeId });
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
            Loại phòng
          </label>
          <select
            value={roomTypeId}
            onChange={(e) => setRoomTypeId(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-md focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3 px-4"
            required
          >
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name}
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
  setSelectedRoomId: (id: number) => void;
  setShowDateModal: (show: boolean) => void;
  setModalCheckIn: (val: string) => void;
  setModalCheckOut: (val: string) => void;
  setModalGuests: (val: number) => void;
}> = ({
  room,
  checkIn,
  checkOut,
  guests,
  setSelectedRoomId,
  setShowDateModal,
  setModalCheckIn,
  setModalCheckOut,
  setModalGuests,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const randomImage = imageLinks[Math.floor(Math.random() * imageLinks.length)];

  const handleBookingClick = () => {
    if (!user) {
      // Nếu chưa đăng nhập, lưu thông tin phòng và điều hướng đến trang đăng nhập
      localStorage.setItem(
        "bookingRedirect",
        JSON.stringify({
          roomId: room.id,
          checkIn: checkIn || "",
          checkOut: checkOut || "",
          guests: guests || 1,
        })
      );
      navigate("/login");
    } else {
      // Nếu đã đăng nhập, mở modal chọn ngày
      setSelectedRoomId(room.id);
      setShowDateModal(true);
      setModalCheckIn("");
      setModalCheckOut("");
      setModalGuests(1);
    }
  };

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
            onClick={handleBookingClick}
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
  const [roomTypeId, setRoomTypeId] = useState(1);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [modalCheckIn, setModalCheckIn] = useState("");
  const [modalCheckOut, setModalCheckOut] = useState("");
  const [modalGuests, setModalGuests] = useState(1);
  const [roomTypes, setRoomTypes] = useState<ResponseRoomTypeDTO[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<number | null>(null);
  const [modalRoomType, setModalRoomType] = useState<number | null>(null);

  const fetchData = async (
    checkInDate?: string,
    checkOutDate?: string,
    roomTypeId?: number
  ) => {
    try {
      setLoading(true);
      const [roomsResponse, roomTypesData, floorsData, bookingForms] =
        await Promise.all([
          getRoomsByState(RoomStates.READY_TO_SERVE),
          getAllRoomTypes(),
          getAllFloors(),
          getAllBookingConfirmationForms(),
        ]);
      const roomsData = (roomsResponse as unknown as PaginatedResponse).content;
      console.log("Rooms fetched:", roomsData.length);
      const mappedRooms = roomsData.map((room) => {
        const roomType = roomTypesData.find((rt) => rt.id === room.roomTypeId);
        const floor = floorsData.find((f) => f.id === room.floorId);
        return {
          ...room,
          roomType,
          roomTypeName: roomType?.name || "Không xác định",
          roomTypePrice: roomType?.price || 0,
          floorName: floor?.name || "Không xác định",
        };
      });

      // Lọc phòng dựa trên khoảng thời gian booking
      const availableRooms = mappedRooms.filter((room) => {
        if (!checkInDate || !checkOutDate) return true;
        const checkInDateObj = new Date(checkInDate);
        const checkOutDateObj = new Date(checkOutDate);
        return !bookingForms.some(
          (form: ResponseBookingConfirmationFormDTO) => {
            const bookingDateObj = new Date(form.bookingDate);
            const endDate = new Date(bookingDateObj);
            endDate.setDate(bookingDateObj.getDate() + form.rentalDays);
            return (
              room.id === form.roomId &&
              ((checkInDateObj >= bookingDateObj && checkInDateObj < endDate) ||
                (checkOutDateObj > bookingDateObj &&
                  checkOutDateObj <= endDate) ||
                (checkInDateObj <= bookingDateObj &&
                  checkOutDateObj >= endDate))
            );
          }
        );
      });

      let filteredRooms = availableRooms;
      if (roomTypeId) {
        filteredRooms = filteredRooms.filter(
          (room) => room.roomTypeId === roomTypeId
        );
      }
      setRooms(filteredRooms);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    getAllRoomTypes().then(setRoomTypes);
  }, []);

  const handleSearch = (params: {
    checkIn: string;
    checkOut: string;
    roomTypeId: number;
  }) => {
    setCheckIn(params.checkIn);
    setCheckOut(params.checkOut);
    setSelectedRoomType(params.roomTypeId);
    fetchData(params.checkIn, params.checkOut, params.roomTypeId);
    navigate(
      `/rooms?checkIn=${params.checkIn}&checkOut=${params.checkOut}&roomTypeId=${params.roomTypeId}`
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
      <BookingBox onSearch={handleSearch} roomTypes={roomTypes} />
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
            ←
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
                  guests={modalGuests}
                  setSelectedRoomId={setSelectedRoomId}
                  setShowDateModal={setShowDateModal}
                  setModalCheckIn={setModalCheckIn}
                  setModalCheckOut={setModalCheckOut}
                  setModalGuests={setModalGuests}
                />
              </div>
            ))}
          </div>
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2"
            style={{ display: rooms.length > 2 ? "block" : "none" }}
          >
            →
          </button>
        </div>
      </div>
      {showDateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setShowDateModal(false)}
            >
              ×
            </button>
            <h3 className="text-lg font-bold mb-4 text-center">
              Chọn ngày nhận và trả phòng
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ngày đến
                </label>
                <input
                  type="date"
                  value={modalCheckIn}
                  onChange={(e) => setModalCheckIn(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ngày đi
                </label>
                <input
                  type="date"
                  value={modalCheckOut}
                  onChange={(e) => setModalCheckOut(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <button
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                onClick={() => {
                  if (!modalCheckIn || !modalCheckOut) {
                    alert("Vui lòng chọn ngày đến, ngày đi!");
                    return;
                  }
                  setShowDateModal(false);
                  setSelectedRoomType(modalRoomType);
                  navigate(
                    `/booking?roomId=${selectedRoomId}&checkIn=${modalCheckIn}&checkOut=${modalCheckOut}&guests=${modalGuests}`
                  );
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;