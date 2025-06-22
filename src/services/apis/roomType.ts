import type {
    RoomTypeDTO,
    ResponseRoomTypeDTO,
} from '../../types';

const BASE_URL = 'http://localhost:9090/api/room-type';

export async function getAllRoomTypes(): Promise<ResponseRoomTypeDTO[]> {
    const response = await fetch(`${BASE_URL}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to fetch room types: ' + error);
    }

    return await response.json();
}

export async function getRoomTypeById(id: number): Promise<ResponseRoomTypeDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch room type with id ${id}: ` + error);
    }

    return await response.json();
}

export async function createRoomType(data: RoomTypeDTO, impactorId: number, impactor: string): Promise<ResponseRoomTypeDTO> {
    const response = await fetch(`${BASE_URL}/${impactorId}/${impactor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to create room type: ' + error);
    }

    return await response.json();
}

export async function updateRoomType(id: number, data: RoomTypeDTO, impactorId: number, impactor: string): Promise<ResponseRoomTypeDTO> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update room type with id ${id}: ` + error);
    }

    return await response.json();
}

export async function deleteRoomType(id: number, impactorId: number, impactor: string): Promise<string> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete room type with id ${id}: ` + error);
    }

    return await response.text();
}