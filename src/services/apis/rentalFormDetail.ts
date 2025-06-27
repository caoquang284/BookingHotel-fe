import type {
    ResponseRentalFormDetailDTO
} from '../../types/index'

const BASE_URL = 'http://localhost:8081/api/rental-form-detail';

export async function getAllRentalFormDetailsByUserId(id: number): Promise<ResponseRentalFormDetailDTO[]> {
    const response=await fetch(`${BASE_URL}/user-id/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch accounts: ${error}`);
    }
    return await response.json();
}