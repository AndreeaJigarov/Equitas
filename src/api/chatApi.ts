import { authedFetch } from './httpClient';

const BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/api/chat`;

export interface ChatMessage {
    id?: string;
    senderId: string;
    senderUsername: string;
    content: string;
    timestamp?: string; // ISO string from backend
}

export async function fetchChatHistory(limit: number = 100): Promise<ChatMessage[]> {
    const res = await authedFetch(`${BASE_URL}/history?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to load chat history');
    return res.json();
}
