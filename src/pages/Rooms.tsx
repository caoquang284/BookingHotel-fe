import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRoomsByState } from "../services/apis/room";
import { getAllRoomTypes } from "../services/apis/roomType";
import { getAllFloors } from "../services/apis/floor";
import { getAllBookingConfirmationForms } from "../services/apis/bookingconfirm";
import starIcon from "../assets/Icon/starIconFilled.svg";
import starIconEmpty from "../assets/Icon/starIconOutlined.svg";
import type {
  ResponseRoomDTO,
  ResponseBookingConfirmationFormDTO,
  ResponseReviewDto,
  ResponseImageDto,
} from "../types/index.ts";
import { RoomStates } from "../types/index.ts";
import { getReviewsByRoomId } from "../services/apis/review";

import { getImagesByRoomId } from "../services/apis/image";

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
}> = ({ room, checkIn, checkOut }) => {
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
      className="bg-white rounded-lg shadow-md overflow-hidden w-full flex h-92 text-left hover:ring-2 hover:ring-blue-400 transition"
    >
      <img
        src={imageUrl}
        alt={room.name}
        className="w-2/5 h-full object-cover"
        onError={() =>
          setImageUrl("https://via.placeholder.com/400x300?text=No+Image")
        }
      />
      <div
        className="w-3/5 p-2 flex flex-col justify-between relative ml-4"
        style={{ minHeight: 180 }}
      >
        <div className="space-y-2">
          <p className="text-gray-800 text-4xl font-bold mt-3 font-playfair">
            Tên phòng: {room.name}
          </p>
          <p className="text-blue-600 text-xl font-semibold">
            Loại phòng: {room.roomTypeName}
          </p>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-xl">
                <img
                  src={i < starRating ? starIcon : starIconEmpty}
                  alt="star"
                  className="w-4 h-4"
                />
              </span>
            ))}
          </div>
          <div>
            <span className="text-gray-600 text-xl mr-2 font-semibold">
              Cơ sở lưu trữ này có:
            </span>
            <br />
            <span className="inline-block bg-blue-100 text-blue-800 text-lg font-semibold mr-2 px-2.5 py-0.5 rounded mt-2">
              Wifi miễn phí
            </span>
            <span className="inline-block bg-green-100 text-green-800 text-lg font-semibold mr-2 px-2.5 py-0.5 rounded">
              Bãi đậu xe
            </span>
            <span className="inline-block bg-yellow-100 text-yellow-800 text-lg font-semibold mr-2 px-2.5 py-0.5 rounded">
              Bữa sáng
            </span>
            <span className="inline-block bg-purple-100 text-purple-800 text-lg font-semibold px-2.5 py-0.5 rounded">
              Nhận phòng nhanh
            </span>
          </div>
          <p className="text-gray-600 text-2xl font-medium truncate italic mt-4">
            Ghi chú: {room.note || "Không có ghi chú"}
          </p>
        </div>
        <div className="absolute right-2 bottom-2 text-right">
          <p className="text-gray-500 font-bold text-2xl line-through italic">
            {originalPrice.toLocaleString("vi-VN")} VNĐ/đêm
          </p>
          <p className="text-red-600 font-bold text-4xl italic">
            {room.roomTypePrice?.toLocaleString("vi-VN")} VNĐ/đêm
          </p>
        </div>
      </div>
    </button>
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
    <div className="max-w-8xl mx-auto py-42 px-48 flex">
      <div className="w-3/4 pr-8">
        <h2 className="text-5xl font-bold text-left mb-8 font-playfair">
          Danh sách phòng
        </h2>
        <h2 className="text-2xl italic text-gray-600 text-left mb-12">
          Hãy tận dụng các ưu đãi có thời hạn giới hạn và gói khuyến mãi đặc
          biệt của chúng tôi để
          <br />
          nâng tầm kỳ nghỉ và tạo nên những kỷ niệm khó quên.
        </h2>
        <p className="text-center text-2xl text-gray-600 mb-8">
          Kết quả tìm kiếm: {checkIn || "Chưa chọn"} đến{" "}
          {checkOut || "Chưa chọn"}
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
            />
          ))}
        </div>
      </div>
      <div className="w-1/4 bg-white shadow-md rounded-lg p-6 mt-64 h-192">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-4xl font-bold font-playfair">Bộ lọc</h3>
          <button
            onClick={handleClearFilter}
            className="text-red-500 text-2xl font-semibold hover:text-red-700"
          >
            Bỏ lọc
          </button>
        </div>
        <div className="border-t-2 border-gray-300 my-4"></div>
        <div className="space-y-4">
          <div>
            <h4 className="text-2xl font-semibold mb-2 mt-8">
              Giá tiền (VNĐ/đêm)
            </h4>
            <div className="space-y-2">
              <label className="flex items-center text-xl mt-2">
                <input
                  type="radio"
                  name="priceRange"
                  value="0-500"
                  checked={priceRange === "0-500"}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="mr-2"
                />
                0 - 500
              </label>
              <label className="flex items-center text-xl mt-2">
                <input
                  type="radio"
                  name="priceRange"
                  value="500-1000"
                  checked={priceRange === "500-1000"}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="mr-2"
                />
                500 - 1000
              </label>
              <label className="flex items-center text-xl mt-2">
                <input
                  type="radio"
                  name="priceRange"
                  value="1000-2000"
                  checked={priceRange === "1000-2000"}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="mr-2"
                />
                1000 - 2000
              </label>
              <label className="flex items-center text-xl mt-2">
                <input
                  type="radio"
                  name="priceRange"
                  value="2000+"
                  checked={priceRange === "2000+"}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="mr-2"
                />
                2000+
              </label>
            </div>
          </div>
          <div className="mt-8">
            <h4 className="text-2xl font-semibold mb-2">Sắp xếp theo giá</h4>
            <div className="space-y-2">
              <label className="flex items-center text-xl mt-2">
                <input
                  type="radio"
                  name="sortOrder"
                  value="low-high"
                  checked={sortOrder === "low-high"}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="mr-2"
                />
                Thấp lên cao
              </label>
              <label className="flex items-center text-xl mt-2">
                <input
                  type="radio"
                  name="sortOrder"
                  value="high-low"
                  checked={sortOrder === "high-low"}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="mr-2"
                />
                Cao xuống thấp
              </label>
            </div>
          </div>
          <div className="mt-8">
            <h4 className="text-2xl font-semibold mb-2">Lọc theo số sao</h4>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <label key={star} className="flex items-center text-xl mt-2">
                  <input
                    type="radio"
                    name="starRating"
                    value={star}
                    checked={starRating === star}
                    onChange={(e) => setStarRating(Number(e.target.value))}
                    className="mr-2"
                  />
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-2xl">
                      <img
                        src={i < star ? starIcon : starIconEmpty}
                        alt="star"
                        className="w-6 h-6"
                      />
                    </span>
                  ))}
                </label>
              ))}
              <label className="flex items-center text-xl mt-2">
                <input
                  type="radio"
                  name="starRating"
                  value=""
                  checked={starRating === null}
                  onChange={() => setStarRating(null)}
                  className="mr-2"
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
