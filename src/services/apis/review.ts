import type { ReviewDto, ResponseReviewDto } from '../../types';

const BASE_URL = 'http://localhost:9090/api/review';

export async function getReviewsByRoomId(roomId: number): Promise<ResponseReviewDto[]> {
    const response = await fetch(`${BASE_URL}/room/${roomId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch reviews for room ${roomId}: ${error}`);
    }

    return await response.json();
}

export async function getReviewsByGuestId(guestId: number): Promise<ResponseReviewDto[]> {
    const response = await fetch(`${BASE_URL}/guest/${guestId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch reviews for guest ${guestId}: ${error}`);
    }

    return await response.json();
}

export async function createReview(data: ReviewDto, impactorId: number, impactor: string): Promise<ResponseReviewDto> {
    const response = await fetch(`${BASE_URL}/${impactorId}/${impactor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create review: ${error}`);
    }

    return await response.json();
}

export async function updateReview(id: number, data: ReviewDto, impactorId: number, impactor: string): Promise<ResponseReviewDto> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update review with id ${id}: ${error}`);
    }

    return await response.json();
}

export async function deleteReview(id: number, impactorId: number, impactor: string): Promise<string> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete review with id ${id}: ${error}`);
    }

    return await response.text();
}