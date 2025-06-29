import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllRooms,
  getRoomById,
  getRoomsByState,
} from "../services/apis/room";
import { getAllRoomTypes } from "../services/apis/roomType";
import { getAllFloors } from "../services/apis/floor";
import { getAllBookingConfirmationForms } from "../services/apis/bookingconfirm";
import { getImagesByRoomId } from "../services/apis/image";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import type {
  ResponseRoomDTO,
  ResponseRoomTypeDTO,
  ResponseImageDto,
  ResponseReviewDto,
  ResponseGuestDTO,
} from "../types/index.ts";
import { RoomStates } from "../types/index.ts";
import type {
  BookingConfirmationFormDTO,
  ResponseBookingConfirmationFormDTO,
} from "../types";
import backgroundImage from "../assets/Image/bg.jpg";
import backgroundImage1 from "../assets/Image/bg1.jpg";
import starIcon from "../assets/Icon/starIconFilled.svg";
import starIconEmpty from "../assets/Icon/starIconOutlined.svg";
import totalBookingIcon from "../assets/Icon/totalBookingIcon.svg";
import { getReviewsByRoomId } from "../services/apis/review";
import { getGuestById } from "../services/apis/guest";
import { toast } from "react-toastify";
import Chatbot from "../components/chatBox";
import { useScrollToTop } from "../hooks/useScrollToTop";

const DEFAULT_IMAGE = "https://via.placeholder.com/400x300?text=No+Image";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
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

