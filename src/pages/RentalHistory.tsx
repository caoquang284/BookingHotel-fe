import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { getGuestByAccountId } from "../services/apis/guest";
import { getRoomById } from "../services/apis/room";
import { getAllRentalFormsNoPage } from "../services/apis/rentalform";
import { getAllRentalFormDetailsByUserId } from "../services/apis/rentalFormDetail";
import { getRoomTypeById } from "../services/apis/roomType";
import { getImagesByRoomId } from "../services/apis/image";
import { getAllInvoicesNoPage } from "../services/apis/invoice";
import { getAllInvoiceDetails } from "../services/apis/invoicedetail";
import type { ResponseGuestDTO } from "../types/index.ts";
import { toast } from "react-toastify";

const RentalHistory: React.FC = () => {
  const { user, isInitialized } = useAuth();
  const { theme } = useTheme();
  useScrollToTop();
  const [guestId, setGuestId] = useState<number | null>(null);
  const [rentalForms, setRentalForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomImages, setRoomImages] = useState<{ [roomId: number]: string }>(
    {}
  );
  const [expandedRentals, setExpandedRentals] = useState<Set<number>>(
    new Set()
  );
  const [invoiceDetails, setInvoiceDetails] = useState<{
    [rentalId: number]: any;
  }>({});

  // Hàm toggle dropdown
  const toggleDropdown = (rentalId: number) => {
    console.log(rentalId);
    const newExpanded = new Set(expandedRentals);
    if (newExpanded.has(rentalId)) {
      newExpanded.delete(rentalId);
    } else {
      newExpanded.add(rentalId);
    }
    setExpandedRentals(newExpanded);
  };

  // Hàm lấy thông tin chi tiết cho rental form
  const fetchRentalDetails = async (rentalForm: any) => {
    try {
      console.log("🔍 Fetching details for rental form:", rentalForm.id);

      // Lấy thông tin hóa đơn
      const allInvoices = await getAllInvoicesNoPage();
      console.log("🧾 All invoices:", allInvoices);

      // Lấy chi tiết hóa đơn trước
      const allInvoiceDetails = await getAllInvoiceDetails();
      console.log("📄 All invoice details:", allInvoiceDetails);

      // Tìm invoice detail có rentalFormId khớp
      const invoiceDetail = allInvoiceDetails.find(
        (detail) => detail.rentalFormId === rentalForm.id
      );

      console.log("📋 Found invoice detail:", invoiceDetail);

      if (invoiceDetail) {
        // Tìm invoice tương ứng
        const invoice = allInvoices.find(
          (inv: any) => inv.id === invoiceDetail.invoiceId
        );

        console.log("💰 Found invoice:", invoice);

        if (invoice) {
          setInvoiceDetails((prev) => ({
            ...prev,
            [rentalForm.id]: { invoice, invoiceDetail },
          }));

          console.log(
            "✅ Successfully set details for rental form:",
            rentalForm.id
          );
        } else {
          console.log("❌ No invoice found for invoice detail:", invoiceDetail);
        }
      } else {
        console.log(
          "❌ No invoice detail found for rental form:",
          rentalForm.id
        );
      }
    } catch (error) {
      console.error(
        `Error fetching details for rental form ${rentalForm.id}:`,
        error
      );
    }
  };

  useEffect(() => {
    const fetchRentalHistory = async () => {
      if (!isInitialized) {
        return;
      }

      if (!user?.id) {
        setError("Vui lòng đăng nhập để xem lịch sử thuê phòng");
        setLoading(false);
        return;
      }

      try {
        const guestData: ResponseGuestDTO = await getGuestByAccountId(user.id);
        setGuestId(guestData.id);

        // Bước 1: Lấy danh sách rental form details của khách hàng
        const rentalFormDetails = await getAllRentalFormDetailsByUserId(
          guestData.id
        );
        console.log("📋 Rental form details for user:", rentalFormDetails);

        // Bước 2: Lấy danh sách rental form IDs từ rental form details
        const rentalFormIds = rentalFormDetails.map(
          (detail) => detail.rentalFormId
        );
        console.log("🏠 Rental form IDs:", rentalFormIds);

        if (rentalFormIds.length === 0) {
          setRentalForms([]);
          setLoading(false);
          return;
        }

        // Bước 3: Lấy thông tin chi tiết của các rental forms
        const allRentalForms = await getAllRentalFormsNoPage();
        const userRentalForms = allRentalForms.filter((rental) =>
          rentalFormIds.includes(rental.id)
        );

        console.log("👤 User rental forms:", userRentalForms);

        // Bước 4: Lấy thông tin phòng và hình ảnh cho từng rental form
        const enrichedRentalForms = await Promise.all(
          userRentalForms.map(async (rental) => {
            const room = await getRoomById(rental.roomId);
            const roomType = await getRoomTypeById(room.roomTypeId);

            // Lấy hình ảnh phòng
            try {
              const images = await getImagesByRoomId(rental.roomId);
              if (images && images.length > 0) {
                setRoomImages((prev) => ({
                  ...prev,
                  [rental.roomId]: images[0].url,
                }));
              }
            } catch (err) {
              console.error(
                `Error fetching images for room ${rental.roomId}:`,
                err
              );
            }

            return {
              ...rental,
              roomName: room.name,
              roomTypeName: roomType.name,
            };
          })
        );

        setRentalForms(enrichedRentalForms);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching rental history:", err);
        setError("Không thể tải lịch sử thuê phòng");
        setLoading(false);
      }
    };

    fetchRentalHistory();
  }, [user?.id, isInitialized]);

  if (loading)
    return (
      <div
        className={`min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-42 transition-all duration-300 ${
          theme === "light" ? "bg-gray-100" : "bg-gray-900"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div
            className={`h-8 sm:h-10 md:h-12 lg:h-16 w-3/4 mx-auto ${
              theme === "light" ? "bg-gray-300" : "bg-gray-600"
            } rounded animate-pulse mb-6 sm:mb-8 md:mb-10 lg:mb-12`}
          ></div>

          {/* Rental cards skeleton */}
          <div className="grid gap-4 sm:gap-6">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className={`shadow-md rounded-lg p-4 sm:p-6 transition-all duration-300 ${
                  theme === "light" ? "bg-white" : "bg-gray-800"
                }`}
              >
                {/* Header skeleton */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2 sm:gap-0">
                  <div
                    className={`h-4 sm:h-5 md:h-6 lg:h-7 w-32 sm:w-40 ${
                      theme === "light" ? "bg-gray-300" : "bg-gray-600"
                    } rounded animate-pulse`}
                  ></div>
                  <div
                    className={`h-4 sm:h-5 md:h-6 lg:h-7 w-24 sm:w-32 ${
                      theme === "light" ? "bg-gray-300" : "bg-gray-600"
                    } rounded animate-pulse`}
                  ></div>
                </div>

                {/* Content skeleton */}
                <div className="space-y-2 sm:space-y-3">
                  <div
                    className={`h-4 sm:h-5 md:h-6 lg:h-7 w-3/4 ${
                      theme === "light" ? "bg-gray-300" : "bg-gray-600"
                    } rounded animate-pulse`}
                  ></div>
                  <div
                    className={`h-4 sm:h-5 md:h-6 lg:h-7 w-1/2 ${
                      theme === "light" ? "bg-gray-300" : "bg-gray-600"
                    } rounded animate-pulse`}
                  ></div>
                  <div
                    className={`h-4 sm:h-5 md:h-6 lg:h-7 w-2/3 ${
                      theme === "light" ? "bg-gray-300" : "bg-gray-600"
                    } rounded animate-pulse`}
                  ></div>
                  <div
                    className={`h-4 sm:h-5 md:h-6 lg:h-7 w-1/3 ${
                      theme === "light" ? "bg-gray-300" : "bg-gray-600"
                    } rounded animate-pulse`}
                  ></div>
                </div>

                {/* Buttons skeleton */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4">
                  <div
                    className={`h-8 sm:h-10 w-20 sm:w-24 ${
                      theme === "light" ? "bg-gray-200" : "bg-gray-700"
                    } rounded animate-pulse`}
                  ></div>
                  <div
                    className={`h-8 sm:h-10 w-24 sm:w-28 ${
                      theme === "light" ? "bg-gray-200" : "bg-gray-700"
                    } rounded animate-pulse`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div
        className={`text-center py-8 sm:py-12 text-lg sm:text-xl font-semibold transition-all duration-300 ${
          theme === "light" ? "text-red-600" : "text-red-400"
        }`}
      >
        {toast.error(error)}
      </div>
    );

  if (!rentalForms.length)
    return (
      <div
        className={`text-center py-12 sm:py-16 md:py-24 lg:py-48 px-4 sm:px-8 md:px-16 lg:px-42 text-xl sm:text-2xl font-semibold transition-all duration-300 ${
          theme === "light" ? "text-gray-600" : "text-gray-300"
        }`}
      >
        Không có lịch sử thuê phòng
      </div>
    );

  return (
    <div
      className={`min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-42 transition-all duration-300 ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <h2
          className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-playfair font-extrabold text-center mt-8 mb-6 sm:mb-8 md:mb-10 lg:mb-12 transition-all duration-300 ${
            theme === "light" ? "text-gray-900" : "text-gray-100"
          }`}
        >
          Lịch Sử Thuê Phòng
        </h2>
        <div className="grid gap-4 sm:gap-6">
          {rentalForms.map((rental) => {
            const isPaid = rental.isPaidAt;
            return (
              <div
                key={rental.id}
                className={`shadow-md rounded-lg p-4 sm:p-6 transition-all duration-300 ${
                  theme === "light" ? "bg-white" : "bg-gray-800"
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                  {/* Hình ảnh phòng bên trái */}
                  <div className="lg:w-1/3">
                    {roomImages[rental.roomId] ? (
                      <img
                        src={roomImages[rental.roomId]}
                        alt={`Phòng ${rental.roomName}`}
                        className="w-full h-48 sm:h-56 md:h-64 lg:h-68 object-cover rounded-lg shadow-md"
                      />
                    ) : (
                      <div
                        className={`w-full h-48 sm:h-56 md:h-64 lg:h-48 rounded-lg shadow-md flex items-center justify-center ${
                          theme === "light" ? "bg-gray-200" : "bg-gray-700"
                        }`}
                      >
                        <span
                          className={`text-sm sm:text-base md:text-lg ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          Không có hình ảnh
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Thông tin thuê phòng bên phải */}
                  <div className="lg:w-2/3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2 sm:gap-0">
                      <span
                        className={`text-base sm:text-lg md:text-xl lg:text-2xl ${
                          theme === "light" ? "text-gray-600" : "text-gray-300"
                        }`}
                      >
                        <span className="font-semibold">Mã phiếu:</span>{" "}
                        {rental.id}
                      </span>
                      <span
                        className={`text-base sm:text-lg md:text-xl lg:text-2xl ${
                          theme === "light" ? "text-gray-600" : "text-gray-300"
                        }`}
                      >
                        <span className="font-semibold">Trạng thái:</span>{" "}
                        <span
                          className={`${
                            isPaid ? "text-green-500" : "text-yellow-500"
                          }`}
                        >
                          {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                        </span>
                      </span>
                    </div>
                    <p
                      className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-2 sm:mb-3 ${
                        theme === "light" ? "text-gray-600" : "text-gray-300"
                      }`}
                    >
                      <span className="font-semibold">Phòng:</span>{" "}
                      {rental.roomName} - {rental.roomTypeName}
                    </p>
                    <p
                      className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-2 sm:mb-3 ${
                        theme === "light" ? "text-gray-600" : "text-gray-300"
                      }`}
                    >
                      <span className="font-semibold">Ngày thuê:</span>{" "}
                      {new Date(rental.rentalDate).toLocaleDateString("vi-VN")}
                    </p>
                    <p
                      className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-2 sm:mb-3 ${
                        theme === "light" ? "text-gray-600" : "text-gray-300"
                      }`}
                    >
                      <span className="font-semibold">Số ngày thuê:</span>{" "}
                      {rental.numberOfRentalDays}
                    </p>
                    {isPaid && (
                      <p
                        className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-2 sm:mb-3 ${
                          theme === "light" ? "text-gray-600" : "text-gray-300"
                        }`}
                      >
                        <span className="font-semibold">Ngày thanh toán:</span>{" "}
                        {new Date(rental.isPaidAt).toLocaleDateString("vi-VN")}
                      </p>
                    )}

                    {isPaid && (
                      <div className="flex justify-end mt-4">
                        <button
                          className="bg-gray-400 text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold py-1 sm:py-2 px-3 sm:px-4 md:px-6 rounded-lg cursor-not-allowed"
                          disabled
                        >
                          Đã thanh toán
                        </button>
                        <button
                          onClick={() => {
                            toggleDropdown(rental.id);
                            if (!expandedRentals.has(rental.id)) {
                              fetchRentalDetails(rental);
                            }
                          }}
                          className={`ml-2 text-sm sm:text-base md:text-lg lg:text-xl font-semibold py-1 sm:py-2 px-3 sm:px-4 md:px-6 rounded-lg transition-all duration-300 ${
                            theme === "light"
                              ? "bg-blue-500 hover:bg-blue-600 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {expandedRentals.has(rental.id)
                            ? "Ẩn chi tiết"
                            : "Xem chi tiết"}
                        </button>
                      </div>
                    )}

                    {/* Dropdown content cho rental form đã thanh toán */}
                    {isPaid && expandedRentals.has(rental.id) && (
                      <div
                        className={`mt-4 p-4 rounded-lg transition-all duration-300 ${
                          theme === "light" ? "bg-gray-50" : "bg-gray-700"
                        }`}
                      >
                        <h4
                          className={`text-lg sm:text-2xl font-semibold mb-3 ${
                            theme === "light"
                              ? "text-gray-800"
                              : "text-gray-200"
                          }`}
                        >
                          Chi tiết thanh toán
                        </h4>

                        {/* Thông tin Rental Form */}

                        {/* Thông tin Hóa đơn */}
                        {invoiceDetails[rental.id] && (
                          <div>
                            <h5
                              className={`text-base sm:text-xl font-medium mb-2 ${
                                theme === "light"
                                  ? "text-gray-700"
                                  : "text-gray-300"
                              }`}
                            >
                              🧾 Hóa đơn thanh toán
                            </h5>
                            <div
                              className={`p-3 rounded border ${
                                theme === "light"
                                  ? "bg-white border-gray-200"
                                  : "bg-gray-800 border-gray-600"
                              }`}
                            >
                              <p
                                className={`text-sm sm:text-xl mb-1 ${
                                  theme === "light"
                                    ? "text-gray-600"
                                    : "text-gray-300"
                                }`}
                              >
                                <span className="font-medium">Mã hóa đơn:</span>{" "}
                                {invoiceDetails[rental.id].invoice.id}
                              </p>

                              {invoiceDetails[rental.id].invoiceDetail && (
                                <>
                                  <p
                                    className={`text-sm sm:text-xl mb-1 ${
                                      theme === "light"
                                        ? "text-gray-600"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    <span className="font-medium">
                                      Số ngày thuê:
                                    </span>{" "}
                                    {
                                      invoiceDetails[rental.id].invoiceDetail
                                        .numberOfRentalDays
                                    }
                                  </p>
                                  <p
                                    className={`text-sm sm:text-xl ${
                                      theme === "light"
                                        ? "text-gray-600"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    <span className="font-medium">
                                      Chi phí thuê:
                                    </span>{" "}
                                    {invoiceDetails[
                                      rental.id
                                    ].invoiceDetail.reservationCost?.toLocaleString(
                                      "vi-VN"
                                    )}{" "}
                                    VNĐ
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {!invoiceDetails[rental.id] && (
                          <p
                            className={`text-sm sm:text-base ${
                              theme === "light"
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            Đang tải thông tin chi tiết...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RentalHistory;
