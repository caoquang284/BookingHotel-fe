import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import bg from "../assets/Image/bg.jpg";
import bg1 from "../assets/Image/bg1.jpg";
import bg2 from "../assets/Image/bg2.jpg";
// Giả định danh sách hình ảnh (thay bằng đường dẫn thực tế)
const hotelImages = [
  "https://static.independent.co.uk/2025/04/07/14/09/HS-MBH-Exterior-03.jpg",
  bg,
  bg1,
  bg2,
];

const HotelDetail: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100">
      <section className="relative mt-28 mb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 mt-32">
          {/* Carousel chiếm 1/2 màn hình */}
          <div className="w-full lg:w-1/2">
            <Carousel
              showThumbs={false}
              autoPlay
              infiniteLoop
              interval={3000}
              showStatus={false}
              selectedItem={currentSlide}
              onChange={(index) => setCurrentSlide(index)}
              className="w-full"
            >
              {hotelImages.map((image, index) => (
                <div key={index}>
                  <img
                    src={image}
                    alt={`Hotel Roomify ${index + 1}`}
                    className="w-full h-[625px] sm:h-[625px] md:h-[625px] object-cover rounded-lg"
                  />
                </div>
              ))}
            </Carousel>
          </div>

          {/* Hình ảnh phòng - Masonry Grid */}
          <div className="w-full lg:w-1/2 h-[640px] grid grid-cols-3 gap-4 overflow-hidden">
            {[
              {
                src: "https://xuonggooccho.com/ckfinder/userfiles/files/anh-phong-ngu.jpg",
                label: "Standard Room",
                size: "img-size-full",
                opacity: "img-opacity-full",
              },
              {
                src: "https://noithattrevietnam.com/uploaded/2019/12/1-thiet-ke-phong-ngu-khach-san%20%281%29.jpg",
                label: "Deluxe Room",
                size: "img-size-full",
                opacity: "img-opacity-low",
              },
              {
                src: "https://acihome.vn/uploads/17/phong-ngu-khach-san-5-sao.jpg",
                label: "Suite",
                size: "img-size-full",
                opacity: "img-opacity-medium",
              },
              {
                src: "https://www.vietnambooking.com/wp-content/uploads/2021/02/khach-san-ho-chi-minh-35.jpg",
                label: "Premium Room",
                size: "img-size-full",
                opacity: "img-opacity-low",
              },
              {
                src: "https://ik.imagekit.io/tvlk/blog/2023/09/khach-san-view-bien-da-nang-1.jpg",
                label: "Standard Room",
                size: "img-size-full",
                opacity: "img-opacity-medium",
              },
              {
                src: "https://res.cloudinary.com/djbvf02yt/image/upload/v1744266362/qsj8vz0bptxfirwamtx5.png",
                label: "Deluxe Room",
                size: "img-size-full",
                opacity: "img-opacity-full",
              },
              {
                src: "https://res.cloudinary.com/djbvf02yt/image/upload/v1744266321/w05jzxrqfwb35qjg5p13.png",
                label: "Suite",
                size: "img-size-full",
                opacity: "img-opacity-low",
              },
              {
                src: "https://res.cloudinary.com/djbvf02yt/image/upload/v1744266245/erovkf0owfbai9h8jkzq.png",
                label: "Premium Room",
                size: "img-size-full",
                opacity: "img-opacity-medium",
              },
              {
                src: "https://res.cloudinary.com/djbvf02yt/image/upload/v1744266199/s6xhgewuv9sf3c1jnlik.png",
                label: "Standard Room",
                size: "img-size-full",
                opacity: "img-opacity-full",
              },
            ].map((room, index) => (
              <div key={index} className="aspect-square">
                <img
                  src={room.src}
                  alt={room.label}
                  className={`${room.size} h-full object-cover rounded-lg shadow-lg ${room.opacity}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nội dung chi tiết */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Giới thiệu tổng quan */}
        <section className="mb-12">
          <h2 className="text-5xl font-bold text-blue-900 mb-4 font-playfair">
            Chào mừng đến với Roomify
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            Tọa lạc tại Linh Xuân, Thủ Đức, TP. Hồ Chí Minh, Roomify mang đến
            không gian nghỉ dưỡng hiện đại, tiện nghi và dịch vụ tận tâm. Với vị
            trí thuận lợi gần các điểm tham quan và trung tâm giáo dục, chúng
            tôi là lựa chọn lý tưởng cho cả du lịch và công tác.
          </p>
        </section>

        {/* Tiện ích nổi bật */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">
            Tiện ích nổi bật
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <svg
                className="w-10 h-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-lg text-gray-700">Wi-Fi tốc độ cao miễn phí</p>
            </div>
            <div className="flex items-center gap-4">
              <svg
                className="w-10 h-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="text-lg text-gray-700">
                Dịch vụ dọn phòng hàng ngày (09:00–17:00)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <svg
                className="w-10 h-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <p className="text-lg text-gray-700">
                Phòng Pet-friendly (liên hệ để biết thêm chi tiết)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <svg
                className="w-10 h-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <p className="text-lg text-gray-700">
                Dịch vụ giặt ủi chuyên nghiệp
              </p>
            </div>
          </div>
        </section>

        {/* Loại phòng */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">
            Các loại phòng
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-semibold text-blue-800 mb-2">
                Single Room
              </h3>
              <p className="text-lg text-gray-700 mb-4">
                Phòng tiêu chuẩn với tầm nhìn thành phố, tiện nghi đầy đủ.
              </p>
              <p className="text-blue-600 font-bold text-lg">
                Từ 500.000 VND/đêm
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-semibold text-blue-800 mb-2">
                Double Room
              </h3>
              <p className="text-lg text-gray-700 mb-4">
                Phòng rộng rãi với ban công và view biển, lý tưởng cho cặp đôi.
              </p>
              <p className="text-blue-600 font-bold text-lg">
                Từ 800.000 VND/đêm
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-semibold text-blue-800 mb-2">
                Suite
              </h3>
              <p className="text-lg text-gray-700 mb-4">
                Phòng sang trọng với không gian riêng biệt, hoàn hảo cho gia
                đình.
              </p>
              <p className="text-blue-600 font-bold text-lg">
                Từ 1.200.000 VND/đêm
              </p>
            </div>
          </div>
        </section>

        {/* Chính sách nổi bật */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">
            Chính sách nổi bật
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-lg text-gray-700">
            <li>Check-in tự do 24/24, check-out trước 0:00.</li>
            <li>
              Hủy phòng miễn phí trước 3 ngày (không tính cuối tuần và lễ).
            </li>
            <li>Trẻ em dưới 6 tuổi miễn phí, ngủ chung giường với bố mẹ.</li>
            <li>
              Xem chi tiết tại{" "}
              <Link to="/policy" className="text-blue-600 hover:underline">
                Chính sách khách sạn
              </Link>
              .
            </li>
          </ul>
        </section>

        {/* Thông tin liên hệ */}
        <section className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">
            Liên hệ và Đặt phòng
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Hãy liên hệ với chúng tôi để được hỗ trợ đặt phòng nhanh chóng!
          </p>
          <p className="text-lg text-gray-700 mb-2">
            <strong>Số điện thoại:</strong> 0123456789
          </p>
          <p className="text-lg text-gray-700 mb-4">
            <strong>Email:</strong>{" "}
            <a
              href="mailto:roomify@gmail.com"
              className="text-blue-600 hover:underline"
            >
              roomify@gmail.com
            </a>
          </p>
          <Link
            to="/booking"
            className="inline-block bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-all text-lg"
          >
            Đặt phòng ngay
          </Link>
        </section>

        {/* Bản đồ */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">
            Vị trí của chúng tôi
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Roomify tọa lạc tại Linh Xuân, Thủ Đức, chỉ cách Đại học Quốc gia
            TP.HCM 5 phút đi xe.
          </p>
          <div className="w-full h-64 bg-gray-300 rounded-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.231240416422!2d106.776018114623!3d10.870008992249!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175270b0d4b315f%3A0x4b0b2e8b7b0c2b0!2sLinh%20Xu%C3%A2n%2C%20Th%E1%BB%A7%20%C4%90%E1%BB%A9c%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh%2C%20Vietnam!5e0!3m2!1sen!2s!4v1634567890123!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HotelDetail;
