import type {
    ResponseInvoiceDTO
} from '../../types/index'

const BASE_URL = 'http://localhost:8081/api/invoice';

export async function getAllInvoicesByUserId(id: number): Promise<ResponseInvoiceDTO[]> {
    const response = await fetch(`${BASE_URL}/user-id/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get invoices with user id ${id}: ${error}`);
    }

    return await response.json();
} 