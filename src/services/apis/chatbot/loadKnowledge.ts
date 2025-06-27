import {
  buildBlocks,
  buildBookingConfirmationForms,
  buildFloors,
  buildGuests,
  buildInvoices,
  buildRooms,
  buildRoomTypes,
  buildRentalFormDetails
} from './knowledgeSectionBuilder'

export async function loadKnowledgeSections(guestId: number): Promise<Record<string, string>> {
  const knowledge: Record<string, string> = {};

  const safe = async (label: string, fn: () => Promise<string>) => {
    try {
      knowledge[label] = await fn();
    } catch (err) {
      console.warn(`❌ Không thể tải ${label}:`, err);
      knowledge[label] = `⚠️ Không thể tải dữ liệu ${label}: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`;
    }
  };

  await Promise.all([
    safe('blocks', buildBlocks),
    safe('booking', () => buildBookingConfirmationForms(guestId)),
    safe('floors', buildFloors),
    safe('guests', () => buildGuests(guestId)),
    safe('invoices', () => buildInvoices(guestId)),
    safe('rooms', buildRooms),
    safe('roomtypes', buildRoomTypes),
    safe('rentalFormDetails', () => buildRentalFormDetails(guestId)),
  ]);
  
  return knowledge;
}

export function getRelevantSections(question: string, knowledge: Record<string, string>): string {
  const q = question.toLowerCase();
  let relevant = '';

  if (q.includes('phòng') || q.includes('room')) relevant += knowledge.rooms || '';
  if (q.includes('tầng') || q.includes('block') || q.includes('floor')) relevant += knowledge.floors || '';
  if (q.includes('khách') || q.includes('guest')) relevant += knowledge.guests || '';
  if (q.includes('đặt phòng')) relevant += knowledge.booking || '';
  if (q.includes('hóa đơn') || q.includes('tiền')) relevant += knowledge.invoices || '';
  if (q.includes('chi tiết') || q.includes('rental detail')) relevant += knowledge.rentalFormDetails || '';
  if (q.includes('loại phòng') || q.includes('room type')) relevant += knowledge.roomtypes || '';
  if (q.includes('tòa') || q.includes('block')) relevant += knowledge.blocks || '';

  if (!relevant) relevant += knowledge.rooms || '';
  return relevant;
}