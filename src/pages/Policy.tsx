import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const HotelPolicy: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-42 transition-all duration-300 ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto rounded-lg shadow-md p-6 sm:p-8 transition-all duration-300 ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        }`}
      >
        <h1
          className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-playfair font-extrabold text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 transition-all duration-300 ${
            theme === "light" ? "text-gray-900" : "text-gray-100"
          }`}
        >
          CHÍNH SÁCH KHÁCH SẠN ROOMIFY
        </h1>

        <section className="mb-6 sm:mb-8">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 transition-all duration-300 ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}
          >
            1. Quy định chung
          </h2>
          <ul
            className={`list-decimal pl-6 space-y-2 text-base sm:text-lg md:text-xl transition-all duration-300 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>Tên khách sạn: Roomify</li>
            <li>Địa chỉ: Linh Xuân, Thủ Đức, Hồ Chí Minh</li>
            <li>Số điện thoại liên hệ: 0123456789</li>
            <li>
              Email hỗ trợ:{" "}
              <a
                href="mailto:roomify@gmail.com"
                className={`${
                  theme === "light" ? "text-blue-600" : "text-blue-400"
                } hover:underline transition-all duration-300`}
              >
                roomify@gmail.com
              </a>
            </li>
            <li>Giờ làm việc lễ tân: 24/7</li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 transition-all duration-300 ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}
          >
            2. Đặt phòng/Gia hạn & Thanh toán
          </h2>
          <ul
            className={`list-decimal pl-6 space-y-2 text-base sm:text-lg md:text-xl transition-all duration-300 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>Đặt phòng qua website, hoặc điện thoại.</li>
            <li>
              Khách đặt phòng phải cung cấp thông tin cá nhân chính xác: họ tên,
              số CMND/CCCD, ngày sinh, số điện thoại, email.
            </li>
            <li>Xác nhận đặt phòng sẽ được gửi thông qua email.</li>
            <li>
              Gia hạn tại quầy lễ tân hoặc gia hạn online qua website khách sạn,
              thời gian gia hạn tối đa là 5 ngày cho một phiếu thuê.
            </li>
            <li>
              Các hình thức thanh toán:
              <ul
                className={`list-disc pl-6 mt-2 space-y-2 text-base sm:text-lg md:text-xl transition-all duration-300 ${
                  theme === "light" ? "text-gray-600" : "text-gray-300"
                }`}
              >
                <li>Tiền mặt (VND)</li>
                <li>Chuyển khoản ngân hàng</li>
                <li>Thẻ tín dụng/quẹt thẻ (Visa, MasterCard, JCB)</li>
              </ul>
            </li>
            <li>
              Thanh toán trực tiếp tại quầy lễ tân hoặc thanh toán và checkout
              online qua website khách sạn, chỉ thanh toán tổng một lần khi
              checkout.
            </li>
            <li>
              Khách sạn có quyền tạm giữ thông tin CCCD/CMND để đảm bảo phí phát
              sinh.
            </li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 transition-all duration-300 ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}
          >
            3. Giờ nhận & Trả phòng
          </h2>
          <ul
            className={`list-decimal pl-6 space-y-2 text-base sm:text-lg md:text-xl transition-all duration-300 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>
              Giờ nhận phòng (check-in): tự do, khách sạn hoạt động 24/24, nhận
              phòng trực tiếp tại quầy lễ tân.
            </li>
            <li>
              Giờ trả phòng (check-out): trước 0h:00 ngày phiếu đặt phòng hết
              hạn
            </li>
            <li>
              Trả phòng muộn được tính phí như sau:
              <ul
                className={`list-disc pl-6 mt-2 space-y-2 text-base sm:text-lg md:text-xl transition-all duration-300 ${
                  theme === "light" ? "text-gray-600" : "text-gray-300"
                }`}
              >
                <li>Từ 12:00 đến 18:00: 50% giá phòng một đêm</li>
                <li>Sau 18:00: tính thành một đêm ngủ tiếp theo</li>
              </ul>
            </li>
            <li>
              Nếu phòng sẵn sàng trước giờ check-in, khách có thể nhận sớm nếu
              có yêu cầu và thu phụ phí mỗi đêm bằng giá thuê phòng thực tế.
            </li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 transition-all duration-300 ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}
          >
            4. Hủy phòng & Không đến
          </h2>
          <ul
            className={`list-decimal pl-6 space-y-2 text-base sm:text-lg md:text-xl transition-all duration-300 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>
              Quy định hủy phòng:
              <ul
                className={`list-disc pl-6 mt-2 space-y-2 text-base sm:text-lg md:text-xl transition-all duration-300 ${
                  theme === "light" ? "text-gray-600" : "text-gray-300"
                }`}
              >
                <li>
                  Hủy trước 3 ngày (không tính thứ 7, CN, lễ) kể từ ngày đặt
                  phòng qua website khách sạn hoặc hotline.
                </li>
                <li>
                  Sau 3 ngày, khách hàng phải liên hệ hotline để lễ tân hủy đặt
                  phòng. Trường hợp phiếu hết hạn nhưng không liên hệ hủy, khách
                  sạn sẽ từ chối tiếp nhận quý khách vào những lần sau.
                </li>
              </ul>
            </li>
            <li>
              Thời gian no-show được tính sau 4 giờ chiều ngày nhận phòng.
            </li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 transition-all duration-300 ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}
          >
            5. Quy định trẻ em & giường phụ
          </h2>
          <ul
            className={`list-decimal pl-6 space-y-2 text-base sm:text-lg md:text-xl transition-all duration-300 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>Trẻ em dưới 6 tuổi: miễn phí, ngủ chung giường với bố mẹ.</li>
            <li>
              Trẻ em từ 6–12 tuổi: phụ thu 50% giá phòng (bao gồm ăn sáng).
            </li>
            <li>
              Trẻ em trên 12 tuổi hoặc người lớn thứ ba: phụ thu 100% giá người
              lớn.
            </li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 transition-all duration-300 ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}
          >
            6. Chính sách thú cưng
          </h2>
          <ul
            className={`list-decimal pl-6 space-y-2 text-base sm:text-lg md:text-xl transition-all duration-300 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>
              Không nhận chó mèo hoặc bất kỳ vật nuôi nào (trừ dịch vụ chuyên
              biệt “Pet-friendly”).
            </li>
            <li>
              Khách có phòng Pet-friendly liên hệ lễ tân để biết điều kiện và
              phụ phí.
            </li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 transition-all duration-300 ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}
          >
            7. Chính sách hút thuốc
          </h2>
          <ul
            className={`list-decimal pl-6 space-y-2 text-base sm:text-lg md:text-xl transition-all duration-300 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>
              Toàn bộ khu vực phòng nghỉ: <strong>cấm hút thuốc</strong>.
            </li>
            <li>Khu vực ngoài trời có nơi chỉ định mới được phép hút thuốc.</li>
            <li>Vi phạm phạt 1.000.000 VND/lần dọn dẹp, khử mùi.</li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 transition-all duration-300 ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}
          >
            8. Dọn phòng & Giặt ủi
          </h2>
          <ul
            className={`list-decimal pl-6 space-y-2 text-base sm:text-lg md:text-xl transition-all duration-300 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>Dịch vụ dọn phòng hàng ngày từ 09:00–17:00.</li>
            <li>
              Khách có thể chọn không làm phiền bằng cách treo biển "Do Not
              Disturb".
            </li>
            <li>Dịch vụ giặt ủi, là ủi tính phí riêng theo bảng giá.</li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 transition-all duration-300 ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}
          >
            9. An toàn & Bảo mật
          </h2>
          <ul
            className={`list-decimal pl-6 space-y-2 text-base sm:text-lg md:text-xl transition-all duration-300 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>
              Khách sạn không chịu trách nhiệm về tài sản quý giá để trong
              phòng; khuyến khích sử dụng két an toàn.
            </li>
            <li>
              Tất cả khách và tài sản mang theo phải tuân thủ quy định PCCC và
              hướng dẫn an toàn.
            </li>
            <li>
              Trong trường hợp sự cố, khách liên hệ ngay lễ tân để được hỗ trợ.
            </li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 transition-all duration-300 ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}
          >
            10. Quyền riêng tư & Bảo vệ dữ liệu
          </h2>
          <ul
            className={`list-decimal pl-6 space-y-2 text-base sm:text-lg md:text-xl transition-all duration-300 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>
              Thông tin cá nhân của khách được bảo mật theo quy định của pháp
              luật Việt Nam và khách sạn.
            </li>
            <li>
              Khách sạn không chia sẻ dữ liệu khách hàng cho bên thứ ba khi chưa
              có sự đồng ý.
            </li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 transition-all duration-300 ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}
          >
            11. Điều khoản bất khả kháng
          </h2>
          <ul
            className={`list-decimal pl-6 space-y-2 text-base sm:text-lg md:text-xl transition-all duration-300 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>
              Khách sạn miễn trách nhiệm khi không thể cung cấp dịch vụ do thiên
              tai, chiến tranh, đình công, lực lượng ngoại lệ...
            </li>
            <li>
              Mọi thay đổi về lịch trình, giá dịch vụ sẽ được thông báo kịp
              thời.
            </li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 transition-all duration-300 ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}
          >
            12. Hiệu lực & Sửa đổi
          </h2>
          <ul
            className={`list-decimal pl-6 space-y-2 text-base sm:text-lg md:text-xl transition-all duration-300 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>Chính sách này có hiệu lực từ ngày ban hành.</li>
            <li>
              Mọi sửa đổi, bổ sung phải được ban giám đốc phê duyệt và thông báo
              công khai.
            </li>
          </ul>
        </section>

        <p
          className={`text-center text-sm sm:text-base md:text-lg italic transition-all duration-300 ${
            theme === "light" ? "text-gray-500" : "text-gray-400"
          }`}
        >
          Quý khách có thắc mắc xin vui lòng liên hệ lễ tân để được hỗ trợ sớm
          nhất. Trân trọng.
        </p>
      </div>
    </div>
  );
};

export default HotelPolicy;