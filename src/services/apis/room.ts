import type {
    RoomDTO,
    ResponseRoomDTO,
    RoomState,
} from '../../types';

const BASE_URL = 'http://localhost:9090/api/room';

export async function getAllRooms(): Promise<ResponseRoomDTO[]> {
    const response = await fetch(`${BASE_URL}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to fetch rooms: ' + error);
    }

    return await response.json();
}

export async function getRoomById(id: number): Promise<ResponseRoomDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch room with id ${id}: ` + error);
    }

    return await response.json();
}

export async function getRoomsByState(roomState: RoomState, page: number = 0, size: number = 10): Promise<ResponseRoomDTO[]> {
    const response = await fetch(`${BASE_URL}/state/${roomState}?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch rooms with state ${roomState}: ` + error);
    }

    return await response.json();
}

export async function getRoomsByListState(roomStateList: RoomState[], page: number = 0, size: number = 10): Promise<ResponseRoomDTO[]> {
    const stateList = roomStateList.join(',');
    const response = await fetch(`${BASE_URL}/list-state/${stateList}?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch rooms with states ${stateList}: ` + error);
    }

    return await response.json();
}

export async function getReadyToServeRooms(page: number = 0, size: number = 10): Promise<ResponseRoomDTO[]> {
    const response = await fetch(`${BASE_URL}/state/READY_TO_SERVE?page=${page}&size=${size}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch READY_TO_SERVE rooms: ${error}`);
    }

    return await response.json();
}

export async function createRoom(data: RoomDTO, impactorId: number, impactor: string): Promise<ResponseRoomDTO> {
    const response = await fetch(`${BASE_URL}/${impactorId}/${impactor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to create room: ' + error);
    }

    return await response.json();
}

export async function updateRoom(id: number, data: RoomDTO, impactorId: number, impactor: string): Promise<ResponseRoomDTO> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update room with id ${id}: ` + error);
    }

    return await response.json();
}

export async function deleteRoom(id: number, impactorId: number, impactor: string): Promise<string> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete room with id ${id}: ` + error);
    }

    return await response.text();
}