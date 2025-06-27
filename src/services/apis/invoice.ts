import type { InvoiceDTO, ResponseInvoiceDTO } from '../../types';

const BASE_URL = 'http://localhost:8081/api/invoice';

export async function getInvoice(id: number): Promise<ResponseInvoiceDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch invoice with id ${id}: ` + error);
    }

    return await response.json();
}

export async function getAllInvoices(page: number = 0, size: number = 10): Promise<ResponseInvoiceDTO[]> {
    const response = await fetch(`${BASE_URL}/get-all-page?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to fetch invoices: ' + error);
    }

    return await response.json();
}

export async function getAllInvoicesNoPage(): Promise<ResponseInvoiceDTO[]> {
    const response = await fetch(`${BASE_URL}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to fetch invoices: ' + error);
    }

    return await response.json();
}

export async function createInvoice(
    data: InvoiceDTO,
    impactorId: number,
    impactor: string
): Promise<ResponseInvoiceDTO> {
    const response = await fetch(`${BASE_URL}/${impactorId}/${impactor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to create invoice: ' + error);
    }

    return await response.json();
}

export async function updateInvoice(
    id: number,
    data: InvoiceDTO,
    impactorId: number,
    impactor: string
): Promise<ResponseInvoiceDTO> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update invoice with id ${id}: ` + error);
    }

    return await response.json();
}

export async function deleteInvoice(
    id: number,
    impactorId: number,
    impactor: string
): Promise<string> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete invoice with id ${id}: ` + error);
    }

    return await response.text();
}

export async function reCalculateInvoice(
    id: number,
    impactorId: number,
    impactor: string
): Promise<ResponseInvoiceDTO> {
    const response = await fetch(`${BASE_URL}/re-calculate/${id}/${impactorId}/${impactor}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to recalculate invoice with id ${id}: ` + error);
    }

    return await response.json();
}

export async function getInvoicesByUserId(userId: number): Promise<ResponseInvoiceDTO[]> {
    const response = await fetch(`${BASE_URL}/user-id/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch invoices for user id ${userId}: ` + error);
    }

    return await response.json();
}