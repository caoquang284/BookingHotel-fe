import type { ImageDto, ResponseImageDto } from '../../types';

const BASE_URL = 'http://localhost:9090/api/image';

export async function getImagesByRoomId(roomId: number): Promise<ResponseImageDto[]> {
    const response = await fetch(`${BASE_URL}/room/${roomId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch images for room ${roomId}: ${error}`);
    }

    return await response.json();
}

export async function uploadImage(file: File, roomId: number, impactorId: number, impactor: string): Promise<ResponseImageDto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId.toString());
    formData.append('impactorId', impactorId.toString());
    formData.append('impactor', impactor);

    const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to upload image: ${error}`);
    }

    return await response.json();
}

export async function createImage(data: ImageDto, impactorId: number, impactor: string): Promise<ResponseImageDto> {
    const response = await fetch(`${BASE_URL}/${impactorId}/${impactor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create image: ${error}`);
    }

    return await response.json();
}

export async function updateImage(id: number, data: ImageDto, impactorId: number, impactor: string): Promise<ResponseImageDto> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update image with id ${id}: ${error}`);
    }

    return await response.json();
}

export async function deleteImage(id: number, impactorId: number, impactor: string): Promise<string> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete image with id ${id}: ${error}`);
    }

    return await response.text();
}