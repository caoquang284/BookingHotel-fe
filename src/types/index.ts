export interface Root<T> {
    _embedded: T[];
    page: Page;
}

export interface Page {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
}

export interface AccountDTO {
    username: string;
    password: string;
    userRoleId: number;
}

export interface ResponseAccountDto {
    id: number;
    username: string;
    password: string;
    userRoleId: number;
    userRoleName: string;
    userRolePermissionIds: number[];
    userRolePermissionNames: string[];
}

export interface LoginDTO {
    username: string;
    password: string;
}

export interface RefreshResultDTO {
    accessToken: string;
}

export interface RefreshTokenDTO {
    refreshToken: string;
}

export interface ResponseLoginDTO {
    accessToken: string;
    refreshToken: string;
    message: string;
}

export interface BlockDTO {
    name: string;
}

export interface ResponseBlockDTO {
    id: number;
    name: string;
    floorIds: number[];
    floorNames: string[];
}

export type BookingState = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export const BookingStates = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED',
} as const;

export interface BookingConfirmationFormDTO {
    bookingGuestId: number;
    bookingState: BookingState;
    roomId: number;
    bookingDate: string,
    rentalDays: number
}

export interface ResponseBookingConfirmationFormDTO {
    id: number;
    bookingState: BookingState;
    createdAt: string;
    guestName: string;
    guestEmail: string;
    guestPhoneNumber: string;
    guestId: number;
    guestIdentificationNumber: string;
    roomId: number;
    roomName: string;
    roomTypeName: string;
    bookingDate: string;
    rentalDays: number
}

export interface FloorDTO {
    name: string;
    blockId: number;
}

export interface ResponseFloorDTO {
    id: number;
    name: string;
    roomIds: number[];
    roomNames: string[];
    blockName: string;
    blockId: number;
}

export type Sex = 'MALE' | 'FEMALE' | 'OTHER';

export const Sexes = {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
    OTHER: 'OTHER',
} as const;


export interface GuestDTO {
    name: string;
    sex: Sex;
    age: number;
    identificationNumber: string;
    phoneNumber: string;
    email: string;
    accountId: number;
}

export interface ResponseGuestDTO {
    id: number;
    name: string;
    sex: Sex;
    age: number;
    identificationNumber: string;
    phoneNumber: string;
    email: string;
    invoiceIds: number[];
    invoiceCreatedDates: string[];
    rentalFormIds: number[];
    rentalFormCreatedDates: string[];
    rentalFormDetailIds: number[];
    bookingConfirmationFormIds: number[];
    bookingConfirmationFormCreatedDates: string[];
    bookingConfirmationFormRoomIds: string[];
    bookingConfirmationFormRoomNames: string[];
}

export interface SearchGuestDTO {
    id?: number;
    name?: string;
    phoneNumber?: string;
    identificationNumber?: string;
    email?: string;
    accountId?: number;
}

export type Action = 'CREATE' | 'UPDATE' | 'DELETE';

export const Actions = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
} as const;

export interface HistoryDTO {
    impactor: string;
    affectedObject: string;
    impactorId: number;
    affectedObjectId: number;
    action: Action;
    content: string;
}

export interface ResponseHistoryDTO {
    id: number;
    impactor: string;
    affectedObject: string;
    impactorId: number;
    affectedObjectId: number;
    action: Action;
    executeAt: string;
    content: string;
}

export interface InvoiceDTO {
    totalReservationCost: number;
    payingGuestId: number;
    staffId: number;
}

export interface ResponseInvoiceDTO {
    id: number;
    totalReservationCost: number;
    payingGuestName: string;
    payingGuestId: number;
    staffName: string;
    staffId: number;
    createdAt: string;
    invoiceDetailIds: number[];
    rentalFormIds: number[];
}

export interface InvoiceDetailDTO {
    numberOfRentalDays: number;
    invoiceId: number;
    reservationCost: number;
    rentalFormId: number;
}

export interface ResponseInvoiceDetailDTO {
    id: number;
    numberOfRentalDays: number;
    invoiceId: number;
    reservationCost: number;
    rentalFormId: number;
    roomId: number;
}

export interface PermissionDTO {
    name: string;
}

export interface ResponsePermissionDTO {
    id: number;
    name: string;
    userRoleIds: number[];
    userRoleNames: string[];
}

export interface PositionDTO {
    name: string;
    baseSalary: number;
}

export interface ResponsePositionDTO {
    id: number;
    name: string;
    baseSalary: number;
    staffIds: number[];
    staffNames: string[];
}

