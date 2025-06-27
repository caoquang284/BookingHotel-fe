import type {
    ResponseBlockDTO
} from '../../types/index'

const BASE_URL = 'http://localhost:8081/api/block';

export async function getAllBlocks(): Promise<ResponseBlockDTO[]> {
    const response=await fetch(`${BASE_URL}`, {
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