import type {
    GuestDTO,
    ResponseGuestDTO,
    SearchGuestDTO,
} from "../../types";

const BASE_URL = 'http://localhost:9090/api/guest';

export async function getGuestById(id: number): Promise<ResponseGuestDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch guest with id ${id}: ${error}`);
    }

    return await response.json();
}



export async function getGuestByAccountId(id: number): Promise<ResponseGuestDTO> {
    const response = await fetch(`${BASE_URL}/account-id/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch guest with account id ${id}: ${error}`);
    }

    return await response.json();
}

export async function createGuest(data: GuestDTO): Promise<ResponseGuestDTO> {
    const response = await fetch(`${BASE_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create guest: ${error}`);
    }

    return await response.json();
}

export async function updateGuest(id: number, data: GuestDTO): Promise<ResponseGuestDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update guest with id ${id}: ${error}`);
    }

    return await response.json();
}

