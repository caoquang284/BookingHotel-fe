import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { getRoomById } from "../services/apis/room";
import { getAllRoomTypes } from "../services/apis/roomType";
import { getAllFloors } from "../services/apis/floor";
import { getImagesByRoomId } from "../services/apis/image";
import { getReviewsByRoomId } from "../services/apis/review";
import { getGuestById } from "../services/apis/guest";
import type {
  ResponseRoomDTO,
  ResponseRoomTypeDTO,
  ResponseImageDto,
  ResponseReviewDto,
  ResponseGuestDTO,
} from "../types/index.ts";
import mapIcon from "../assets/Icon/locationIcon.svg";
import starIcon from "../assets/Icon/starIconFilled.svg";
import starIconEmpty from "../assets/Icon/starIconOutlined.svg";
import { toast } from "react-toastify";

// Placeholder ảnh mặc định
const DEFAULT_IMAGE = "https://via.placeholder.com/400x300?text=No+Image";

const BookingBox: React.FC<{
  onSearch: (params: {
    checkIn: string;
    checkOut: string;
    roomTypeId: number;
  }) => void;
  roomTypes: ResponseRoomTypeDTO[];
  onDateChange?: (checkIn: string, checkOut: string) => void;
  onBookNow: (
    checkIn: string,
    checkOut: string,
    roomId: string | undefined
  ) => void;
  initialCheckIn?: string;
  initialCheckOut?: string;
  isDisabled?: boolean;
}> = ({
  onSearch,
  roomTypes,
  onDateChange,
  onBookNow,
  initialCheckIn,
  initialCheckOut,
  isDisabled,
}) => {
  const { theme } = useTheme();
  const [checkIn, setCheckIn] = useState(initialCheckIn || "");
  const [checkOut, setCheckOut] = useState(initialCheckOut || "");
  const [roomTypeId, setRoomTypeId] = useState<number>(
    roomTypes.length > 0 ? roomTypes[0].id : 1
  );

  useEffect(() => {
    if (roomTypes.length > 0) setRoomTypeId(roomTypes[0].id);
    if (initialCheckIn && initialCheckOut) {
      setCheckIn(initialCheckIn);
      setCheckOut(initialCheckOut);
    }
  }, [roomTypes, initialCheckIn, initialCheckOut]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onDateChange) {
      onDateChange(checkIn, checkOut);
    }
    onSearch({ checkIn, checkOut, roomTypeId });
  };

  const handleBookNowClick = () => {
    if (!checkIn || !checkOut) {
      toast.error("Vui lòng chọn ngày đến và ngày đi!");
      return;
    }
    onBookNow(checkIn, checkOut, undefined);
  };

  return (
    <div
      className={`shadow-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 w-full max-w-4xl mx-auto mt-8 sm:mt-10 md:mt-12 relative z-10 transition-all duration-300 ${
        theme === "light" ? "bg-white" : "bg-gray-800"
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-24"
      >
        <div>
          <label
            className={`block text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-2 transition-all duration-300 ${
              theme === "light" ? "text-gray-700" : "text-gray-200"
            }`}
          >
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => !isDisabled && setCheckIn(e.target.value)}
            className={`mt-1 block w-full rounded-lg shadow-md text-base sm:text-lg md:text-xl lg:text-2xl py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-4 transition-all duration-300 ${
              theme === "light"
                ? "text-black border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                : "text-gray-100 border-gray-600 bg-gray-800 focus:border-indigo-400 focus:ring-indigo-400"
            }`}
            required
            disabled={isDisabled}
          />
        </div>
        <div>
          <label
            className={`block text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-2 transition-all duration-300 ${
              theme === "light" ? "text-gray-700" : "text-gray-200"
            }`}
          >
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => !isDisabled && setCheckOut(e.target.value)}
            className={`mt-1 block w-full rounded-lg shadow-md text-base sm:text-lg md:text-xl lg:text-2xl py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-4 transition-all duration-300 ${
              theme === "light"
                ? "text-black border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                : "text-gray-100 border-gray-600 bg-gray-800 focus:border-indigo-400 focus:ring-indigo-400"
            }`}
            required
            disabled={isDisabled}
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-1 flex items-end justify-self-end">
          <button
            type="button"
            onClick={handleBookNowClick}
            className={`w-full sm:w-auto text-white text-base sm:text-lg md:text-xl lg:text-2xl text-center font-semibold py-2 sm:py-3 md:py-4 px-4 sm:px-8 md:px-16 lg:px-24 rounded-lg shadow-md transition-all duration-300 ${
              theme === "light"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Book now
          </button>
        </div>
      </form>
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
  roomName: string;
}> = ({ review, guests, roomName }) => {
  const { theme } = useTheme();
  const guest = guests[review.guestId] || { name: "Ẩn danh" };
  const guestName = guest.name || "Ẩn danh";

  return (
    <div
      className={`rounded-lg shadow-md p-3 sm:p-4 mb-4 transition-all duration-300 ${
        theme === "light" ? "bg-white" : "bg-gray-800"
      }`}
    >
      <div className="flex items-center mb-2">
        <img
          src={userimageLink[Math.floor(Math.random() * userimageLink.length)]}
          alt="user"
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full ml-2 sm:ml-4 mt-2 sm:mt-4"
        />
        <h3
          className={`text-lg sm:text-xl md:text-2xl font-playfair font-semibold mb-2 ml-3 sm:ml-5 mt-2 sm:mt-5 transition-all duration-300 ${
            theme === "light" ? "text-gray-800" : "text-gray-200"
          }`}
        >
          {guestName}
        </h3>
      </div>
      <p
        className={`text-sm sm:text-base md:text-lg mb-2 ml-2 sm:ml-4 transition-all duration-300 ${
          theme === "light" ? "text-gray-600" : "text-gray-300"
        }`}
      >
        Đánh giá cho phòng {roomName}
      </p>
      <div className="flex items-center mb-2 ml-2 sm:ml-4">
        {[...Array(5)].map((_, i) => (
          <img
            key={i}
            src={i < review.rating ? starIcon : starIconEmpty}
            alt="star"
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-1"
          />
        ))}
      </div>
      <p
        className={`text-sm sm:text-base md:text-lg italic ml-2 sm:ml-4 transition-all duration-300 ${
          theme === "light" ? "text-gray-600" : "text-gray-300"
        }`}
      >
        {review.comment || "Không có đánh giá"}
      </p>
    </div>
  );
};

const RoomDetail: React.FC = () => {
  const { theme } = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCheckIn = queryParams.get("checkIn") || "";
  const initialCheckOut = queryParams.get("checkOut") || "";
  const [room, setRoom] = useState<ResponseRoomDTO | null>(null);
  const [roomTypes, setRoomTypes] = useState<ResponseRoomTypeDTO[]>([]);
  const [checkIn, setCheckIn] = useState<string>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [starRating, setStarRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [reviews, setReviews] = useState<ResponseReviewDto[]>([]);
  const [guests, setGuests] = useState<Record<number, ResponseGuestDTO>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roomData, roomTypesData, floorsData, imagesData, reviewsData] =
          await Promise.all([
            getRoomById(Number(id)),
            getAllRoomTypes(),
            getAllFloors(),
            getImagesByRoomId(Number(id)),
            getReviewsByRoomId(Number(id)),
          ]);
        const roomType = roomTypesData.find(
          (rt) => rt.id === roomData.roomTypeId
        );
        const floor = floorsData.find((f) => f.id === roomData.floorId);
        setRoom({
          ...roomData,
          roomTypeName: roomType?.name || "Không xác định",
          roomTypePrice: roomType?.price || 0,
          floorName: floor?.name || "Không xác định",
        });
        setRoomTypes(roomTypesData);

        const imageUrls = imagesData
          .slice(0, 5)
          .map((img: ResponseImageDto) => img.url);
        while (imageUrls.length < 5) {
          imageUrls.push(DEFAULT_IMAGE);
        }
        setImages(imageUrls);

        setReviews(reviewsData);
        const ratings = reviewsData.map(
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
        setReviewCount(reviewsData.length);

        const guestsMap: Record<number, ResponseGuestDTO> = {};
        for (const review of reviewsData) {
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
        setGuests(guestsMap);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching room detail, images, or reviews:", err);
        setError("Không thể tải chi tiết phòng, ảnh hoặc đánh giá");
        setImages([
          DEFAULT_IMAGE,
          DEFAULT_IMAGE,
          DEFAULT_IMAGE,
          DEFAULT_IMAGE,
          DEFAULT_IMAGE,
        ]);
        setStarRating(0);
        setReviewCount(0);
        setReviews([]);
        setGuests({});
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading)
    return (
      <div
        className={`max-w-8xl mx-auto py-8 sm:py-12 md:py-16 lg:py-42 px-4 sm:px-6 md:px-8 lg:px-48 transition-all duration-300 ${
          theme === "light" ? "bg-gray-100" : "bg-gray-900"
        }`}
      >
        {/* Header skeleton */}
        <div className="mb-2 flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
          <div
            className={`h-8 sm:h-10 md:h-12 lg:h-16 w-3/4 ${
              theme === "light" ? "bg-gray-300" : "bg-gray-600"
            } rounded animate-pulse`}
          ></div>
          <div
            className={`h-6 sm:h-8 md:h-10 lg:h-12 w-1/2 ${
              theme === "light" ? "bg-gray-300" : "bg-gray-600"
            } rounded animate-pulse`}
          ></div>
        </div>

        {/* Rating skeleton */}
        <div className="flex items-center mb-4 sm:mb-6">
          <div className="flex gap-1 sm:gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } rounded-full animate-pulse`}
              ></div>
            ))}
          </div>
          <div
            className={`h-4 sm:h-5 md:h-6 lg:h-7 w-24 sm:w-32 ml-2 ${
              theme === "light" ? "bg-gray-300" : "bg-gray-600"
            } rounded animate-pulse`}
          ></div>
        </div>

        {/* Location skeleton */}
        <div className="flex items-center mb-4 sm:mb-6">
          <div
            className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${
              theme === "light" ? "bg-gray-300" : "bg-gray-600"
            } rounded animate-pulse mr-2`}
          ></div>
          <div
            className={`h-4 sm:h-5 md:h-6 lg:h-7 w-48 sm:w-64 ${
              theme === "light" ? "bg-gray-300" : "bg-gray-600"
            } rounded animate-pulse`}
          ></div>
        </div>

        {/* Image gallery skeleton */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
          <div className="w-full lg:w-1/2">
            <div
              className={`w-full h-48 sm:h-64 md:h-96 lg:h-148 ${
                theme === "light" ? "bg-gray-300" : "bg-gray-600"
              } rounded-lg animate-pulse`}
            ></div>
          </div>
          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-2 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-full h-24 sm:h-32 md:h-48 lg:h-72 ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } rounded-lg animate-pulse`}
              ></div>
            ))}
          </div>
        </div>

        {/* Description skeleton */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div
            className={`h-6 sm:h-8 md:h-10 lg:h-12 w-2/3 ${
              theme === "light" ? "bg-gray-300" : "bg-gray-600"
            } rounded animate-pulse`}
          ></div>
          <div
            className={`h-5 sm:h-6 md:h-8 lg:h-10 w-1/3 ${
              theme === "light" ? "bg-gray-300" : "bg-gray-600"
            } rounded animate-pulse`}
          ></div>
        </div>

        {/* Amenities skeleton */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-8 sm:mb-12 md:mb-16">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`h-6 sm:h-8 w-24 sm:w-32 ${
                theme === "light" ? "bg-gray-200" : "bg-gray-700"
              } rounded animate-pulse`}
            ></div>
          ))}
        </div>

        {/* Booking box skeleton */}
        <div
          className={`shadow-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 w-full max-w-4xl mx-auto mt-8 sm:mt-10 md:mt-12 relative z-10 transition-all duration-300 ${
            theme === "light" ? "bg-white" : "bg-gray-800"
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-24">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div
                  className={`h-4 sm:h-5 md:h-6 lg:h-7 w-20 sm:w-24 ${
                    theme === "light" ? "bg-gray-300" : "bg-gray-600"
                  } rounded animate-pulse`}
                ></div>
                <div
                  className={`h-10 sm:h-12 md:h-14 lg:h-16 w-full ${
                    theme === "light" ? "bg-gray-300" : "bg-gray-600"
                  } rounded animate-pulse`}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider skeleton */}
        <div
          className={`h-0.5 w-full my-8 sm:my-10 md:my-12 mt-12 sm:mt-16 md:mt-20 lg:mt-24 mb-8 sm:mb-12 md:mb-16 lg:mb-24 ${
            theme === "light" ? "bg-gray-200" : "bg-gray-700"
          }`}
        ></div>

        {/* Reviews section skeleton */}
        <div
          className={`h-8 sm:h-10 md:h-12 lg:h-16 w-1/2 ${
            theme === "light" ? "bg-gray-300" : "bg-gray-600"
          } rounded animate-pulse mb-4 sm:mb-6 md:mb-8`}
        ></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`rounded-lg shadow-md p-3 sm:p-4 mb-4 ${
                theme === "light" ? "bg-white" : "bg-gray-800"
              }`}
            >
              <div className="flex items-center mb-2">
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full ${
                    theme === "light" ? "bg-gray-300" : "bg-gray-600"
                  } animate-pulse ml-2 sm:ml-4 mt-2 sm:mt-4`}
                ></div>
                <div
                  className={`h-5 sm:h-6 md:h-7 lg:h-8 w-24 sm:w-32 ${
                    theme === "light" ? "bg-gray-300" : "bg-gray-600"
                  } rounded animate-pulse ml-3 sm:ml-5 mt-2 sm:mt-5`}
                ></div>
              </div>
              <div
                className={`h-4 sm:h-5 w-3/4 ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } rounded animate-pulse mb-2 ml-2 sm:ml-4`}
              ></div>
              <div className="flex gap-1 sm:gap-2 mb-2 ml-2 sm:ml-4">
                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${
                      theme === "light" ? "bg-gray-300" : "bg-gray-600"
                    } rounded-full animate-pulse`}
                  ></div>
                ))}
              </div>
              <div
                className={`h-4 sm:h-5 w-full ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } rounded animate-pulse ml-2 sm:ml-4`}
              ></div>
            </div>
          ))}
        </div>
      </div>
    );
  if (error)
    return (
      <p
        className={`text-center text-2xl transition-all duration-300 ${
          theme === "light" ? "text-red-600" : "text-red-400"
        }`}
      >
        {error}
      </p>
    );
  if (!room)
    return (
      <p
        className={`text-center text-2xl transition-all duration-300 ${
          theme === "light" ? "text-gray-600" : "text-gray-300"
        }`}
      >
        Phòng không tồn tại
      </p>
    );

  const mainImage = images[0];
  const thumbnailImages = images.slice(1, 5);

  const handleDateChange = (newCheckIn: string, newCheckOut: string) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
  };

  const handleBookNow = (
    checkIn: string,
    checkOut: string,
    roomId: string | undefined
  ) => {
    if (!id) {
      toast.error("Không tìm thấy ID phòng!");
      return;
    }
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
    navigate(
      `/booking?roomId=${id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=1`
    );
  };

  return (
    <div
      className={`max-w-8xl mx-auto py-8 sm:py-12 md:py-16 lg:py-42 px-4 sm:px-6 md:px-8 lg:px-48 transition-all duration-300 ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900"
      }`}
    >
      <div className="mb-2 flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
        <h1
          className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-playfair mb-2 transition-all duration-300 ${
            theme === "light" ? "text-gray-800" : "text-gray-200"
          }`}
        >
          Room Name: {room.name}
        </h1>
        <span
          className={`text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-1 transition-all duration-300 ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          ({room.roomTypeName})
        </span>
      </div>
      <div className="">
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="text-yellow-400 text-lg sm:text-xl md:text-2xl"
            >
              <img
                src={i < starRating ? starIcon : starIconEmpty}
                alt="star"
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
              />
            </span>
          ))}
          <span
            className={`text-sm sm:text-base md:text-lg lg:text-xl ml-2 mt-2 transition-all duration-300 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            {reviewCount} lượt đánh giá
          </span>
        </div>
      </div>
      <div className="flex items-center mb-4 sm:mb-6">
        <span className="text-lg sm:text-xl md:text-2xl mr-2">
          <img
            src={mapIcon}
            alt="map"
            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
          />
        </span>
        <span
          className={`text-sm sm:text-base md:text-lg lg:text-xl transition-all duration-300 ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          Main Road 123 Street , 23 Colony
        </span>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
        <div className="w-full lg:w-1/2">
          <img
            src={mainImage}
            alt={room.name}
            className="w-full h-48 sm:h-64 md:h-96 lg:h-148 object-cover rounded-lg"
            onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
          />
        </div>
        <div className="w-full lg:w-1/2 grid grid-cols-2 gap-2 sm:gap-4">
          {thumbnailImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${room.name}-thumbnail-${index}`}
              className="w-full h-24 sm:h-32 md:h-48 lg:h-72 object-cover rounded-lg"
              onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
            />
          ))}
        </div>
      </div>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <p
          className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-playfair mb-2 transition-all duration-300 ${
            theme === "light" ? "text-black" : "text-gray-100"
          }`}
        >
          {"Trải nghiệm xa xỉ chưa từng có"}
        </p>
        <p
          className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold transition-all duration-300 ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          {room.roomTypePrice} VND/Đêm
        </p>
      </div>
      <div>
        <span
          className={`inline-block text-sm sm:text-base md:text-lg lg:text-xl font-semibold mr-2 sm:mr-4 px-2 sm:px-3 py-1 mt-2 rounded transition-all duration-300 ${
            theme === "light"
              ? "bg-blue-100 text-blue-800"
              : "bg-blue-900 text-blue-200"
          }`}
        >
          Wifi miễn phí
        </span>
        <span
          className={`inline-block text-sm sm:text-base md:text-lg lg:text-xl font-semibold mr-2 sm:mr-4 px-2 sm:px-3 py-1 mt-2 rounded transition-all duration-300 ${
            theme === "light"
              ? "bg-green-100 text-green-800"
              : "bg-green-900 text-green-200"
          }`}
        >
          Đậu xe miễn phí
        </span>
        <span
          className={`inline-block text-sm sm:text-base md:text-lg lg:text-xl font-semibold mr-2 sm:mr-4 px-2 sm:px-3 py-1 mt-2 rounded transition-all duration-300 ${
            theme === "light"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-yellow-900 text-yellow-200"
          }`}
        >
          Bữa sáng miễn phí
        </span>
        <span
          className={`inline-block text-sm sm:text-base md:text-lg lg:text-xl font-semibold px-2 sm:px-3 py-1 mt-2 mb-8 sm:mb-12 md:mb-16 rounded transition-all duration-300 ${
            theme === "light"
              ? "bg-purple-100 text-purple-800"
              : "bg-purple-900 text-purple-200"
          }`}
        >
          Check-in nhanh chóng
        </span>
      </div>
      <BookingBox
        onSearch={() => {}}
        roomTypes={roomTypes}
        onDateChange={handleDateChange}
        onBookNow={handleBookNow}
        initialCheckIn={initialCheckIn}
        initialCheckOut={initialCheckOut}
        isDisabled={!!initialCheckIn && !!initialCheckOut}
      />

      <div
        className={`h-0.5 w-full my-8 sm:my-10 md:my-12 mt-12 sm:mt-16 md:mt-20 lg:mt-24 mb-8 sm:mb-12 md:mb-16 lg:mb-24 transition-all duration-300 ${
          theme === "light" ? "bg-gray-200" : "bg-gray-700"
        }`}
      ></div>
      <h2
        className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-playfair mb-4 sm:mb-6 md:mb-8 text-left mt-8 sm:mt-10 md:mt-12 transition-all duration-300 ${
          theme === "light" ? "text-black" : "text-gray-200"
        }`}
      >
        Khách hàng nói gì?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-h-[600px] overflow-hidden">
        {reviews.slice(0, 6).map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            guests={guests}
            roomName={room.name}
          />
        ))}
        {reviews.length === 0 && (
          <div
            className={`rounded-lg shadow-md p-4 text-center col-span-1 sm:col-span-2 lg:col-span-3 transition-all duration-300 ${
              theme === "light" ? "bg-white" : "bg-gray-800"
            }`}
          >
            <p
              className={`text-base sm:text-lg md:text-xl lg:text-2xl transition-all duration-300 ${
                theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
            >
              Chưa có đánh giá
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetail;
