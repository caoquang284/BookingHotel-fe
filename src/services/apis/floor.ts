import type {
    FloorDTO,
    ResponseFloorDTO,
} from '../../types';

const BASE_URL = 'http://localhost:9090/api/floor';

export async function getAllFloors(): Promise<ResponseFloorDTO[]> {
    const response = await fetch(`${BASE_URL}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to fetch floors: ' + error);
    }

    return await response.json();
}

export async function getFloorById(id: number): Promise<ResponseFloorDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch floor with id ${id}: ` + error);
    }

    return await response.json();
}

export async function createFloor(data: FloorDTO, impactorId: number, impactor: string): Promise<ResponseFloorDTO> {
    const response = await fetch(`${BASE_URL}/${impactorId}/${impactor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to create floor: ' + error);
    }

    return await response.json();
}

export async function updateFloor(id: number, data: FloorDTO, impactorId: number, impactor: string): Promise<ResponseFloorDTO> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update floor with id ${id}: ` + error);
    }

    return await response.json();
}

export async function deleteFloor(id: number, impactorId: number, impactor: string): Promise<string> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete floor with id ${id}: ` + error);
    }

    return await response.text();
}