const BookingBox: React.FC<{
  onSearch: (params: {
    checkIn: string;
    checkOut: string;
    roomTypeId: number;
  }) => void;
  roomTypes: ResponseRoomTypeDTO[];
}> = ({ onSearch, roomTypes }) => {
  const { theme } = useTheme();
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (
      !checkIn ||
      !checkOut ||
      checkInDate < today ||
      checkOutDate < today ||
      checkOutDate <= checkInDate
    ) {
      toast.error(
        "Ngày đến và ngày đi phải lớn hơn hôm nay và ngày đi phải lớn hơn ngày đến"
      );
      return;
    }
    onSearch({ checkIn, checkOut, roomTypeId });
  };

  return (
    <div
      className={`shadow-2xl rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 w-full max-w-5xl mx-auto -mt-16 sm:-mt-20 md:-mt-24 relative z-10 transition-all duration-300 ${
        theme === "light" ? "bg-gray-200" : "bg-gray-800"
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
      >
        <div>
          <label
            className={`block text-lg sm:text-xl md:text-2xl font-semibold mb-2 ${
              theme === "light" ? "text-gray-700" : "text-gray-200"
            }`}
          >
            Ngày đến
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className={`mt-1 block w-full rounded-lg border shadow-md focus:outline-none focus:ring-2 text-base sm:text-lg md:text-xl py-2 px-3 transition-all duration-300 ${
              theme === "light"
                ? "border-gray-300 text-black focus:border-indigo-500 focus:ring-indigo-500"
                : "border-gray-600 text-gray-100 bg-gray-700 focus:border-indigo-400 focus:ring-indigo-400"
            }`}
            required
          />
        </div>
        <div>
          <label
            className={`block text-lg sm:text-xl md:text-2xl font-semibold mb-2 ${
              theme === "light" ? "text-gray-700" : "text-gray-200"
            }`}
          >
            Ngày đi
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className={`mt-1 block w-full rounded-lg border shadow-md focus:outline-none focus:ring-2 text-base sm:text-lg md:text-xl py-2 px-3 transition-all duration-300 ${
              theme === "light"
                ? "border-gray-300 text-black focus:border-indigo-500 focus:ring-indigo-500"
                : "border-gray-600 text-gray-100 bg-gray-700 focus:border-indigo-400 focus:ring-indigo-400"
            }`}
            required
          />
        </div>
        <div>
          <label
            className={`block text-lg sm:text-xl md:text-2xl font-semibold mb-2 ${
              theme === "light" ? "text-gray-700" : "text-gray-200"
            }`}
          >
            Loại phòng
          </label>
          <select
            value={roomTypeId}
            onChange={(e) => setRoomTypeId(Number(e.target.value))}
            className={`mt-1 block w-full rounded-lg border shadow-md focus:outline-none focus:ring-2 text-base sm:text-lg md:text-xl py-2 px-3 transition-all duration-300 ${
              theme === "light"
                ? "border-gray-300 text-black focus:border-indigo-500 focus:ring-indigo Liang-500"
                : "border-gray-600 text-gray-100 bg-gray-700 focus:border-indigo-400 focus:ring-indigo-400"
            }`}
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
            className={`w-full text-lg sm:text-xl md:text-2xl font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 ${
              theme === "light"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-700 hover:bg-blue-800"
            } text-white`}
          >
            Tìm phòng
          </button>
        </div>
      </form>
    </div>
  );
};

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
  const { theme } = useTheme();
  const [imageUrl, setImageUrl] = useState<string>(DEFAULT_IMAGE);
  const [starRating, setStarRating] = useState<number>(0);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const images = await getImagesByRoomId(room.id);
        if (images && images.length > 0) {
          setImageUrl(images[0].url);
        }
      } catch (error) {
        console.error(`Failed to fetch image for room ${room.id}:`, error);
        setImageUrl(DEFAULT_IMAGE);
      }
    };
    fetchImage();
  }, [room.id]);

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

  const handleBookingClick = () => {
    navigate(`/room-detail/${room.id}`);
  };

  return (
    <div
      className={`rounded-lg shadow-md overflow-hidden w-full max-w-sm sm:max-w-md mx-auto transition-all duration-300 ${
        theme === "light" ? "bg-white" : "bg-gray-800"
      }`}
    >
      <img
        src={imageUrl}
        alt={room.name}
        className="w-full h-40 sm:h-48 md:h-52 object-cover"
        onError={() => setImageUrl(DEFAULT_IMAGE)}
      />
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <div>
            <p
              className={`text-lg sm:text-xl md:text-2xl font-semibold truncate ${
                theme === "light" ? "text-gray-900" : "text-gray-100"
              }`}
            >
              Tên phòng: {room.name}
            </p>
            <p
              className={`text-sm sm:text-base ${
                theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
            >
              Loại phòng: {room.roomTypeName}
            </p>
          </div>
          <div className="flex items-center mt-2 sm:mt-0">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-base sm:text-lg">
                <img
                  src={i < starRating ? starIcon : starIconEmpty}
                  alt="star"
                  className="w-3 h-3 sm:w-4 h-4"
                />
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <span
            className={`${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <img
              src={totalBookingIcon}
              alt="totalBooking"
              className="w-3 h-3 sm:w-4 h-4"
            />
          </span>
          <p
            className={`text-sm sm:text-base truncate ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            {room.note || "Không có ghi chú"}
          </p>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <p
            className={`text-lg sm:text-xl md:text-2xl font-semibold ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            {room.roomTypePrice?.toLocaleString("vi-VN")}VNĐ/
            <span
              className={`text-sm sm:text-base ${
                theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
            >
              đêm
            </span>
          </p>
          <button
            onClick={handleBookingClick}
            className={`mt-2 sm:mt-0 text-base sm:text-lg py-2 px-4 rounded-md border transition-all duration-200 ${
              theme === "light"
                ? "bg-transparent border-transparent hover:border-gray-400 text-black"
                : "bg-transparent border-transparent hover:border-gray-500 text-white"
            }`}
          >
            Đặt phòng
          </button>
        </div>
      </div>
    </div>
  );
};

const userimageLink = [
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
  "https://images.unsplash.com/photo-1701615004837-40d8573b6652?q=80&w=200",
];

const ReviewCard: React.FC<{
  review: ResponseReviewDto;
  guests: Record<number, ResponseGuestDTO>;
  roomId: number;
  roomNames: Record<number, string>;
}> = ({ review, guests, roomId, roomNames }) => {
  const { theme } = useTheme();
  const guest = guests[review.guestId] || { name: "Ẩn danh" };
  const guestName = guest.name || "Ẩn danh";
  const roomName = roomNames[roomId] || "Phòng không xác định";
  return (
    <div
      className={`rounded-lg shadow-md p-4 transition-all duration-300 ${
        theme === "light" ? "bg-white" : "bg-gray-800"
      }`}
    >
      <div className="flex items-center mb-2">
        <img
          src={userimageLink[Math.floor(Math.random() * userimageLink.length)]}
          alt="user"
          className="w-12 h-12 sm:w-14 h-14 md:w-16 h-16 rounded-full ml-2 sm:ml-4 mt-2 sm:mt-4"
        />
        <h3
          className={`text-lg sm:text-xl md:text-2xl font-playfair font-semibold mb-2 ml-3 sm:ml-5 mt-3 sm:mt-5 ${
            theme === "light" ? "text-gray-900" : "text-gray-100"
          }`}
        >
          {guestName}
        </h3>
      </div>
      <p className="text-sm sm:text-base md:text-lg mb-2 ml-2 sm:ml-4 text-gray-600">
        Đánh giá cho phòng {roomName}
      </p>
      <div className="flex items-center mb-2 ml-2 sm:ml-4">
        {[...Array(5)].map((_, i) => (
          <img
            key={i}
            src={i < review.rating ? starIcon : starIconEmpty}
            alt="star"
            className="w-4 h-4 sm:w-5 h-5 md:w-6 h-6 mr-1"
          />
        ))}
      </div>
      <p
        className={`text-sm sm:text-base md:text-lg italic ml-2 sm:ml-4 ${
          theme === "light" ? "text-gray-600" : "text-gray-300"
        }`}
      >
        {review.comment || "Không có đánh giá"}
      </p>
    </div>
  );
};

// Thêm Skeleton components
const SkeletonBox = ({ className = "" }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}
  ></div>
);

const SkeletonBookingBox = () => (
  <div className="shadow-2xl rounded-2xl p-10 w-256 mx-auto -mt-24 relative z-10 animate-pulse bg-gray-200 dark:bg-gray-700 h-56" />
);

const SkeletonRoomCard = () => (
  <div className="rounded-lg shadow-md overflow-hidden w-full max-w-md mx-auto animate-pulse bg-gray-200 dark:bg-gray-700">
    <div className="w-full h-52 bg-gray-300 dark:bg-gray-600" />
    <div className="p-4">
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-2" />
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-6" />
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2" />
      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mt-4" />
    </div>
  </div>
);

const SkeletonReviewCard = () => (
  <div className="rounded-lg shadow-md p-4 mb-4 animate-pulse bg-gray-200 dark:bg-gray-700">
    <div className="flex items-center mb-2">
      <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 ml-4 mt-4" />
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 ml-5 mt-5" />
    </div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2 ml-4" />
    <div className="flex items-center mb-2 ml-4 space-x-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded" />
      ))}
    </div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 ml-4" />
  </div>
);

