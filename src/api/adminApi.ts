import { authedFetch } from './httpClient';

const BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/api/admin`;

export interface AuditLog {
    id: string;
    userId: string | null;
    username: string | null;
    role: string;
    action: string;
    resource: string;
    details: string | null;
    success: boolean;
    timestamp: string;
}

export interface ObservationEntry {
    id: string;
    userId: string;
    username: string;
    rule: string;
    reason: string;
    detectedAt: string;
    resolved: boolean;
}

interface Paged<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export async function fetchAuditLogs(page = 0, size = 50): Promise<Paged<AuditLog>> {
    const res = await authedFetch(`${BASE_URL}/audit-logs?page=${page}&size=${size}`);
    if (!res.ok) throw new Error('Failed to load audit logs');
    return res.json();
}

export async function fetchObservationList(page = 0, size = 50): Promise<Paged<ObservationEntry>> {
    const res = await authedFetch(`${BASE_URL}/observation-list?page=${page}&size=${size}`);
    if (!res.ok) throw new Error('Failed to load observation list');
    return res.json();
}

export async function resolveObservation(id: string): Promise<void> {
    const res = await authedFetch(`${BASE_URL}/observation-list/${id}/resolve`, { method: 'POST' });
    if (!res.ok && res.status !== 404) throw new Error('Failed to resolve observation');
}
