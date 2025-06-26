import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getRoomsByState } from "../services/apis/room";
import { getAllRoomTypes } from "../services/apis/roomType";
import { getAllFloors } from "../services/apis/floor";
import { getAllBookingConfirmationForms } from "../services/apis/bookingconfirm";
import { getImagesByRoomId } from "../services/apis/image"; // Import API ảnh
import { useAuth } from "../contexts/AuthContext";
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
import { getGuestById } from "../services/apis/guest"; // Import API lấy thông tin khách
// Placeholder ảnh mặc định
const DEFAULT_IMAGE = "https://via.placeholder.com/400x300?text=No+Image";

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
    <div className="bg-white shadow-2xl rounded-2xl p-10 w-256 mx-auto -mt-24 relative z-10">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-24"
      >
        <div>
          <label className="block text-2xl font-semibold text-gray-700 mb-2">
            Ngày đến
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="text-black mt-1 block w-56 rounded-lg border-gray-300 shadow-md focus:border-indigo-500 focus:ring-indigo-500 text-2xl py-3 px-4"
            required
          />
        </div>
        <div>
          <label className="block text-2xl font-semibold text-gray-700 mb-2">
            Ngày đi
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="text-black mt-1 block w-56 rounded-lg border-gray-300 shadow-md focus:border-indigo-500 focus:ring-indigo-500 text-2xl py-3 px-4"
            required
          />
        </div>
        <div>
          <label className="block text-2xl font-semibold text-gray-700 mb-2">
            Loại phòng
          </label>
          <select
            value={roomTypeId}
            onChange={(e) => setRoomTypeId(Number(e.target.value))}
            className="text-black mt-1 block w-56 rounded-lg border-gray-300 shadow-md focus:border-indigo-500 focus:ring-indigo-500 text-2xl py-4 px-4"
            required
          >
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end ">
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white text-2xl font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 shadow-lg transition-all duration-200"
          >
            Tìm phòng
          </button>
        </div>
      </form>
    </div>
  );
};

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
  const [imageUrl, setImageUrl] = useState<string>(DEFAULT_IMAGE);
  const [starRating, setStarRating] = useState<number>(0); // Thêm state cho số sao

  // Lấy ảnh đầu tiên cho phòng
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

  // Lấy đánh giá và tính trung bình rating
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
        setStarRating(0); // Mặc định 0 sao nếu lỗi
      }
    };
    fetchReviews();
  }, [room.id]);

  const handleBookingClick = () => {
    navigate(`/room-detail/${room.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full max-w-md mx-auto">
      <img
        src={imageUrl}
        alt={room.name}
        className="w-full h-52 object-cover"
        onError={() => setImageUrl(DEFAULT_IMAGE)}
      />
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-2xl font-semibold truncate">
              Tên phòng: {room.name}
            </p>
            <p className="text-gray-600 text-base">
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
          <span className="text-gray-600">
            <img
              src={totalBookingIcon}
              alt="totalBooking"
              className="w-4 h-4"
            />
          </span>
          <p className="text-gray-600 text-base truncate">
            {room.note || "Không có ghi chú"}
          </p>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-gray-600 text-2xl font-semibold">
            {room.roomTypePrice?.toLocaleString("vi-VN")}VNĐ/
            <span className="text-gray-600 text-base">đêm</span>
          </p>
          <button
            onClick={handleBookingClick}
            className="bg-transparent text-base py-2 px-4 rounded-md border border-transparent hover:border-gray-400 transition-all duration-200"
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
  const guest = guests[review.guestId] || { name: "Ẩn danh" };
  const guestName = guest.name || "Ẩn danh";

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center mb-2">
        <img
          src={userimageLink[Math.floor(Math.random() * userimageLink.length)]}
          alt="user"
          className="w-16 h-16 rounded-full ml-4 mt-4"
        />
        <h3 className="text-2xl font-playfair font-semibold mb-2 ml-5 mt-5">
          {guestName}
        </h3>
      </div>

      <p className="text-gray-600 text-lg mb-2 ml-4">
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
      <p className="text-gray-600 text-lg italic ml-4">
        {review.comment || "Không có đánh giá"}
      </p>
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
  >({}); // Lưu đánh giá theo roomId
  const [guests, setGuests] = useState<Record<number, ResponseGuestDTO>>({}); // Lưu thông tin khách hàng theo guestId

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

      // Lọc phòng dựa trên khoảng thời gian booking và ngày hiện tại
      const availableRooms = mappedRooms.filter((room) => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00 để so sánh ngày

        // Kiểm tra xem phòng có đang được đặt trong khoảng thời gian hiện tại không
        const isCurrentlyBooked = bookingForms.some(
          (form: ResponseBookingConfirmationFormDTO) => {
            if (room.id !== form.roomId) return false;

            const bookingDateObj = new Date(form.bookingDate);
            bookingDateObj.setHours(0, 0, 0, 0);
            const endDate = new Date(bookingDateObj);
            endDate.setDate(bookingDateObj.getDate() + form.rentalDays);
            endDate.setHours(0, 0, 0, 0);

            // Kiểm tra xem ngày hiện tại có nằm trong khoảng thời gian booking không
            return currentDate >= bookingDateObj && currentDate < endDate;
          }
        );

        // Nếu phòng đang được đặt trong khoảng thời gian hiện tại, ẩn phòng đó
        if (isCurrentlyBooked) {
          return false;
        }

        // Nếu có tham số tìm kiếm, kiểm tra thêm khoảng thời gian tìm kiếm
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
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]); // Định nghĩa cardRefs với kiểu đúng

  // Hàm cuộn trái với logic vòng lặp
  const scrollLeft = () => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const scrollWidth = slider.scrollWidth;
      const clientWidth = slider.clientWidth;
      const maxScroll = scrollWidth - clientWidth;
      const currentScroll = slider.scrollLeft;

      console.log("Scroll Left - Current:", currentScroll, "Max:", maxScroll); // Debug

      if (currentScroll <= 0) {
        // Cuộn về cuối
        slider.scrollTo({ left: maxScroll, behavior: "smooth" });
      } else {
        // Cuộn bình thường
        slider.scrollBy({ left: -320, behavior: "smooth" });
      }
    }
  };

  // Hàm cuộn phải với logic vòng lặp
  const scrollRight = () => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const scrollWidth = slider.scrollWidth;
      const clientWidth = slider.clientWidth;
      const maxScroll = scrollWidth - clientWidth;
      const currentScroll = slider.scrollLeft;

      console.log("Scroll Right - Current:", currentScroll, "Max:", maxScroll); // Debug

      if (currentScroll >= maxScroll) {
        // Cuộn về đầu
        slider.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        // Cuộn bình thường
        slider.scrollBy({ left: 320, behavior: "smooth" });
      }
    }
  };

  // Hiệu ứng zoom dựa trên vị trí cuộn
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

  // Khởi tạo cardRefs khi rooms thay đổi
  useEffect(() => {
    cardRefs.current = new Array(rooms.length).fill(null);
  }, [rooms]);

  return (
    <div>
      <div
        className="relative w-full flex flex-col bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
        }}
      >
        {/* Overlay để làm tối nền ảnh */}
        {/* <div className="absolute inset-0 bg-blue bg-opacity-60 z-10"></div> */}

        {/* Nội dung chính */}
        <div className="relative z-10 text-left text-white px-4 py-10 pl-56 mt-52">
          <span className="inline-block bg-green-200 bg-opacity-50 text-blue-800 text-2xl font-semibold px-6 py-2 rounded-full mb-6">
            Trải nghiệm khách sạn đẳng cấp
          </span>
          <h1 className="text-5xl text-yellow-500 italic md:text-6xl font-bold mb-6">
            Rong chơi bốn phương,
            <br />
            "giá" vẫn yêu thương
          </h1>
          <p className="text-xl md:text-xl mb-8 max-w-2xl font-semibold">
            Sự sang trọng và tiện nghi vô song đang chờ đón bạn tại những khách
            sạn đẳng cấp nhất thế giới. Hãy bắt đầu hành trình của bạn ngay hôm
            nay.
          </p>

          <div className="mt-32 pr-256">
            <BookingBox onSearch={handleSearch} roomTypes={roomTypes} />
          </div>
        </div>
      </div>
      <div className="max-w-8xl mx-auto py-32 px-48 bg-gray-100">
        <h2 className="text-5xl font-playfair mb-8 text-center">
          Các phòng đang có sẵn
        </h2>
        <h2 className="text-2xl italic text-gray-600 text-center">
          Tận hưởng kỳ nghỉ hoàn hảo với những căn phòng đẳng cấp
        </h2>
        <h2 className="text-2xl italic text-gray-600 text-center mb-12">
          sang trọng, tinh tế và đầy ấn tượng.
        </h2>
        {loading && <p className="text-center">Đang tải...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && rooms.length === 0 && (
          <p className="text-center">Không có phòng nào sẵn sàng</p>
        )}
        <div className="relative">
          <button
            onClick={scrollLeft}
            className="absolute -left-16 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hover:bg-gray-200 w-12 h-12"
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
            className="absolute -right-16 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hover:bg-gray-200 w-12 h-12"
            style={{ display: rooms.length > 2 ? "block" : "none" }}
          >
            →
          </button>
        </div>
        <h2 className="text-5xl font-playfair mb-8 text-center mt-20">
          Đánh giá từ khách hàng
        </h2>
        <h2 className="text-2xl italic text-gray-600 text-center mb-12">
          Khám phá lý do vì sao những du khách sành điệu luôn tin chọn Roomify
          <br />
          cho các chỗ ở sang trọng và đẳng cấp.
        </h2>
        <div className="grid grid-cols-3 gap-6 max-h-[800px] overflow-hidden">
          {Object.values(reviewsByRoom)
            .flat()
            // Giới hạn tối đa 6 card
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
            <div className="bg-white rounded-lg shadow-md p-4 text-center col-span-3">
              <p className="text-gray-600">Chưa có đánh giá</p>
            </div>
          )}
        </div>
      </div>
      {showDateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 w-full h-full">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
              onClick={() => setShowDateModal(false)}
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-6 text-center">
              Chọn ngày nhận và trả phòng
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xl font-semibold text-gray-700 mb-2">
                  Ngày đến
                </label>
                <input
                  type="date"
                  value={modalCheckIn}
                  onChange={(e) => setModalCheckIn(e.target.value)}
                  className="w-full text-black text-xl border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xl font-semibold text-gray-700 mb-2">
                  Ngày đi
                </label>
                <input
                  type="date"
                  value={modalCheckOut}
                  onChange={(e) => setModalCheckOut(e.target.value)}
                  className="w-full text-black text-xl border rounded px-3 py-2"
                />
              </div>
              <button
                className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
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
