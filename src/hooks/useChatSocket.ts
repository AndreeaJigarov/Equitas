import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import type { ChatMessage } from '../api/chatApi';
import { fetchChatHistory } from '../api/chatApi';

const WS_URL = `${(import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/^http/, 'ws')}/ws`;

interface UseChatSocketResult {
    messages: ChatMessage[];
    isConnected: boolean;
    sendMessage: (msg: ChatMessage) => boolean;
}

/**
 * Connects to the Spring STOMP broker, hydrates with REST history,
 * subscribes to /topic/chat, and exposes a sender that publishes to /app/chat.send.
 */
export function useChatSocket(): UseChatSocketResult {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        let cancelled = false;

        // 1. Hydrate with persisted history first.
        fetchChatHistory(100)
            .then((history) => { if (!cancelled) setMessages(history); })
            .catch(() => { /* fresh chat, ignore */ });

        // 2. Open the live socket.
        const client = new Client({
            brokerURL: WS_URL,
            reconnectDelay: 3000,
            onConnect: () => {
                setIsConnected(true);
                client.subscribe('/topic/chat', (frame: IMessage) => {
                    try {
                        const msg = JSON.parse(frame.body) as ChatMessage;
                        setMessages((prev) => {
                            // Dedup: server-assigned id wins over optimistic copies.
                            if (msg.id && prev.some((m) => m.id === msg.id)) return prev;
                            return [...prev, msg];
                        });
                    } catch {
                        /* ignore malformed frame */
                    }
                });
            },
            onDisconnect: () => setIsConnected(false),
            onStompError: () => setIsConnected(false),
            onWebSocketClose: () => setIsConnected(false),
        });

        client.activate();
        clientRef.current = client;

        return () => {
            cancelled = true;
            client.deactivate().catch(() => { /* no-op */ });
            clientRef.current = null;
        };
    }, []);

    const sendMessage = useCallback((msg: ChatMessage): boolean => {
        const c = clientRef.current;
        if (!c || !c.connected) return false;
        c.publish({
            destination: '/app/chat.send',
            body: JSON.stringify(msg),
        });
        return true;
    }, []);

    return { messages, isConnected, sendMessage };
}