// About component
const About: React.FC<{
  totalRooms: number;
  totalBookings: number;
  averageRating: number;
  navigate: (path: string) => void;
}> = ({ totalRooms, totalBookings, averageRating, navigate }) => {
  const { theme } = useTheme();
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  const aboutItems = [
    {
      icon: "🏨",
      count: totalRooms,
      text: "Phòng sang trọng",
      hasSuffix: true,
    },
    {
      icon: "👥",
      count: totalBookings,
      text: "Đặt phòng thành công",
      hasSuffix: true,
    },
    {
      icon: "⭐",
      count: averageRating,
      text: "Đánh giá trung bình",
      hasSuffix: false,
    },
  ];

  const imageLinks = [
    "https://static.independent.co.uk/2025/04/07/14/09/HS-MBH-Exterior-03.jpg",
    "https://luxuryescapes.com/inspiration/wp-content/uploads/2023/06/nh999jb5bo61avqid5c-e1687143719181.webp",
    "https://i0.wp.com/theluxurytravelexpert.com/wp-content/uploads/2019/11/best-luxury-and-most-exclusive-hotels-brands-in-the-world.jpg?fit=1300%2C731&ssl=1",
    "https://www.signatureluxurytravel.com.au/wp-content/uploads/2000/02/CTS-RM-8888-A-TRRCE-FINAL-01A.jpg",
  ];

  // Intersection Observer cho hình ảnh
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const img = entry.target as HTMLImageElement;
          if (entry.isIntersecting) {
            img.classList.add("fade-slide-in", "visible");
            img.classList.remove("fade-slide-out");
          } else {
            img.classList.remove("visible");
            img.classList.add("fade-slide-out");
          }
        });
      },
      {
        root: null,
        threshold: 0.3,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    imageRefs.current.forEach((img) => {
      if (img) observer.observe(img);
    });

    return () => {
      imageRefs.current.forEach((img) => {
        if (img) observer.unobserve(img);
      });
    };
  }, []);

  useEffect(() => {
    imageRefs.current = new Array(4).fill(null);
  }, []);

  return (
    <div
      className={`py-12 sm:py-20 md:py-24 lg:py-32 transition-all duration-300 ${
        theme === "light" ? "bg-gray-200" : "bg-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left side - Content */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <span
                className={`inline-block text-sm sm:text-base font-semibold px-4 py-2 rounded-full mb-4 ${
                  theme === "light"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-blue-900 text-blue-300"
                }`}
              >
                Về chúng tôi
              </span>
              <h2
                className={`text-3xl sm:text-4xl md:text-5xl font-playfair font-bold mb-4 sm:mb-6 ${
                  theme === "light" ? "text-gray-900" : "text-gray-100"
                }`}
              >
                Chào mừng đến với{" "}
                <span
                  className={`${
                    theme === "light" ? "text-blue-600" : "text-blue-400"
                  }`}
                >
                  Roomify
                </span>
              </h2>
            </div>

            <p
              className={`text-base sm:text-lg md:text-xl leading-relaxed ${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              Roomify là điểm đến lý tưởng cho những ai đang tìm kiếm trải
              nghiệm lưu trú đẳng cấp và dịch vụ chuyên nghiệp. Với hệ thống
              phòng hiện đại, tiện nghi sang trọng và đội ngũ nhân viên tận tâm,
              chúng tôi cam kết mang đến cho quý khách những kỳ nghỉ hoàn hảo và
              đáng nhớ nhất.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {aboutItems.map((item, index) => {
                const { ref, inView } = useInView({
                  triggerOnce: true,
                  threshold: 0.3,
                });
                return (
                  <div
                    key={index}
                    className={`p-4 sm:p-6 rounded-lg border transition-all duration-300 ${
                      theme === "light"
                        ? "bg-gray-50 border-gray-200 hover:border-blue-300"
                        : "bg-gray-700 border-gray-600 hover:border-blue-500"
                    }`}
                  >
                    <div className="text-center" ref={ref}>
                      <div className="text-3xl sm:text-4xl mb-4">
                        {item.icon}
                      </div>
                      <h3
                        className={`text-2xl sm:text-5xl font-bold mb-4 ${
                          theme === "light" ? "text-gray-900" : "text-gray-100"
                        }`}
                      >
                        {inView ? (
                          <CountUp
                            start={0}
                            end={
                              typeof item.count === "number"
                                ? item.count
                                : parseFloat(item.count)
                            }
                            duration={2}
                            decimals={
                              item.text === "Đánh giá trung bình" ? 1 : 0
                            }
                            suffix={item.hasSuffix ? "+" : ""}
                          />
                        ) : (
                          "0"
                        )}
                      </h3>
                      <p
                        className={`text-sm sm:text-base ${
                          theme === "light" ? "text-gray-600" : "text-gray-300"
                        }`}
                      >
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate("/policy")}
              className={`px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 ${
                theme === "light"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              Khám phá thêm
            </button>
          </div>

          {/* Right side - Images */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="text-right">
                <img
                  ref={(el) => {
                    if (el) imageRefs.current[0] = el;
                  }}
                  src={imageLinks[0]}
                  alt="Luxury Hotel Exterior"
                  className="ml-8 max-w-88 rounded-lg shadow-lg object-cover h-40 sm:h-48 md:h-64 lg:h-64 fade-slide-in-right"
                />
              </div>
              <div className="text-left">
                <img
                  ref={(el) => {
                    if (el) imageRefs.current[1] = el;
                  }}
                  src={imageLinks[1]}
                  alt="Hotel Interior"
                  className="w-full ml-28 rounded-lg shadow-lg object-cover h-40 sm:h-48 md:h-64 lg:h-64 fade-slide-in"
                />
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6 pt-8 sm:pt-12 lg:pt-16">
              <div className="text-right">
                <img
                  ref={(el) => {
                    if (el) imageRefs.current[2] = el;
                  }}
                  src={imageLinks[2]}
                  alt="Hotel Room"
                  className="ml-26 rounded-lg shadow-lg object-cover h-40 sm:h-48 md:h-64 lg:h-64 fade-slide-in-right"
                />
              </div>
              <div className="text-left">
                <img
                  ref={(el) => {
                    if (el) imageRefs.current[3] = el;
                  }}
                  src={imageLinks[3]}
                  alt="Hotel Amenities"
                  className="max-w-88 ml-26 rounded-lg shadow-lg object-cover h-40 sm:h-48 md:h-64 lg:h-64 fade-slide-in"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [rooms, setRooms] = useState<ResponseRoomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [roomTypeId, setRoomTypeId] = useState(1);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [modalCheckIn, setModalCheckIn] = useState("");
  const [modalCheckOut, setModalCheckOut] = useState("");
  const [modalGuests, setModalGuests] = useState(1);
  const [roomTypes, setRoomTypes] = useState<ResponseRoomTypeDTO[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<number | null>(null);
  const [modalRoomType, setModalRoomType] = useState<number | null>(null);
  const [reviewsByRoom, setReviewsByRoom] = useState<
    Record<number, ResponseReviewDto[]>
  >({});
  const [guests, setGuests] = useState<Record<number, ResponseGuestDTO>>({});
  const [roomNames, setRoomNames] = useState<Record<number, string>>({});
  const [allRoomNames, setAllRoomNames] = useState<Record<number, string>>({});
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRooms, setTotalRooms] = useState<number>(0);

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

      const availableRooms = mappedRooms.filter((room) => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const isCurrentlyBooked = bookingForms.some(
          (form: ResponseBookingConfirmationFormDTO) => {
            if (room.id !== form.roomId) return false;

            const bookingDateObj = new Date(form.bookingDate);
            bookingDateObj.setHours(0, 0, 0, 0);
            const endDate = new Date(bookingDateObj);
            endDate.setDate(bookingDateObj.getDate() + form.rentalDays);
            endDate.setHours(0, 0, 0, 0);

            return currentDate >= bookingDateObj && currentDate < endDate;
          }
        );

        if (isCurrentlyBooked) {
          return false;
        }

        if (checkInDate && checkOutDate) {
          const checkInDateObj = new Date(checkInDate);
          const checkOutDateObj = new Date(checkOutDate);
          return !bookingForms.some(
            (form: ResponseBookingConfirmationFormDTO) => {
              const bookingDateObj = new Date(form.bookingDate);
              const endDate = new Date(bookingDateObj);
              endDate.setDate(bookingDateObj.getDate() + form.rentalDays);
              return (
                room.id === form.roomId &&
                ((checkInDateObj >= bookingDateObj &&
                  checkInDateObj < endDate) ||
                  (checkOutDateObj > bookingDateObj &&
                    checkOutDateObj <= endDate) ||
                  (checkInDateObj <= bookingDateObj &&
                    checkOutDateObj >= endDate))
              );
            }
          );
        }

        return true;
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
  useScrollToTop();
  useEffect(() => {
    fetchData();
    getAllRoomTypes().then(setRoomTypes);
    getAllRooms().then((allRooms) => {
      const names: Record<number, string> = {};
      allRooms.forEach((room) => {
        names[room.id] = room.name;
      });
      setAllRoomNames(names);
    });
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

  useEffect(() => {
    const fetchReviewsAndGuests = async () => {
      const reviewsMap: Record<number, ResponseReviewDto[]> = {};
      const guestsMap: Record<number, ResponseGuestDTO> = {};
      const allroom = await getAllRooms();
      for (const room of allroom) {
        const reviews = await getReviewsByRoomId(room.id);
        reviewsMap[room.id] = reviews;
        for (const review of reviews) {
          if (review.guestId && !guestsMap[review.guestId]) {
            try {
              const guest = await getGuestById(review.guestId);
              guestsMap[review.guestId] = guest;
            } catch (error) {
              console.error(`Failed to fetch guest ${review.guestId}:`, error);
              guestsMap[review.guestId] = {
                name: "Ẩn danh",
                sex: "MALE",
                age: 0,
                identificationNumber: "",
                phoneNumber: "",
                email: "",
                id: 0,
                invoiceIds: [],
                invoiceCreatedDates: [],
                rentalFormIds: [],
                rentalFormCreatedDates: [],
                rentalFormDetailIds: [],
                bookingConfirmationFormIds: [],
                bookingConfirmationFormCreatedDates: [],
                bookingConfirmationFormRoomIds: [],
                bookingConfirmationFormRoomNames: [],
              };
            }
          }
        }
      }
      setReviewsByRoom(reviewsMap);
      setGuests(guestsMap);
    };
    if (rooms.length > 0) fetchReviewsAndGuests();
  }, [rooms]);

  useEffect(() => {
    const roomNames: Record<number, string> = {};
    rooms.forEach((room) => {
      roomNames[room.id] = room.name;
    });
    setRoomNames(roomNames);
  }, [rooms]);

  const sliderRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reviewCardRefs = useRef<(HTMLDivElement | null)[]>([]); // Thêm ref cho ReviewCard
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target as HTMLDivElement;
          if (entry.isIntersecting) {
            card.style.width = "100%";
            card.style.transform = "scale(1)";
          } else {
            card.style.width = "75%";
            card.style.transform = "scale(0.75)";
          }
        });
      },
      {
        root: slider,
        threshold: 0.5,
      }
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      cardRefs.current.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, [rooms]);

  useEffect(() => {
    cardRefs.current = new Array(rooms.length).fill(null);
  }, [rooms]);

  // IntersectionObserver cho RoomCard
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target as HTMLDivElement;
          if (entry.isIntersecting) {
            card.classList.add("fade-slide-in", "visible");
            card.classList.remove("fade-slide-out");
            card.style.width = "100%";
            card.style.transform = "scale(1)";
          } else {
            card.classList.remove("visible");
            card.classList.add("fade-slide-out");
            card.style.width = "75%";
            card.style.transform = "scale(0.75)";
          }
        });
      },
      {
        root: slider,
        threshold: 0.5,
      }
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      cardRefs.current.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, [rooms]);

  // IntersectionObserver cho ReviewCard
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target as HTMLDivElement;
          if (entry.isIntersecting) {
            card.classList.add("fade-slide-in", "visible");
            card.classList.remove("fade-slide-out");
          } else {
            card.classList.remove("visible");
            card.classList.add("fade-slide-out");
          }
        });
      },
      {
        root: null, // Sử dụng viewport làm root
        threshold: 0.1, // Kích hoạt khi 10% thẻ nằm trong viewport
      }
    );

    reviewCardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      reviewCardRefs.current.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, [reviewsByRoom]);

  useEffect(() => {
    cardRefs.current = new Array(rooms.length).fill(null);
    reviewCardRefs.current = new Array(
      Object.values(reviewsByRoom).flat().length
    ).fill(null); // Khởi tạo refs cho ReviewCard
  }, [rooms, reviewsByRoom]);

  // Calculate total bookings and average rating
  useEffect(() => {
    const calculateStats = async () => {
      try {
        // Get all rooms
        const allRooms = await getAllRooms();
        setTotalRooms(allRooms.length);

        // Get all booking confirmation forms
        const allBookings = await getAllBookingConfirmationForms();
        setTotalBookings(allBookings.length);

        // Calculate average rating from all reviews
        const allReviews = Object.values(reviewsByRoom).flat();
        if (allReviews.length > 0) {
          const totalRating = allReviews.reduce(
            (sum, review) => sum + review.rating,
            0
          );
          const avgRating = totalRating / allReviews.length;
          setAverageRating(avgRating);
        } else {
          setAverageRating(0);
        }
      } catch (error) {
        console.error("Error calculating stats:", error);
        setTotalRooms(0);
        setTotalBookings(0);
        setAverageRating(0);
      }
    };

    calculateStats();
  }, [reviewsByRoom]);

  const scrollLeft = () => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const scrollWidth = slider.scrollWidth;
      const clientWidth = slider.clientWidth;
      const maxScroll = scrollWidth - clientWidth;
      const currentScroll = slider.scrollLeft;

      if (currentScroll <= 0) {
        slider.scrollTo({ left: maxScroll, behavior: "smooth" });
      } else {
        slider.scrollBy({ left: -320, behavior: "smooth" });
      }
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const scrollWidth = slider.scrollWidth;
      const clientWidth = slider.clientWidth;
      const maxScroll = scrollWidth - clientWidth;
      const currentScroll = slider.scrollLeft;

      if (currentScroll >= maxScroll) {
        slider.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        slider.scrollBy({ left: 320, behavior: "smooth" });
      }
    }
  };

  return (
    <div
      className={`transition-all duration-300 ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900"
      }`}
    >
      <div
        className="relative w-full flex flex-col bg-center"
        style={{
          backgroundImage: `url(${backgroundImage1})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "80vh sm:min-h-screen",
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-left text-white mb-24 px-8 sm:pl-12 md:pl-16 lg:pl-58 py-8 sm:py-10 mt-20 sm:mt-32 md:mt-40 lg:mt-52">
          <span className="inline-block bg-blue-600/30 text-blue-200 text-lg sm:text-xl md:text-2xl font-semibold px-4 sm:px-6 py-2 rounded-full mb-4 sm:mb-6">
            Trải nghiệm khách sạn đẳng cấp
          </span>
          {/* <div className="bg-black/40 w-160 rounded-lg py-4 mb-4"> */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl italic lg:text-6xl font-bold font-playfair text-blue-200 mb-6">
            <span>Rong chơi bốn phương,</span>
            <span className="block mt-2 sm:mt-4 md:mt-6">
              "giá" vẫn yêu thương
            </span>
          </h1>
          {/* </div> */}
          <p
            className={`text-base sm:text-lg md:text-xl max-w-xl md:max-w-2xl text-blue-200 ${
              theme === "light" ? "text-white" : "text-gray-200"
            }`}
          >
            Sự sang trọng và tiện nghi vô song đang chờ đón bạn tại những khách
            sạn đẳng cấp nhất thế giới. Hãy bắt đầu hành trình của bạn ngay hôm
            nay.
          </p>
          <div className="mt-14 sm:mt-24 md:mt-32 pr-0 sm:pr-2 md:pr-192">
            <BookingBox onSearch={handleSearch} roomTypes={roomTypes} />
          </div>
        </div>
      </div>

      {/* About Section */}
      <About
        totalRooms={totalRooms}
        totalBookings={totalBookings}
        averageRating={averageRating}
        navigate={navigate}
      />

      <div
        className={`flex justify-center ${
          theme === "light" ? "bg-gray-200" : "bg-gray-900"
        }`}
      >
        <div
          className={`h-0.5 w-full max-w-6xl mx-auto transition-all duration-300 ${
            theme === "light" ? "bg-gray-600" : "bg-gray-300"
          }`}
        ></div>
      </div>

      <div
        className={`max-w-full mx-auto py-12 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 md:px-8 lg:px-12 transition-all duration-300 ${
          theme === "light" ? "bg-gray-200" : "bg-gray-900"
        }`}
      >
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl font-playfair mb-6 sm:mb-8 text-center ${
            theme === "light" ? "text-gray-900" : "text-gray-100"
          }`}
        >
          Các phòng đang có sẵn
        </h2>
        <h2
          className={`text-lg sm:text-xl md:text-2xl italic text-center ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          Tận hưởng kỳ nghỉ hoàn hảo với những căn phòng đẳng cấp
        </h2>
        <h2
          className={`text-lg sm:text-xl md:text-2xl italic text-center mb-8 sm:mb-12 ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          sang trọng, tinh tế và đầy ấn tượng.
        </h2>
        {loading && (
          <>
            <SkeletonBookingBox />
            <div className="flex gap-8 py-2 overflow-x-auto no-scrollbar mt-12">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex-shrink-0" style={{ width: 320 }}>
                  <SkeletonRoomCard />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-6 mt-20">
              {[...Array(3)].map((_, i) => (
                <SkeletonReviewCard key={i} />
              ))}
            </div>
          </>
        )}
        {error && (
          <p
            className={`text-center text-base sm:text-lg ${
              theme === "light" ? "text-red-600" : "text-red-400"
            }`}
          >
            {error}
          </p>
        )}
        {!loading && !error && rooms.length === 0 && (
          <p
            className={`text-center text-base sm:text-lg ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            Không có phòng nào sẵn sàng
          </p>
        )}
        <div className="relative">
          <button
            onClick={scrollLeft}
            className={`hidden sm:block absolute -left-4 sm:-left-8 md:-left-12 lg:-left-8 top-1/2 -translate-y-1/2 z-10 shadow rounded-full p-2 transition-all duration-200 w-10 h-10 sm:w-12 h-12 ${
              theme === "light"
                ? "bg-white hover:bg-gray-200"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
            style={{ display: rooms.length > 2 ? "block" : "none" }}
          >
            ←
          </button>
          <div
            ref={sliderRef}
            className="flex gap-4 sm:gap-6 md:gap-8 py-2 overflow-x-auto no-scrollbar snap-x snap-mandatory"
            style={{ scrollBehavior: "smooth" }}
          >
            {rooms.map((room, index) => (
              <div
                key={room.id}
                className="flex-shrink-0 transition-all duration-500 w-full sm:w-64 md:w-72 lg:w-80 xl:w-96 max-w-[400px] snap-center"
                ref={(el) => {
                  if (el) cardRefs.current[index] = el;
                }}
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
            className={`hidden sm:block absolute -right-4 sm:-right-8 md:-right-12 lg:-right-8 top-1/2 -translate-y-1/2 z-10 shadow rounded-full p-2 transition-all duration-200 w-10 h-10 sm:w-12 h-12 ${
              theme === "light"
                ? "bg-white hover:bg-gray-200"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
            style={{ display: rooms.length > 2 ? "block" : "none" }}
          >
            →
          </button>
        </div>
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl font-playfair mb-6 sm:mb-8 text-center mt-12 sm:mt-16 md:mt-20 ${
            theme === "light" ? "text-gray-900" : "text-gray-100"
          }`}
        >
          Đánh giá từ khách hàng
        </h2>
        <h2
          className={`text-lg sm:text-xl md:text-2xl italic text-center mb-8 sm:mb-12 ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          Khám phá lý do vì sao những du khách sành điệu luôn tin chọn Roomify
          <br />
          cho các chỗ ở sang trọng và đẳng cấp.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Object.values(reviewsByRoom)
            .flat()
            .map((review, index) => (
              <div
                key={review.id}
                className="fade-slide-in"
                ref={(el) => {
                  if (el) reviewCardRefs.current[index] = el;
                }}
              >
                <ReviewCard
                  review={review}
                  guests={guests}
                  roomId={review.roomId}
                  roomNames={allRoomNames}
                />
              </div>
            ))}
          {Object.values(reviewsByRoom).every((reviews) => !reviews.length) && (
            <div
              className={`rounded-lg shadow-md p-4 text-center col-span-full transition-all duration-300 fade-slide-in`}
              ref={(el) => {
                if (el) reviewCardRefs.current[0] = el;
              }}
            >
              <p
                className={`text-base sm:text-lg ${
                  theme === "light" ? "text-gray-600" : "text-gray-300"
                }`}
              >
                Chưa có đánh giá
              </p>
            </div>
          )}
        </div>
      </div>
      {showDateModal && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 w-full h-full transition-all duration-300 ${
            theme === "light" ? "bg-black/40" : "bg-black/60"
          }`}
        >
          <div
            className={`rounded-lg shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-md sm:max-w-lg relative transition-all duration-300 ${
              theme === "light" ? "bg-white" : "bg-gray-800"
            }`}
          >
            <button
              className={`absolute top-2 sm:top-4 right-2 sm:right-4 text-xl sm:text-2xl font-bold w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-full transition-all duration-200 ${
                theme === "light"
                  ? "text-gray-500 hover:text-black hover:bg-gray-100"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
              onClick={() => setShowDateModal(false)}
            >
              ×
            </button>
            <h3
              className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center ${
                theme === "light" ? "text-gray-900" : "text-gray-100"
              }`}
            >
              Chọn ngày nhận và trả phòng
            </h3>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label
                  className={`block text-base sm:text-lg md:text-xl font-semibold mb-2 ${
                    theme === "light" ? "text-gray-700" : "text-gray-200"
                  }`}
                >
                  Ngày đến
                </label>
                <input
                  type="date"
                  value={modalCheckIn}
                  onChange={(e) => setModalCheckIn(e.target.value)}
                  className={`w-full text-base sm:text-lg md:text-xl border rounded px-3 py-2 transition-all duration-300 ${
                    theme === "light"
                      ? "text-black border-gray-300"
                      : "text-gray-100 border-gray-600 bg-gray-700"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-base sm:text-lg md:text-xl font-semibold mb-2 ${
                    theme === "light" ? "text-gray-700" : "text-gray-200"
                  }`}
                >
                  Ngày đi
                </label>
                <input
                  type="date"
                  value={modalCheckOut}
                  onChange={(e) => setModalCheckOut(e.target.value)}
                  className={`w-full text-base sm:text-lg md:text-xl border rounded px-3 py-2 transition-all duration-300 ${
                    theme === "light"
                      ? "text-black border-gray-300"
                      : "text-gray-100 border-gray-600 bg-gray-700"
                  }`}
                />
              </div>
              <button
                className={`w-full text-white py-2 sm:py-3 rounded transition-all duration-200 text-base sm:text-lg ${
                  theme === "light"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-green-700 hover:bg-green-800"
                }`}
                onClick={() => {
                  if (!modalCheckIn || !modalCheckOut) {
                    toast.error("Vui lòng chọn ngày đến, ngày đi!");
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
      <Chatbot />
    </div>
  );
};

export default Home;
