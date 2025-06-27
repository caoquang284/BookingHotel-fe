import type {
    ResponseRentalFormDetailDTO,
    RentalFormDetailDTO
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

export async function createRentalFormDetail(
    data: RentalFormDetailDTO,
    impactorId: number,
    impactor: string
): Promise<ResponseRentalFormDetailDTO> {
    const response = await fetch(`${BASE_URL}/${impactorId}/${impactor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to create rental form detail: ' + error);
    }

    return await response.json();
}