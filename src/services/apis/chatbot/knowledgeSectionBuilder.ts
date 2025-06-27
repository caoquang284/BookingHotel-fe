import type {
  ResponseBlockDTO,
  ResponseFloorDTO,
  ResponseGuestDTO,
  ResponseRoomDTO,
  ResponseRoomTypeDTO,
  ResponseInvoiceDTO,
  ResponseBookingConfirmationFormDTO,
  ResponseRentalFormDetailDTO
} from '../../../types/index';

import {
  getAllBlocks
} from '../block'

import {
   getBookingConfirmationFormsByUserId
} from '../bookingconfirm'

import {
  getAllFloors
} from '../floor'

import {
  getGuestByAccountId
} from '../guest'

import {
  getAllInvoicesByUserId
} from '../invoice'

import {
  getAllRoomTypes
} from '../roomType'

import {
  getAllRentalFormDetailsByUserId
} from '../rentalFormDetail'

import {
  getAllRooms
} from '../room'

export async function buildBlocks(): Promise<string> {
  const list: ResponseBlockDTO[] = await getAllBlocks();
  let kb = `# Danh sách tòa
- Có ${list.length} tòa
`;
  for (const b of list) {
    kb += `  * ID: ${b.id}, Tên: ${b.name}, Số tầng: ${b.floorIds?.length || 0}, Tên tầng: ${b.floorNames?.join(', ') || 'Không có'}\n`;
  }
  return kb + '\n';
}

export async function buildFloors(): Promise<string> {
  const list: ResponseFloorDTO[] = await getAllFloors();
  let kb = `# Danh sách tầng
- Tổng số tầng: ${list.length}
`;
  for (const f of list) {
    kb += `  * ID: ${f.id}, Tên: ${f.name}, Tòa: ${f.blockName} (ID: ${f.blockId})\n`;
    kb += `    - Số phòng: ${f.roomIds?.length || 0}, Tên phòng: ${f.roomNames?.join(', ') || 'Không có'}\n`;
  }
  return kb + '\n';
}

export async function buildGuests(accountId: number): Promise<string> {
  const guest: ResponseGuestDTO = await getGuestByAccountId(accountId);
  let kb = `# Khách hàng
`;
  kb += `  * ID: ${guest.id}, Tên: ${guest.name}, Giới tính: ${guest.sex}, Tuổi: ${guest.age}, CCCD: ${guest.identificationNumber}, SĐT: ${guest.phoneNumber}, Email: ${guest.email}\n`;
  kb += `    - Số phiếu thuê: ${guest.rentalFormIds?.length || 0}, Hóa đơn: ${guest.invoiceIds?.length || 0}, Phiếu đặt phòng: ${guest.bookingConfirmationFormIds?.length || 0}\n`;
  return kb + '\n';
}

export async function buildRoomTypes(): Promise<string> {
  const list: ResponseRoomTypeDTO[] = await getAllRoomTypes();
  let kb = `# Loại phòng\n- Số loại phòng: ${list.length}\n`;
  for (const rt of list) {
    kb += `  * ID: ${rt.id}, Tên: ${rt.name}, Giá: ${rt.price} VND\n`;
    kb += `    - Số phòng: ${rt.roomIds?.length || 0}, Báo cáo: ${rt.revenueReportDetailIds?.length || 0}\n`;
  }
  return kb + '\n';
}

export async function buildInvoices(userId: number): Promise<string> {
  const list: ResponseInvoiceDTO[] = await getAllInvoicesByUserId(userId);
  const total = list.reduce((sum, i) => sum + (i.totalReservationCost || 0), 0);
  let kb = `# Hóa đơn\n- Số lượng hóa đơn: ${list.length}, Tổng tiền: ${total.toLocaleString('vi-VN')} VND\n`;
  for (const i of list) {
    kb += `  * ID: ${i.id}, Tổng tiền: ${i.totalReservationCost.toLocaleString('vi-VN')} VND, Khách: ${i.payingGuestName}, Ngày tạo: ${i.createdAt}\n`;
  }
  return kb + '\n';
}

export async function buildBookingConfirmationForms(userId: number): Promise<string> {
  const list: ResponseBookingConfirmationFormDTO[] = await getBookingConfirmationFormsByUserId(userId);
  let kb = `# Phiếu xác nhận đặt phòng\n- Tổng phiếu: ${list.length}\n`;
  for (const dto of list) {
    kb += `  * ID: ${dto.id}, Trạng thái: ${dto.bookingState}, Ngày tạo: ${dto.createdAt}, Ngày đặt: ${dto.bookingDate}, Số ngày thuê: ${dto.rentalDays}\n`;
    kb += `    Khách: ${dto.guestName} (ID: ${dto.guestId}), Email: ${dto.guestEmail}, SĐT: ${dto.guestPhoneNumber}, CCCD: ${dto.guestIdentificationNumber}\n`;
    kb += `    Phòng: ${dto.roomName} (ID: ${dto.roomId}), Loại phòng: ${dto.roomTypeName}\n`;
  }
  return kb + '\n';
}

export async function buildRentalFormDetails(userId: number): Promise<string> {
  const list: ResponseRentalFormDetailDTO[] = await getAllRentalFormDetailsByUserId(userId);
  let kb = `# Phiếu thuê phòng\n- Số lượng phiếu: ${list.length}\n`;
  for (const dto of list) {
    kb += `  * ID: ${dto.id}\n`;
  }
  return kb + '\n';
}

export async function buildRooms(): Promise<string> {
  const rooms: ResponseRoomDTO[] = await getAllRooms();
  const roomTypeCount: Record<string, number> = {};
  const roomStateCount: Record<string, number> = {};

  for (const r of rooms) {
    roomTypeCount[r.roomTypeName] = (roomTypeCount[r.roomTypeName] || 0) + 1;
    roomStateCount[r.roomState] = (roomStateCount[r.roomState] || 0) + 1;
  }

  let kb = `# Danh sách phòng\n- Tổng số phòng: ${rooms.length}\n`;
  kb += '- Số lượng theo loại phòng:\n';
  for (const [type, count] of Object.entries(roomTypeCount)) {
    kb += `  * ${type}: ${count} phòng\n`;
  }

  kb += '- Số lượng theo trạng thái phòng:\n';
  for (const [state, count] of Object.entries(roomStateCount)) {
    kb += `  * ${state}: ${count} phòng\n`;
  }

  for (const r of rooms) {
    kb += `  * ID: ${r.id}, Tên: ${r.name}, Trạng thái: ${r.roomState}, Ghi chú: ${r.note}, Loại phòng: ${r.roomTypeName} (ID: ${r.roomTypeId}), Tầng: ${r.floorName} (ID: ${r.floorId})\n`;
    kb += `    - Số phiếu đặt phòng: ${r.bookingConfirmationFormIds?.length || 0}, Số phiếu thuê: ${r.rentalFormIds?.length || 0}\n`;
  }

  return kb + '\n';
}

