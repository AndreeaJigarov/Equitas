import React, { useState } from 'react';
import styles from './AuthForm.module.css';
import logo_lightBrown from "../../assets/logo/logo_lightBrown.png";
import { useAuthStore } from '../../store/useAuthStore';

interface LoginProps {
    onLogin: () => void; // Called after successful auth — parent handles redirect
}

export const LoginForm = ({ onLogin }: LoginProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const login = useAuthStore((s) => s.login);
    const isLoading = useAuthStore((s) => s.isLoading);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Username and Password are required.');
            return;
        }
        setError('');
        try {
            await login({ username, password });
            onLogin();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
    };

    return (
        <div className={styles.authContainer}>
            <form className={styles.authCard} onSubmit={handleSubmit}>
                <div className={styles.topBar}>
                    <h2 className={styles.authTitle}>Log In</h2>
                    <img src={logo_lightBrown} alt="Equitas Logo" className={styles.logoImage} />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Username</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setError(''); }}
                        placeholder="e.g. admin"
                        autoComplete="username"
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Password</label>
                    <input
                        type="password"
                        className={styles.input}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        autoComplete="current-password"
                    />
                </div>

                {error && <p className={styles.errorText}>{error}</p>}

                <button type="submit" className={styles.btnSubmit} disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
};
