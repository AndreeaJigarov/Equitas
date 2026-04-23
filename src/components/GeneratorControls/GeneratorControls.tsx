import { useState, useEffect } from 'react';

const API = 'http://localhost:8080/api/generator';

export const GeneratorControls = () => {
    const [running, setRunning] = useState(false);
    const [loading, setLoading] = useState(false);

    // La mount — verificăm statusul real de pe server
    useEffect(() => {
        fetch(`${API}/status`)
            .then(res => res.json())
            .then(data => setRunning(data.running))
            .catch(() => {});
    }, []);

    const start = async () => {
        setLoading(true);
        try {
            await fetch(`${API}/start`, { method: 'POST' });
            setRunning(true);
        } finally {
            setLoading(false);
        }
    };

    const stop = async () => {
        setLoading(true);
        try {
            await fetch(`${API}/stop`, { method: 'POST' });
            setRunning(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 1rem',
            background: 'var(--cream)',
            borderBottom: '1px solid var(--dark-earth)',
        }}>
            <span style={{
                fontSize: '0.8rem',
                color: 'var(--dark-earth)',
                fontFamily: 'var(--font-serif)',
            }}>
                Auto-generate:
            </span>

            {!running ? (
                <button
                    onClick={start}
                    disabled={loading}
                    style={{
                        background: '#5C6B4A',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '4px 16px',
                        fontSize: '0.8rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    ▶ Start
                </button>
            ) : (
                <button
                    onClick={stop}
                    disabled={loading}
                    style={{
                        background: '#8B5E3C',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '4px 16px',
                        fontSize: '0.8rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    ■ Stop
                </button>
            )}

            {running && (
                <span style={{
                    fontSize: '0.75rem',
                    color: '#5C6B4A',
                    animation: 'pulse 1.5s infinite',
                }}>
                    ● generating every 5s
                </span>
            )}
        </div>
    );
};