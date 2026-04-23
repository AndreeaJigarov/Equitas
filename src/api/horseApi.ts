import { type Horse, type HorseFormData } from '../types/Horse';

const BASE_URL = 'http://localhost:8080/api/horses';

export interface PagedResponse {
    content: Horse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

// Fetch all horses (all pages) pentru a popula store-ul complet
export async function fetchAllHorses(): Promise<Horse[]> {
    const firstPage = await fetchHorsesPage(0, 100);
    return firstPage.content;
}

export async function fetchHorsesPage(page: number, size: number = 6): Promise<PagedResponse> {
    const res = await fetch(`${BASE_URL}?page=${page}&size=${size}`);
    if (!res.ok) throw new Error('Failed to fetch horses');
    const data = await res.json();
    // Backend returnează 'available', frontend folosește 'isAvailable' — mapăm
    return {
        ...data,
        content: data.content.map(mapFromBackend),
    };
}

export async function fetchHorseById(id: string): Promise<Horse> {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) throw new Error(`Horse ${id} not found`);
    return mapFromBackend(await res.json());
}

export async function createHorse(data: HorseFormData): Promise<Horse> {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapToBackend(data)),
    });
    if (!res.ok) throw new Error('Failed to create horse');
    return mapFromBackend(await res.json());
}

export async function updateHorse(id: string, data: HorseFormData): Promise<Horse> {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapToBackend(data)),
    });
    if (!res.ok) throw new Error('Failed to update horse');
    return mapFromBackend(await res.json());
}

export async function deleteHorse(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete horse');
}

// Backend folosește 'available', frontend folosește 'isAvailable'
function mapFromBackend(raw: Record<string, unknown>): Horse {
    return {
        id: raw.id as string,
        name: raw.name as string,
        breed: raw.breed as string,
        difficulty: raw.difficulty as Horse['difficulty'],
        weight: raw.weight as number,
        dateOfBirth: raw.dateOfBirth as string,
        about: raw.about as string,
        inTraining: raw.inTraining as boolean,
        recommendedFor: raw.recommendedFor as Horse['recommendedFor'],
        isAvailable: (raw.available ?? raw.isAvailable) as boolean,
    };
}

function mapToBackend(data: HorseFormData): Record<string, unknown> {
    return {
        name: data.name,
        breed: data.breed,
        difficulty: data.difficulty,
        weight: data.weight,
        dateOfBirth: data.dateOfBirth,
        about: data.about,
        inTraining: data.inTraining,
        recommendedFor: data.recommendedFor,
        isAvailable: data.isAvailable,
    };
}