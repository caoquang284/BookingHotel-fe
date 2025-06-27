import type { RentalFormDTO, ResponseRentalFormDTO, SearchRentalFormDTO } from '../../types';

const BASE_URL = 'http://localhost:8080/api/rental-form';

export async function getAllRentalForms(page: number = 0, size: number = 10): Promise<ResponseRentalFormDTO[]> {
    const response = await fetch(`${BASE_URL}/get-all-page?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to fetch rental forms: ' + error);
    }

    return await response.json();
}

export async function getAllRentalFormsNoPage(): Promise<ResponseRentalFormDTO[]> {
    const response = await fetch(`${BASE_URL}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to fetch rental forms: ' + error);
    }

    return await response.json();
}

export async function getRentalFormById(id: number): Promise<ResponseRentalFormDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch rental form with id ${id}: ` + error);
    }

    return await response.json();
}

export async function createRentalForm(data: RentalFormDTO, impactorId: number, impactor: string): Promise<ResponseRentalFormDTO> {
    const response = await fetch(`${BASE_URL}/${impactorId}/${impactor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to create rental form: ' + error);
    }

    return await response.json();
}

export async function updateRentalForm(id: number, data: RentalFormDTO, impactorId: number, impactor: string): Promise<ResponseRentalFormDTO> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update rental form with id ${id}: ` + error);
    }

    return await response.json();
}

export async function deleteRentalForm(id: number, impactorId: number, impactor: string): Promise<string> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete rental form with id ${id}: ` + error);
    }

    return await response.text();
}

export async function getGuestIdByRentalFormId(id: number): Promise<number[]> {
    const response = await fetch(`${BASE_URL}/${id}/guest-ids`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch guest IDs for rental form with id ${id}: ` + error);
    }

    return await response.json();
}

export async function searchRentalForms(data: SearchRentalFormDTO): Promise<ResponseRentalFormDTO[]> {
    const response = await fetch(`${BASE_URL}/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to search rental forms: ' + error);
    }

    return await response.json();
}

export async function searchUnpaidRentalForms(data: SearchRentalFormDTO): Promise<ResponseRentalFormDTO[]> {
    const response = await fetch(`${BASE_URL}/search-unpaid`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to search unpaid rental forms: ' + error);
    }

    return await response.json();
}

export async function countTotalRentalDaysByRentalFormId(id: number): Promise<number> {
    const response = await fetch(`${BASE_URL}/${id}/total-rental-days`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to count total rental days for rental form with id ${id}: ` + error);
    }

    return await response.json();
}

export async function countTotalAmountByRentalFormId(id: number): Promise<number> {
    const response = await fetch(`${BASE_URL}/${id}/total-cost`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to count total amount for rental form with id ${id}: ` + error);
    }

    return await response.json();
}