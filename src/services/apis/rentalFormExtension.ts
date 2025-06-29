import type { RentalExtensionFormDTO, ResponseRentalExtensionFormDTO } from '../../types';

const BASE_URL = 'http://localhost:8081/api/rental-extension-form';



export async function getAllRentalExtensionFormsList(): Promise<ResponseRentalExtensionFormDTO[]> {
    const response = await fetch(`${BASE_URL}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch all rental extension forms: ${error}`);
    }

    return await response.json();
}

export async function getRentalExtensionFormById(id: number): Promise<ResponseRentalExtensionFormDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch rental extension form with id ${id}: ${error}`);
    }

    return await response.json();
}

export async function createRentalExtensionForm(
    data: RentalExtensionFormDTO,
    impactorId: number,
    impactor: string
): Promise<ResponseRentalExtensionFormDTO> {
    const response = await fetch(`${BASE_URL}/${impactorId}/${impactor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create rental extension form: ${error}`);
    }

    return await response.json();
}

export async function updateRentalExtensionForm(
    id: number,
    data: RentalExtensionFormDTO,
    impactorId: number,
    impactor: string
): Promise<ResponseRentalExtensionFormDTO> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update rental extension form with id ${id}: ${error}`);
    }

    return await response.json();
}

export async function deleteRentalExtensionForm(id: number, impactorId: number, impactor: string): Promise<string> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete rental extension form with id ${id}: ${error}`);
    }

    return await response.text();
}

export async function getDayRemains(rentalFormId: number): Promise<number> {
    const response = await fetch(`${BASE_URL}/day-remains/${rentalFormId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch day remains for rental form ${rentalFormId}: ${error}`);
    }

    return await response.json();
}

export async function getRentalExtensionFormsByRentalFormId(rentalFormId: number): Promise<ResponseRentalExtensionFormDTO[]> {
    const response = await fetch(`${BASE_URL}/rental-form/${rentalFormId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch rental extension forms for rental form ${rentalFormId}: ${error}`);
    }

    return await response.json();
}