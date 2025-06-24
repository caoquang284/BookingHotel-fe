import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomById } from "../services/apis/room";
import { getAllRoomTypes } from "../services/apis/roomType";
import { getAllFloors } from "../services/apis/floor";
import { getImagesByRoomId } from "../services/apis/image";
import { getReviewsByRoomId } from "../services/apis/review"; // Import API đánh giá
import type {
  ResponseRoomDTO,
  ResponseRoomTypeDTO,
  ResponseImageDto,
  ResponseReviewDto,
} from "../types/index.ts";
import mapIcon from "../assets/Icon/locationIcon.svg";
import starIcon from "../assets/Icon/starIconFilled.svg";
import starIconEmpty from "../assets/Icon/starIconOutlined.svg";

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
}> = ({ onSearch, roomTypes, onDateChange }) => {
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
    if (onDateChange) {
      onDateChange(checkIn, checkOut);
    }
    onSearch({ checkIn, checkOut, roomTypeId });
  };

  const handleBookNow = () => {
    if (onDateChange && checkIn && checkOut) {
      onDateChange(checkIn, checkOut);
    }
  };

  return (
    <div className="bg-white shadow-2xl rounded-3xl p-12 w-300 mx-auto mt-12 relative z-10">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-24"
      >
        <div>
          <label className="block text-2xl font-semibold text-gray-700 mb-2">
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="text-black mt-1 block w-64 rounded-lg border-gray-300 shadow-md focus:border-indigo-500 focus:ring-indigo-500 text-2xl py-4 px-6"
            required
          />
        </div>
        <div>
          <label className="block text-2xl font-semibold text-gray-700 mb-2">
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="text-black mt-1 block w-64 rounded-lg border-gray-300 shadow-md focus:border-indigo-500 focus:ring-indigo-500 text-2xl py-4 px-6"
            required
          />
        </div>
        <div className="justify-self-end mt-4">
          <button
            type="button"
            onClick={handleBookNow}
            className="bg-blue-600 text-white text-2xl text-center font-semibold mt-4 py-4 px-24 rounded-lg hover:bg-blue-700 shadow-md"
          >
            Book now
          </button>
        </div>
      </form>
    </div>
  );
};

const RoomDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<ResponseRoomDTO | null>(null);
  const [roomTypes, setRoomTypes] = useState<ResponseRoomTypeDTO[]>([]);
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]); // State lưu danh sách URL ảnh
  const [starRating, setStarRating] = useState<number>(0); // State lưu số sao trung bình
  const [reviewCount, setReviewCount] = useState<number>(0);
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

        // Lấy 5 ảnh đầu tiên
        const imageUrls = imagesData
          .slice(0, 5)
          .map((img: ResponseImageDto) => img.url);
        while (imageUrls.length < 5) {
          imageUrls.push(DEFAULT_IMAGE);
        }
        setImages(imageUrls);

        // Tính trung bình rating và số lượt đánh giá
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
        setReviewCount(reviewsData.length); // Lưu số lượng đánh giá
        console.log(reviewsData);
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
        setReviewCount(0); // Mặc định 0 lượt nếu lỗi
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <p className="text-center">Đang tải...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!room) return <p className="text-center">Phòng không tồn tại</p>;

  // Lấy ảnh chính và 4 ảnh thumbnail
  const mainImage = images[0];
  const thumbnailImages = images.slice(1, 5);

  const handleDateChange = (newCheckIn: string, newCheckOut: string) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
  };

  const handleBookNow = () => {
    if (!checkIn || !checkOut) {
      alert("Vui lòng chọn ngày đến và ngày đi!");
      return;
    }
    navigate(
      `/booking?roomId=${id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=1`
    );
  };

  return (
    <div className="max-w-8xl mx-auto py-42 px-48">
      <div className="mb-2 flex items-end gap-4">
        <h1 className="text-5xl font-bold text-gray-800 font-playfair mb-2">
          Room Name: {room.name}
        </h1>
        <span className="text-2xl text-gray-600 font-semibold mb-1">
          ({room.roomTypeName})
        </span>
      </div>
      <div className="">
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-yellow-400 text-2xl">
              <img
                src={i < starRating ? starIcon : starIconEmpty}
                alt="star"
                className="w-6 h-6"
              />
            </span>
          ))}
          <span className="text-gray-600 text-xl ml-2 mt-2">
            {reviewCount} lượt đánh giá
          </span>
        </div>
      </div>
      <div className="flex items-center mb-6">
        <span className="text-2xl mr-2">
          <img src={mapIcon} alt="map" className="w-8 h-8" />
        </span>
        <span className="text-xl text-gray-600">
          Main Road 123 Street , 23 Colony
        </span>
      </div>
      <div className="flex gap-6 mb-12">
        <div className="w-1/2">
          <img
            src={mainImage}
            alt={room.name}
            className="w-full h-148 object-cover rounded-lg"
            onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
          />
        </div>
        <div className="w-1/2 grid grid-cols-2 gap-4">
          {thumbnailImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${room.name}-thumbnail-${index}`}
              className="w-full h-72 object-cover rounded-lg"
              onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
            />
          ))}
        </div>
      </div>
      <div className="mb-4">
        <p className="text-black text-4xl mt-2 font-playfair">
          {"Experience Luxury Like Never Before"}
        </p>
      </div>
      <div>
        <span className="inline-block bg-blue-100 text-blue-800 text-xl font-semibold mr-2 px-3 py-1 rounded">
          Free Wifi
        </span>
        <span className="inline-block bg-green-100 text-green-800 text-xl font-semibold mr-2 px-3 py-1 rounded">
          Free Parking
        </span>
        <span className="inline-block bg-yellow-100 text-yellow-800 text-xl font-semibold mr-2 px-3 py-1 rounded">
          Free Breakfast
        </span>
        <span className="inline-block bg-purple-100 text-purple-800 text-xl font-semibold px-3 py-1 rounded">
          Fast Check-in
        </span>
      </div>
      <BookingBox
        onSearch={() => {}}
        roomTypes={roomTypes}
        onDateChange={handleDateChange}
      />
    </div>
  );
};

export default RoomDetail;
