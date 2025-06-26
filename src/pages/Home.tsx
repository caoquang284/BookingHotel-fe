import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getRoomsByState } from "../services/apis/room";
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
import starIcon from "../assets/Icon/starIconFilled.svg";
import starIconEmpty from "../assets/Icon/starIconOutlined.svg";
import totalBookingIcon from "../assets/Icon/totalBookingIcon.svg";
import { getReviewsByRoomId } from "../services/apis/review";
import { getGuestById } from "../services/apis/guest";
const DEFAULT_IMAGE = "https://via.placeholder.com/400x300?text=No+Image";

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
    onSearch({ checkIn, checkOut, roomTypeId });
  };

  return (
    <div
      className={`shadow-2xl rounded-2xl p-10 w-256 mx-auto -mt-24 relative z-10 transition-all duration-300 ${
        theme === "light" ? "bg-white" : "bg-gray-800"
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-24"
      >
        <div>
          <label
            className={`block text-2xl font-semibold mb-2 ${
              theme === "light" ? "text-gray-700" : "text-gray-200"
            }`}
          >
            Ngày đến
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className={`mt-1 block w-56 rounded-lg border shadow-md focus:outline-none focus:ring-2 text-2xl py-3 px-4 transition-all duration-300 ${
              theme === "light"
                ? "border-gray-300 text-black focus:border-indigo-500 focus:ring-indigo-500"
                : "border-gray-600 text-gray-100 bg-gray-700 focus:border-indigo-400 focus:ring-indigo-400"
            }`}
            required
          />
        </div>
        <div>
          <label
            className={`block text-2xl font-semibold mb-2 ${
              theme === "light" ? "text-gray-700" : "text-gray-200"
            }`}
          >
            Ngày đi
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className={`mt-1 block w-56 rounded-lg border shadow-md focus:outline-none focus:ring-2 text-2xl py-3 px-4 transition-all duration-300 ${
              theme === "light"
                ? "border-gray-300 text-black focus:border-indigo-500 focus:ring-indigo-500"
                : "border-gray-600 text-gray-100 bg-gray-700 focus:border-indigo-400 focus:ring-indigo-400"
            }`}
            required
          />
        </div>
        <div>
          <label
            className={`block text-2xl font-semibold mb-2 ${
              theme === "light" ? "text-gray-700" : "text-gray-200"
            }`}
          >
            Loại phòng
          </label>
          <select
            value={roomTypeId}
            onChange={(e) => setRoomTypeId(Number(e.target.value))}
            className={`mt-1 block w-56 rounded-lg border shadow-md focus:outline-none focus:ring-2 text-2xl py-4 px-4 transition-all duration-300 ${
              theme === "light"
                ? "border-gray-300 text-black focus:border-indigo-500 focus:ring-indigo-500"
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
            className={`w-full text-white text-2xl font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 ${
              theme === "light"
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-indigo-700 hover:bg-indigo-800"
            }`}
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
      className={`rounded-lg shadow-md overflow-hidden w-full max-w-md mx-auto transition-all duration-300 ${
        theme === "light" ? "bg-white" : "bg-gray-800"
      }`}
    >
      <img
        src={imageUrl}
        alt={room.name}
        className="w-full h-52 object-cover"
        onError={() => setImageUrl(DEFAULT_IMAGE)}
      />
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p
              className={`text-2xl font-semibold truncate ${
                theme === "light" ? "text-gray-900" : "text-gray-100"
              }`}
            >
              Tên phòng: {room.name}
            </p>
            <p
              className={`text-base ${
                theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
            >
              Loại phòng: {room.roomTypeName}
            </p>
          </div>
          <div className="flex items-center mb-6">
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
              className="w-4 h-4"
            />
          </span>
          <p
            className={`text-base truncate ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            {room.note || "Không có ghi chú"}
          </p>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <p
            className={`text-2xl font-semibold ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            {room.roomTypePrice?.toLocaleString("vi-VN")}VNĐ/
            <span
              className={`text-base ${
                theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
            >
              đêm
            </span>
          </p>
          <button
            onClick={handleBookingClick}
            className={`text-base py-2 px-4 rounded-md border transition-all duration-200 ${
              theme === "light"
                ? "bg-transparent border-transparent hover:border-gray-400"
                : "bg-transparent border-transparent hover:border-gray-500"
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
  roomName: string;
}> = ({ review, guests, roomName }) => {
  const { theme } = useTheme();
  const guest = guests[review.guestId] || { name: "Ẩn danh" };
  const guestName = guest.name || "Ẩn danh";

  return (
    <div
      className={`rounded-lg shadow-md p-4 mb-4 transition-all duration-300 ${
        theme === "light" ? "bg-white" : "bg-gray-800"
      }`}
    >
      <div className="flex items-center mb-2">
        <img
          src={userimageLink[Math.floor(Math.random() * userimageLink.length)]}
          alt="user"
          className="w-16 h-16 rounded-full ml-4 mt-4"
        />
        <h3
          className={`text-2xl font-playfair font-semibold mb-2 ml-5 mt-5 ${
            theme === "light" ? "text-gray-900" : "text-gray-100"
          }`}
        >
          {guestName}
        </h3>
      </div>
      <p
        className={`text-lg mb-2 ml-4 ${
          theme === "light" ? "text-gray-600" : "text-gray-300"
        }`}
      >
        Đánh giá cho phòng {roomName}
      </p>
      <div className="flex items-center mb-2 ml-4">
        {[...Array(5)].map((_, i) => (
          <img
            key={i}
            src={i < review.rating ? starIcon : starIconEmpty}
            alt="star"
            className="w-6 h-6 mr-1"
          />
        ))}
      </div>
      <p
        className={`text-lg italic ml-4 ${
          theme === "light" ? "text-gray-600" : "text-gray-300"
        }`}
      >
        {review.comment || "Không có đánh giá"}
      </p>
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

  useEffect(() => {
    const fetchReviewsAndGuests = async () => {
      const reviewsMap: Record<number, ResponseReviewDto[]> = {};
      const guestsMap: Record<number, ResponseGuestDTO> = {};
      for (const room of rooms) {
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
      console.log("Reviews fetched:", reviewsMap);
      setGuests(guestsMap);
    };
    if (rooms.length > 0) fetchReviewsAndGuests();
  }, [rooms]);

  const sliderRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target as HTMLDivElement;
          if (entry.isIntersecting) {
            card.style.width = "320px";
            card.style.transform = "scale(1)";
          } else {
            card.style.width = "240px";
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

  return (
    <div
      className={`transition-all duration-300 ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900"
      }`}
    >
      <div
        className="relative w-full flex flex-col bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
        }}
      >
        <div className="relative z-10 text-left px-4 py-10 pl-56 mt-52">
          <span
            className={`inline-block text-2xl font-semibold px-6 py-2 rounded-full mb-6 ${
              theme === "light"
                ? "bg-green-200 bg-opacity-50 text-blue-800"
                : "bg-green-900 bg-opacity-50 text-blue-200"
            }`}
          >
            Trải nghiệm khách sạn đẳng cấp
          </span>
          <h1
            className={`text-5xl italic md:text-6xl font-bold mb-6 ${
              theme === "light" ? "text-yellow-500" : "text-yellow-400"
            }`}
          >
            Rong chơi bốn phương,
            <br />
            "giá" vẫn yêu thương
          </h1>
          <p
            className={`text-xl md:text-xl mb-8 max-w-2xl font-semibold ${
              theme === "light" ? "text-white" : "text-gray-200"
            }`}
          >
            Sự sang trọng và tiện nghi vô song đang chờ đón bạn tại những khách
            sạn đẳng cấp nhất thế giới. Hãy bắt đầu hành trình của bạn ngay hôm
            nay.
          </p>

          <div className="mt-32 pr-256">
            <BookingBox onSearch={handleSearch} roomTypes={roomTypes} />
          </div>
        </div>
      </div>
      <div
        className={`max-w-8xl mx-auto py-32 px-48 transition-all duration-300 ${
          theme === "light" ? "bg-gray-100" : "bg-gray-900"
        }`}
      >
        <h2
          className={`text-5xl font-playfair mb-8 text-center ${
            theme === "light" ? "text-gray-900" : "text-gray-100"
          }`}
        >
          Các phòng đang có sẵn
        </h2>
        <h2
          className={`text-2xl italic text-center ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          Tận hưởng kỳ nghỉ hoàn hảo với những căn phòng đẳng cấp
        </h2>
        <h2
          className={`text-2xl italic text-center mb-12 ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          sang trọng, tinh tế và đầy ấn tượng.
        </h2>
        {loading && (
          <p
            className={`text-center ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            Đang tải...
          </p>
        )}
        {error && (
          <p
            className={`text-center ${
              theme === "light" ? "text-red-600" : "text-red-400"
            }`}
          >
            {error}
          </p>
        )}
        {!loading && !error && rooms.length === 0 && (
          <p
            className={`text-center ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            Không có phòng nào sẵn sàng
          </p>
        )}
        <div className="relative">
          <button
            onClick={scrollLeft}
            className={`absolute -left-16 top-1/2 -translate-y-1/2 z-10 shadow rounded-full p-2 transition-all duration-200 w-12 h-12 ${
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
            className="flex gap-8 py-2 overflow-x-auto no-scrollbar"
            style={{ scrollBehavior: "smooth" }}
          >
            {rooms.map((room, index) => (
              <div
                key={room.id}
                className="flex-shrink-0 transition-all duration-500"
                style={{ width: 320 }}
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
            className={`absolute -right-16 top-1/2 -translate-y-1/2 z-10 shadow rounded-full p-2 transition-all duration-200 w-12 h-12 ${
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
          className={`text-5xl font-playfair mb-8 text-center mt-20 ${
            theme === "light" ? "text-gray-900" : "text-gray-100"
          }`}
        >
          Đánh giá từ khách hàng
        </h2>
        <h2
          className={`text-2xl italic text-center mb-12 ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          Khám phá lý do vì sao những du khách sành điệu luôn tin chọn Roomify
          <br />
          cho các chỗ ở sang trọng và đẳng cấp.
        </h2>
        <div className="grid grid-cols-3 gap-6 max-h-[800px] overflow-hidden">
          {Object.values(reviewsByRoom)
            .flat()
            .slice(0, 6)
            .map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                guests={guests}
                roomName={
                  rooms.find((room) => room.id === review.roomId)?.name ||
                  "Phòng không xác định"
                }
              />
            ))}
          {Object.values(reviewsByRoom).every((reviews) => !reviews.length) && (
            <div
              className={`rounded-lg shadow-md p-4 text-center col-span-3 transition-all duration-300 ${
                theme === "light" ? "bg-white" : "bg-gray-800"
              }`}
            >
              <p
                className={`${
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
            className={`rounded-lg shadow-lg p-8 w-full max-w-lg relative transition-all duration-300 ${
              theme === "light" ? "bg-white" : "bg-gray-800"
            }`}
          >
            <button
              className={`absolute top-4 right-4 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${
                theme === "light"
                  ? "text-gray-500 hover:text-black hover:bg-gray-100"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
              onClick={() => setShowDateModal(false)}
            >
              ×
            </button>
            <h3
              className={`text-2xl font-bold mb-6 text-center ${
                theme === "light" ? "text-gray-900" : "text-gray-100"
              }`}
            >
              Chọn ngày nhận và trả phòng
            </h3>
            <div className="space-y-6">
              <div>
                <label
                  className={`block text-xl font-semibold mb-2 ${
                    theme === "light" ? "text-gray-700" : "text-gray-200"
                  }`}
                >
                  Ngày đến
                </label>
                <input
                  type="date"
                  value={modalCheckIn}
                  onChange={(e) => setModalCheckIn(e.target.value)}
                  className={`w-full text-xl border rounded px-3 py-2 transition-all duration-300 ${
                    theme === "light"
                      ? "text-black border-gray-300"
                      : "text-gray-100 border-gray-600 bg-gray-700"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-xl font-semibold mb-2 ${
                    theme === "light" ? "text-gray-700" : "text-gray-200"
                  }`}
                >
                  Ngày đi
                </label>
                <input
                  type="date"
                  value={modalCheckOut}
                  onChange={(e) => setModalCheckOut(e.target.value)}
                  className={`w-full text-xl border rounded px-3 py-2 transition-all duration-300 ${
                    theme === "light"
                      ? "text-black border-gray-300"
                      : "text-gray-100 border-gray-600 bg-gray-700"
                  }`}
                />
              </div>
              <button
                className={`w-full text-white py-3 rounded transition-all duration-200 ${
                  theme === "light"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-green-700 hover:bg-green-800"
                }`}
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