export interface RentalExtensionFormDTO {
    numberOfRentalDays: number;
    rentalFormId: number;
    staffId: number;
}

export interface ResponseRentalExtensionFormDTO {
    id: number;
    rentalFormId: number;
    rentalFormRoomName: string;
    numberOfRentalDays: number;
    staffId: number;
    staffName: string;
    dayRemains: number;
}

export interface RentalFormDTO {
    roomId: number;
    staffId: number;
    rentalDate: string;
    numberOfRentalDays: number;
    isPaidAt?: string;
    note?: string;
}

export interface ResponseRentalFormDTO {
    id: number;
    roomId: number;
    roomName: string;
    staffId: number;
    staffName: string;
    rentalDate: string;
    numberOfRentalDays: number;
    note?: string;
    createdAt: string;
    isPaidAt?: string;
    rentalFormDetailIds: number[];
    rentalExtensionFormIds: number[];
}

export interface SearchRentalFormDTO {
    roomId?: number;
    roomName?: string;
    rentalFormId?: number;
}

export interface RentalFormDetailDTO {
    rentalFormId: number;
    guestId: number;
}

export interface ResponseRentalFormDetailDTO {
    id: number;
    rentalFormId: number;
    guestId: number;
    guestName: string;
    guestPhoneNumber: string;
    guestEmail: string;
    guestIdentificationNumber: string;
}

export interface RevenueReportDTO {
    year: number;
    month: number;
    totalMonthRevenue?: number;
}

export interface ResponseRevenueReportDTO {
    id: number;
    year: number;
    month: number;
    totalMonthRevenue: number;
    revenueReportDetailIds: number[];
}

export interface RevenueReportDetailDTO {
    totalRoomRevenue: number;
    revenueReportId: number;
    roomTypeId: number;
}

export interface ResponseRevenueReportDetailDTO {
    id: number;
    totalRoomRevenue: number;
    revenueReportId: number;
    roomTypeId: number;
    roomTypeName: string;
}

export type RoomState = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

export const RoomStates = {
    AVAILABLE: 'AVAILABLE',
    OCCUPIED: 'OCCUPIED',
    MAINTENANCE: 'MAINTENANCE',
} as const;


export interface RoomDTO {
    name: string;
    note?: string;
    roomState: RoomState;
    roomTypeId: number;
    floorId: number;
}

export interface ResponseRoomDTO {
    id: number;
    name: string;
    note?: string;
    roomState: RoomState;
    roomTypeId: number;
    roomTypeName: string;
    floorId: number;
    floorName: string;
    bookingConfirmationFormIds: number[];
    rentalFormIds: number[];
}

export interface RoomTypeDTO {
    name: string;
    price: number;
}

export interface ResponseRoomTypeDTO {
    id: number;
    name: string;
    price: number;
    roomIds: number[];
    revenueReportDetailIds: number[];
}

export interface StaffDTO {
    fullName: string;
    age: number;
    identificationNumber: string;
    address: string;
    sex: Sex;
    salaryMultiplier: number;
    positionId: number;
    accountId?: number;
}

export interface ResponseStaffDTO {
    id: number;
    fullName: string;
    age: number;
    identificationNumber: string;
    address: string;
    sex: Sex;
    salaryMultiplier: number;
    positionId: number;
    positionName: string;
    accountId: number;
    accountUsername: string;
    invoiceIds: number[];
    rentalExtensionFormIds: number[];
    rentalFormIds: number[];
}

export interface UserRoleDTO {
    name: string;
}

export interface ResponseUserRoleDTO {
    id: number;
    name: string;
    accountIds: number[];
    accountUsernames: string[];
    permissionIds: number[];
    permissionNames: string[];
}

export interface UserRolePermissionDTO {
    userRoleId: number;
    permissionId: number;
}

export interface ResponseUserRolePermissionDTO {
    userRoleId: number;
    userRoleName: string;
    permissionId: number;
    permissionName: string;
}

export interface VariableDTO {
    name: string;
    value: number;
    description?: string;
}

export interface ResponseVariableDTO {
    id: number;
    name: string;
    value: number;
    description?: string;
}

export interface RegisterGuestDTO {
  name: string;
  sex: Sex;
  age: number;
  identificationNumber: string;
  phoneNumber: string;
  email: string;
  account: AccountDTO;
}

export interface DuplicateCheckDTO {
  identificationNumber: string;
  phoneNumber: string;
  email: string;
}

export interface DuplicateCheckResponse {
  isDuplicate: boolean;
  fields: string[];
}