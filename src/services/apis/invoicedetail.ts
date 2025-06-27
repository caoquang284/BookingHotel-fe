import type { InvoiceDetailDTO, ResponseInvoiceDetailDTO } from '../../types';

const BASE_URL = 'http://localhost:8081/api/invoice-detail';

export async function getInvoiceDetail(id: number): Promise<ResponseInvoiceDetailDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch invoice detail with id ${id}: ` + error);
    }

    return await response.json();
}

export async function getAllInvoiceDetails(): Promise<ResponseInvoiceDetailDTO[]> {
    const response = await fetch(`${BASE_URL}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to fetch invoice details: ' + error);
    }

    return await response.json();
}

export async function getAllInvoiceDetailsPage(page: number = 0, size: number = 10): Promise<ResponseInvoiceDetailDTO[]> {
    const response = await fetch(`${BASE_URL}/page?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to fetch invoice details: ' + error);
    }

    return await response.json();
}

export async function createInvoiceDetail(
    data: InvoiceDetailDTO,
    impactorId: number,
    impactor: string
): Promise<ResponseInvoiceDetailDTO> {
    const response = await fetch(`${BASE_URL}/${impactorId}/${impactor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to create invoice detail: ' + error);
    }

    return await response.json();
}

export async function updateInvoiceDetail(
    id: number,
    data: InvoiceDetailDTO,
    impactorId: number,
    impactor: string
): Promise<ResponseInvoiceDetailDTO> {
    const response = await fetch(`${BASE_URL}/${id}/${impactorId}/${impactor}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update invoice detail with id ${id}: ` + error);
    }

    return await response.json();
}

export async function deleteInvoiceDetail(
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
        throw new Error(`Failed to delete invoice detail with id ${id}: ` + error);
    }

    return await response.text();
}

export async function createInvoiceDetailForInvoice(
    invoiceId: number,
    rentalFormIds: number[],
    impactorId: number,
    impactor: string
): Promise<ResponseInvoiceDetailDTO[]> {
    const response = await fetch(`${BASE_URL}/invoice/${invoiceId}/${impactorId}/${impactor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rentalFormIds),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to create invoice details for invoice: ' + error);
    }

    return await response.json();
}

export async function checkoutInvoiceDetail(
    invoiceId: number,
    rentalFormId: number,
    impactorId: number,
    impactor: string
): Promise<ResponseInvoiceDetailDTO> {
    const response = await fetch(`${BASE_URL}/checkout/${invoiceId}/${rentalFormId}/${impactorId}/${impactor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to checkout invoice detail: ' + error);
    }

    return await response.json();
}