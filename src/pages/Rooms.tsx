import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { getRoomsByState } from "../services/apis/room";
import { getAllRoomTypes } from "../services/apis/roomType";
import { getAllFloors } from "../services/apis/floor";
import { getAllBookingConfirmationForms } from "../services/apis/bookingconfirm";
import { getReviewsByRoomId } from "../services/apis/review";
import { getImagesByRoomId } from "../services/apis/image";
import starIcon from "../assets/Icon/starIconFilled.svg";
import starIconEmpty from "../assets/Icon/starIconOutlined.svg";
import type {
  ResponseRoomDTO,
  ResponseBookingConfirmationFormDTO,
  ResponseReviewDto,
  ResponseImageDto,
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

// Component cho thẻ phòng
const RoomCard: React.FC<{
  room: ResponseRoomDTO;
  checkIn?: string;
  checkOut?: string;
}> = ({ room, checkIn, checkOut }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const originalPrice = room.roomTypePrice ? room.roomTypePrice * 1.35 : 0;
  const [starRating, setStarRating] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string>(
    "https://via.placeholder.com/400x300?text=No+Image"
  );

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviews = await getReviewsByRoomId(room.id);
        const ratings = reviews.map(
          (review: ResponseReviewDto) => review.rating
        );
        const averageRating =
          ratings.length > 0
            ? Math.floor(
                ratings.reduce((sum, rating) => sum + rating, 0) /
                  ratings.length
              )
            : 0;
        setStarRating(averageRating);
      } catch (error) {
        console.error(`Failed to fetch reviews for room ${room.id}:`, error);
        setStarRating(0);
      }
    };
    fetchReviews();
  }, [room.id]);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const images = await getImagesByRoomId(room.id);
        if (images && images.length > 0) {
          setImageUrl(images[0].url);
        } else {
          setImageUrl("https://via.placeholder.com/400x300?text=No+Image");
        }
      } catch (error) {
        console.error(`Failed to fetch image for room ${room.id}:`, error);
        setImageUrl("https://via.placeholder.com/400x300?text=No+Image");
      }
    };
    fetchImage();
  }, [room.id]);

  return (
    <button
      type="button"
      onClick={() => {
        navigate(
          `/room-detail/${room.id}?checkIn=${checkIn || ""}&checkOut=${
            checkOut || ""
          }`
        );
      }}
      className={`rounded-lg shadow-md overflow-hidden w-full flex flex-col sm:flex-row h-auto sm:h-92 text-left hover:ring-2 transition-all duration-300 ${
        theme === "light"
          ? "bg-white hover:ring-blue-400"
          : "bg-gray-800 hover:ring-blue-300"
      }`}
    >
      <img
        src={imageUrl}
        alt={room.name}
        className="w-full sm:w-2/5 h-48 sm:h-full object-cover"
        onError={() =>
          setImageUrl("https://via.placeholder.com/400x300?text=No+Image")
        }
      />
      <div
        className="w-full sm:w-3/5 p-3 sm:p-2 flex flex-col justify-between relative sm:ml-4"
        style={{ minHeight: "auto" }}
      >
        <div className="space-y-2 sm:space-y-2">
          <p
            className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold font-playfair mt-2 sm:mt-3 transition-all duration-300 ${
              theme === "light" ? "text-gray-800" : "text-gray-200"
            }`}
          >
            Tên phòng: {room.name}
          </p>
          <p
            className={`text-base sm:text-lg md:text-xl font-semibold transition-all duration-300 ${
              theme === "light" ? "text-blue-600" : "text-blue-400"
            }`}
          >
            Loại phòng: {room.roomTypeName}
          </p>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className="text-yellow-400 text-sm sm:text-lg md:text-xl"
              >
                <img
                  src={i < starRating ? starIcon : starIconEmpty}
                  alt="star"
                  className="w-3 h-3 sm:w-4 sm:h-4"
                />
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <span
              className={`text-sm sm:text-lg md:text-xl mr-2 font-semibold transition-all duration-300 ${
                theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
            >
              Cơ sở lưu trữ này có:
            </span>
            <span
              className={`inline-block text-xs sm:text-sm md:text-lg font-semibold mr-1 sm:mr-2 px-1.5 sm:px-2.5 py-0.5 rounded mt-1 sm:mt-2 transition-all duration-300 ${
                theme === "light"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-blue-900 text-blue-200"
              }`}
            >
              Wifi miễn phí
            </span>
            <span
              className={`inline-block text-xs sm:text-sm md:text-lg font-semibold mr-1 sm:mr-2 px-1.5 sm:px-2.5 py-0.5 rounded transition-all duration-300 ${
                theme === "light"
                  ? "bg-green-100 text-green-800"
                  : "bg-green-900 text-green-200"
              }`}
            >
              Bãi đậu xe
            </span>
            <span
              className={`inline-block text-xs sm:text-sm md:text-lg font-semibold mr-1 sm:mr-2 px-1.5 sm:px-2.5 py-0.5 rounded transition-all duration-300 ${
                theme === "light"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-yellow-900 text-yellow-200"
              }`}
            >
              Bữa sáng
            </span>
            <span
              className={`inline-block text-xs sm:text-sm md:text-lg font-semibold px-1.5 sm:px-2.5 py-0.5 rounded transition-all duration-300 ${
                theme === "light"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-purple-900 text-purple-200"
              }`}
            >
              Nhận phòng nhanh
            </span>
          </div>
          <p
            className={`text-sm sm:text-base md:text-lg lg:text-2xl font-medium truncate italic mt-2 sm:mt-4 transition-all duration-300 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            Ghi chú: {room.note || "Không có ghi chú"}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:absolute sm:right-2 sm:bottom-2 text-right">
          <p
            className={`font-bold text-sm sm:text-base md:text-lg lg:text-2xl line-through italic transition-all duration-300 ${
              theme === "light" ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {originalPrice.toLocaleString("vi-VN")} VNĐ/đêm
          </p>
          <p
            className={`font-bold text-lg sm:text-xl md:text-2xl lg:text-4xl italic transition-all duration-300 ${
              theme === "light" ? "text-red-600" : "text-red-400"
            }`}
          >
            {room.roomTypePrice?.toLocaleString("vi-VN")} VNĐ/đêm
          </p>
        </div>
      </div>
    </button>
  );
};

const Rooms: React.FC = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const checkIn = queryParams.get("checkIn") || "";
  const checkOut = queryParams.get("checkOut") || "";
  const roomTypeId = Number(queryParams.get("roomTypeId") || "0");

  const [rooms, setRooms] = useState<ResponseRoomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");
  const [starRating, setStarRating] = useState<number | null>(null);

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

        let filteredRooms = mappedRooms;
        if (roomTypeId) {
          filteredRooms = filteredRooms.filter(
            (room) => room.roomTypeId === roomTypeId
          );
        }

        if (checkIn && checkOut) {
          const checkInDate = new Date(checkIn);
          const checkOutDate = new Date(checkOut);

          filteredRooms = filteredRooms.filter((room) => {
            const bookings = (
              bookingForms as ResponseBookingConfirmationFormDTO[]
            ).filter((form) => form.roomId === room.id);
            return !bookings.some((form) => {
              const bookingStart = new Date(form.bookingDate);
              const bookingEnd = new Date(form.bookingDate);
              bookingEnd.setDate(bookingEnd.getDate() + form.rentalDays);
              return checkInDate < bookingEnd && checkOutDate > bookingStart;
            });
          });
        }

        if (priceRange) {
          filteredRooms = filteredRooms.filter((room) => {
            const price = room.roomTypePrice || 0;
            switch (priceRange) {
              case "0-500":
                return price >= 0 && price <= 500;
              case "500-1000":
                return price > 500 && price <= 1000;
              case "1000-2000":
                return price > 1000 && price <= 2000;
              case "2000+":
                return price > 2000;
              default:
                return true;
            }
          });
        }

        if (starRating !== null) {
          filteredRooms = filteredRooms.filter((room) => {
            const roomStars = Math.floor(Math.random() * 3) + 3; // Giả lập số sao
            return roomStars === starRating;
          });
        }

        if (sortOrder === "low-high") {
          filteredRooms.sort(
            (a, b) => (a.roomTypePrice || 0) - (b.roomTypePrice || 0)
          );
        } else if (sortOrder === "high-low") {
          filteredRooms.sort(
            (a, b) => (b.roomTypePrice || 0) - (a.roomTypePrice || 0)
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
    fetchData();
  }, [checkIn, checkOut, roomTypeId, priceRange, sortOrder, starRating]);

  const handleClearFilter = () => {
    setPriceRange("");
    setSortOrder("");
    setStarRating(null);
  };

  return (
    <div
      className={`max-w-8xl mx-auto py-8 sm:py-12 md:py-16 lg:py-42 px-4 sm:px-6 md:px-8 lg:px-48 flex flex-col lg:flex-row transition-all duration-300 ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900"
      }`}
    >
      <div className="w-full lg:w-3/4 lg:pr-8">
        <h2
          className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-left mb-4 sm:mb-6 md:mb-8 font-playfair transition-all duration-300 ${
            theme === "light" ? "text-black" : "text-gray-200"
          }`}
        >
          Danh sách phòng
        </h2>
        <h2
          className={`text-base sm:text-lg md:text-xl lg:text-2xl italic text-left mb-6 sm:mb-8 md:mb-12 transition-all duration-300 ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          Hãy tận dụng các ưu đãi có thời hạn giới hạn và gói khuyến mãi đặc
          biệt của chúng tôi để
          <br className="hidden sm:block" />
          nâng tầm kỳ nghỉ và tạo nên những kỷ niệm khó quên.
        </h2>
        <p
          className={`text-center text-sm sm:text-base md:text-lg lg:text-2xl mb-4 sm:mb-6 md:mb-8 transition-all duration-300 ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          Kết quả tìm kiếm: {checkIn || "Chưa chọn"} đến{" "}
          {checkOut || "Chưa chọn"}
          {roomTypeId ? `, loại phòng: ${roomTypeId}` : ""}
        </p>
        {loading && (
          <div className="flex flex-col gap-4">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className={`animate-pulse rounded-lg shadow-md w-full flex flex-col sm:flex-row h-auto sm:h-92 ${
                  theme === "light" ? "bg-white" : "bg-gray-800"
                }`}
              >
                <div
                  className={`w-full sm:w-2/5 h-48 sm:h-full ${
                    theme === "light" ? "bg-gray-300" : "bg-gray-600"
                  }`}
                />
                <div className="w-full sm:w-3/5 p-3 sm:p-2 flex flex-col justify-between sm:ml-4">
                  <div className="space-y-3 sm:space-y-4 mt-2 sm:mt-4">
                    <div
                      className={`h-6 sm:h-8 ${
                        theme === "light" ? "bg-gray-300" : "bg-gray-600"
                      } rounded w-3/4`}
                    />
                    <div
                      className={`h-4 sm:h-6 ${
                        theme === "light" ? "bg-gray-300" : "bg-gray-600"
                      } rounded w-1/2`}
                    />
                    <div className="flex gap-1 sm:gap-2 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 sm:w-6 sm:h-6 ${
                            theme === "light" ? "bg-gray-300" : "bg-gray-600"
                          } rounded-full`}
                        />
                      ))}
                    </div>
                    <div
                      className={`h-4 sm:h-5 ${
                        theme === "light" ? "bg-gray-300" : "bg-gray-600"
                      } rounded w-2/3 mt-2`}
                    />
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-6 sm:h-8 w-16 sm:w-20 ${
                            theme === "light" ? "bg-gray-200" : "bg-gray-700"
                          } rounded`}
                        />
                      ))}
                    </div>
                    <div
                      className={`h-4 sm:h-6 ${
                        theme === "light" ? "bg-gray-200" : "bg-gray-700"
                      } rounded w-1/2 mt-4`}
                    />
                  </div>
                  <div className="flex flex-col items-end mt-4 sm:mt-8">
                    <div
                      className={`h-4 sm:h-6 ${
                        theme === "light" ? "bg-gray-300" : "bg-gray-600"
                      } rounded w-24 sm:w-32 mb-2`}
                    />
                    <div
                      className={`h-6 sm:h-8 ${
                        theme === "light" ? "bg-gray-300" : "bg-gray-600"
                      } rounded w-28 sm:w-40`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && rooms.length === 0 && (
          <p
            className={`text-center text-base sm:text-lg md:text-xl lg:text-2xl transition-all duration-300 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            Không có phòng nào sẵn sàng
          </p>
        )}
        <div className="flex flex-col gap-4">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              checkIn={checkIn}
              checkOut={checkOut}
            />
          ))}
        </div>
      </div>
      <div
        className={`w-full lg:w-1/4 shadow-md rounded-lg p-4 sm:p-6 mt-6 lg:mt-64 h-auto lg:h-192 transition-all duration-300 ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3
            className={`text-2xl sm:text-3xl md:text-4xl font-bold font-playfair transition-all duration-300 ${
              theme === "light" ? "text-black" : "text-gray-200"
            }`}
          >
            Bộ lọc
          </h3>
          <button
            onClick={handleClearFilter}
            className={`text-base sm:text-lg md:text-2xl font-semibold transition-all duration-300 ${
              theme === "light"
                ? "text-red-500 hover:text-red-700"
                : "text-red-400 hover:text-red-300"
            }`}
          >
            Bỏ lọc
          </button>
        </div>
        <div
          className={`border-t-2 my-4 transition-all duration-300 ${
            theme === "light" ? "border-gray-300" : "border-gray-600"
          }`}
        ></div>
        <div className="space-y-4">
          <div>
            <h4
              className={`text-lg sm:text-xl md:text-2xl font-semibold mb-2 mt-4 sm:mt-8 transition-all duration-300 ${
                theme === "light" ? "text-black" : "text-gray-200"
              }`}
            >
              Giá tiền (VNĐ/đêm)
            </h4>
            <div className="space-y-2">
              {["0-500", "500-1000", "1000-2000", "2000+"].map((range) => (
                <label
                  key={range}
                  className={`flex items-center text-sm sm:text-base md:text-xl mt-2 transition-all duration-300 ${
                    theme === "light" ? "text-black" : "text-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="priceRange"
                    value={range}
                    checked={priceRange === range}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className={`mr-2 transition-all duration-300 ${
                      theme === "light"
                        ? "text-blue-600 focus:ring-blue-500"
                        : "text-blue-400 focus:ring-blue-400"
                    }`}
                  />
                  {range.replace("-", " - ")}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-6 sm:mt-8">
            <h4
              className={`text-lg sm:text-xl md:text-2xl font-semibold mb-2 transition-all duration-300 ${
                theme === "light" ? "text-black" : "text-gray-200"
              }`}
            >
              Sắp xếp theo giá
            </h4>
            <div className="space-y-2">
              {["low-high", "high-low"].map((order) => (
                <label
                  key={order}
                  className={`flex items-center text-sm sm:text-base md:text-xl mt-2 transition-all duration-300 ${
                    theme === "light" ? "text-black" : "text-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="sortOrder"
                    value={order}
                    checked={sortOrder === order}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className={`mr-2 transition-all duration-300 ${
                      theme === "light"
                        ? "text-blue-600 focus:ring-blue-500"
                        : "text-blue-400 focus:ring-blue-400"
                    }`}
                  />
                  {order === "low-high" ? "Thấp lên cao" : "Cao xuống thấp"}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-6 sm:mt-8">
            <h4
              className={`text-lg sm:text-xl md:text-2xl font-semibold mb-2 transition-all duration-300 ${
                theme === "light" ? "text-black" : "text-gray-200"
              }`}
            >
              Lọc theo số sao
            </h4>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <label
                  key={star}
                  className={`flex items-center text-sm sm:text-base md:text-xl mt-2 transition-all duration-300 ${
                    theme === "light" ? "text-black" : "text-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="starRating"
                    value={star}
                    checked={starRating === star}
                    onChange={(e) => setStarRating(Number(e.target.value))}
                    className={`mr-2 transition-all duration-300 ${
                      theme === "light"
                        ? "text-blue-600 focus:ring-blue-500"
                        : "text-blue-400 focus:ring-blue-400"
                    }`}
                  />
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="text-yellow-400 text-sm sm:text-lg md:text-2xl"
                    >
                      <img
                        src={i < star ? starIcon : starIconEmpty}
                        alt="star"
                        className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                      />
                    </span>
                  ))}
                </label>
              ))}
              <label
                className={`flex items-center text-sm sm:text-base md:text-xl mt-2 transition-all duration-300 ${
                  theme === "light" ? "text-black" : "text-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="starRating"
                  value=""
                  checked={starRating === null}
                  onChange={() => setStarRating(null)}
                  className={`mr-2 transition-all duration-300 ${
                    theme === "light"
                      ? "text-blue-600 focus:ring-blue-500"
                      : "text-blue-400 focus:ring-blue-400"
                  }`}
                />
                Tất cả
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
