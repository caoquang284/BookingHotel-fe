import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomById } from "../services/apis/room";
import { getAllRoomTypes } from "../services/apis/roomType";
import { getAllFloors } from "../services/apis/floor";
import type { ResponseRoomDTO, ResponseRoomTypeDTO } from "../types/index.ts";
import mapIcon from "../assets/Icon/locationIcon.svg";
import starIcon from "../assets/Icon/starIconFilled.svg";

const BookingBox: React.FC<{
  onSearch: (params: {
    checkIn: string;
    checkOut: string;
    roomTypeId: number;
  }) => void;
  roomTypes: ResponseRoomTypeDTO[];
  onDateChange?: (checkIn: string, checkOut: string) => void; // Callback để truyền giá trị ngày
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
      onDateChange(checkIn, checkOut); // Truyền giá trị ngày lên parent
    }
    onSearch({ checkIn, checkOut, roomTypeId });
  };

  const handleBookNow = () => {
    if (onDateChange && checkIn && checkOut) {
      onDateChange(checkIn, checkOut);
      // Thêm logic điều hướng hoặc xử lý "Book now" nếu cần (tùy thuộc vào parent)
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roomData, roomTypesData, floorsData] = await Promise.all([
          getRoomById(Number(id)),
          getAllRoomTypes(),
          getAllFloors(),
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
        setLoading(false);
      } catch (err) {
        console.error("Error fetching room detail:", err);
        setError("Không thể tải chi tiết phòng");
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const imageLinks = [
    "https://xuonggooccho.com/ckfinder/userfiles/files/anh-phong-ngu.jpg",
    "https://noithattrevietnam.com/uploaded/2019/12/1-thiet-ke-phong-ngu-khach-san%20%281%29.jpg",
    "https://acihome.vn/uploads/17/phong-ngu-khach-san-5-sao.jpg",
    "https://www.vietnambooking.com/wp-content/uploads/2021/02/khach-san-ho-chi-minh-35.jpg",
    "https://ik.imagekit.io/tvlk/blog/2023/09/khach-san-view-bien-da-nang-1.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2",
    "https://res.cloudinary.com/djbvf02yt/image/upload/v1744266362/qsj8vz0bptxfirwamtx5.png",
    "https://res.cloudinary.com/djbvf02yt/image/upload/v1744266321/w05jzxrqfwb35qjg5p13.png",
    "https://res.cloudinary.com/djbvf02yt/image/upload/v1744266245/erovkf0owfbai9h8jkzq.png",
    "https://res.cloudinary.com/djbvf02yt/image/upload/v1744266199/s6xhgewuv9sf3c1jnlik.png",
  ];

  if (loading) return <p className="text-center">Đang tải...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!room) return <p className="text-center">Phòng không tồn tại</p>;

  // Lấy ảnh ngẫu nhiên từ imageLinks
  const mainImage = imageLinks[Math.floor(room.id % imageLinks.length)];
  const thumbnailImages = imageLinks
    .filter((_, index) => index !== room.id % imageLinks.length)
    .slice(0, 4); // Lấy 4 ảnh nhỏ khác

  // Đánh giá sao ngẫu nhiên từ 3 đến 5
  const starRating = Math.floor(Math.random() * 3) + 3;

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
      {" "}
      {/* Tăng py-24 để cách mép trên nhiều hơn */}
      <div className="mb-2 flex items-end gap-4">
        <h1 className="text-5xl font-bold text-gray-800 font-playfair mb-2">
          Room Name: {room.name}
        </h1>
        <span className="text-2xl text-gray-600 font-semibold mb-1">
          ({room.roomTypeName})
        </span>
      </div>
      <div className="">
        <div className="flex items-center">
          {[...Array(starRating)].map((_, i) => (
            <span key={i} className="text-yellow-400 text-2xl">
              <img src={starIcon} alt="star" className="w-8 h-8" />
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center mb-6">
        <span className="text-2xl mr-2">
          <img src={mapIcon} alt="map" className="w-8 h-8" />
        </span>{" "}
        {/* Icon bản đồ */}
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
          />
        </div>
        <div className="w-1/2 grid grid-cols-2 gap-4">
          {thumbnailImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${room.name}-thumbnail-${index}`}
              className="w-full h-72 object-cover rounded-lg"
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
