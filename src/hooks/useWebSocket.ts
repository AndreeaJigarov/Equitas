import { useEffect, useRef } from 'react';
import { useHorseStore } from '../store/useHorseStore';
import { type Horse } from '../types/Horse';

//const WS_URL = 'http://localhost:8080/ws';

export function useWebSocket() {
    const sockRef = useRef<WebSocket | null>(null);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);



    function connect() {
        // SockJS fallback — folosim WebSocket raw via endpoint /ws/websocket
        const ws = new WebSocket(`ws://localhost:8080/ws/websocket`);
        sockRef.current = ws;

        ws.onopen = () => {
            // STOMP CONNECT frame
            ws.send('CONNECT\naccept-version:1.2\nheart-beat:0,0\n\n\0');
        };

        ws.onmessage = (event) => {
            const raw: string = event.data;

            // STOMP CONNECTED — subscribe la topic
            if (raw.startsWith('CONNECTED')) {
                ws.send('SUBSCRIBE\nid:sub-0\ndestination:/topic/horses\n\n\0');
                return;
            }

            // STOMP MESSAGE — parsăm body-ul
            if (raw.startsWith('MESSAGE')) {
                const parts = raw.split('\n\n');
                if (parts.length >= 2) {
                    try {
                        const body = parts[1].replace('\0', '');
                        const horse = JSON.parse(body) as Horse & { available?: boolean };
                        // Backend returnează 'available', mapăm la 'isAvailable'
                        const mapped: Horse = {
                            ...horse,
                            isAvailable: horse.available ?? horse.isAvailable,
                        };
                        useHorseStore.setState((state) => {
                            // Nu adăuga dacă ID-ul există deja
                            if (state.horses.some(h => h.id === mapped.id)) return state;
                            return { horses: [...state.horses, mapped] };
                        });
                    } catch {
                        // JSON parse error — ignorăm
                    }
                }
            }
        };

        ws.onerror = () => {
            ws.close();
        };

        ws.onclose = () => {
            // Reconectare după 3 secunde
            reconnectTimer.current = setTimeout(connect, 3000);
        };
    }

    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            sockRef.current?.close();
        };
    }, []);
}