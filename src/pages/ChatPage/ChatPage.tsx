import { useEffect, useRef, useState } from 'react';
import { useChatSocket } from '../../hooks/useChatSocket';
import { useAuthStore } from '../../store/useAuthStore';
import styles from './ChatPage.module.css';

export const ChatPage = () => {
    const user = useAuthStore((s) => s.user);
    const { messages, isConnected, sendMessage } = useChatSocket();
    const [draft, setDraft] = useState('');
    const listRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages.
    useEffect(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages.length]);

    if (!user) return null; // route guard normally prevents this

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = draft.trim();
        if (!trimmed) return;
        const ok = sendMessage({
            senderId: user.id,
            senderUsername: user.username,
            content: trimmed,
        });
        if (ok) setDraft('');
    };

    const formatTime = (iso?: string) => {
        if (!iso) return '';
        try {
            return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    return (
        <div className={styles.chatWrapper}>
            <header className={styles.chatHeader}>
                <h2>Equitas Chat</h2>
                <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    <span className={`${styles.statusDot} ${isConnected ? styles.online : ''}`} />
                    {isConnected ? 'Connected' : 'Connecting…'}
                </span>
            </header>

            <div className={styles.messageList} ref={listRef}>
                {messages.length === 0 ? (
                    <div className={styles.empty}>No messages yet — say hello 👋</div>
                ) : (
                    messages.map((m, i) => {
                        const mine = m.senderId === user.id;
                        return (
                            <div
                                key={m.id ?? `${m.senderId}-${m.timestamp}-${i}`}
                                className={`${styles.bubble} ${mine ? styles.bubbleMine : styles.bubbleTheirs}`}
                            >
                                <div className={styles.bubbleMeta}>
                                    {mine ? 'You' : m.senderUsername} · {formatTime(m.timestamp)}
                                </div>
                                {m.content}
                            </div>
                        );
                    })
                )}
            </div>

            <form className={styles.composer} onSubmit={handleSend}>
                <input
                    type="text"
                    placeholder={isConnected ? 'Type a message…' : 'Waiting for connection…'}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={!isConnected}
                    maxLength={500}
                />
                <button type="submit" className={styles.sendBtn} disabled={!isConnected || !draft.trim()}>
                    Send
                </button>
            </form>
        </div>
    );
};
