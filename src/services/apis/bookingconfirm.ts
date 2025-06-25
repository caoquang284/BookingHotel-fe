import type {
    BookingConfirmationFormDTO,
    ResponseBookingConfirmationFormDTO,
    PaginatedResponseDTO,
} from '../../types';   

const BASE_URL = 'http://localhost:8081/api/booking-confirmation-form';

export async function getBookingConfirmationFormById(id: number): Promise<ResponseBookingConfirmationFormDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch booking confirmation form with id ${id}: ${error}`);
    }

    return await response.json();
}

export async function getAllBookingConfirmationFormsPage(page: number = 0, size: number = 10): Promise<ResponseBookingConfirmationFormDTO[]> {
    const response = await fetch(`${BASE_URL}/get-all-page?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch booking confirmation forms: ${error}`);
    }

    const data: PaginatedResponseDTO<ResponseBookingConfirmationFormDTO> = await response.json();
    return data._embedded;
}

export async function getAllBookingConfirmationForms(): Promise<ResponseBookingConfirmationFormDTO[]> {
    const response = await fetch(`${BASE_URL}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch booking confirmation forms: ${error}`);
    }

    return await response.json();
}

export async function getBookingConfirmationFormsByListId(ids: number[]): Promise<ResponseBookingConfirmationFormDTO[]> {
    const idList = ids.join(',');
    const response = await fetch(`${BASE_URL}/list-id/${idList}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch booking confirmation forms with ids ${idList}: ${error}`);
    }

    return await response.json();
}

export async function createBookingConfirmationForm(data: BookingConfirmationFormDTO, impactorId: number, impactor: string): Promise<ResponseBookingConfirmationFormDTO> {
    const response = await fetch(`${BASE_URL}/${impactorId}/${impactor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create booking confirmation form: ${error}`);
    }

    return await response.json();
}

export async function updateBookingConfirmationForm(id: number, data: BookingConfirmationFormDTO, impactorId: number, impactor: string): Promise<ResponseBookingConfirmationFormDTO> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update booking confirmation form with id ${id}: ${error}`);
    }

    return await response.json();
}

export async function deleteBookingConfirmationForm(id: number, impactorId: number, impactor: string): Promise<string> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete booking confirmation form with id ${id}: ${error}`);
    }

    return await response.text();
}