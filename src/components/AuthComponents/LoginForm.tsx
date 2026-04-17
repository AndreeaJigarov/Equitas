import React, { useState } from 'react';
import styles from './AuthForm.module.css';
import logo_lightBrown from "../../assets/logo/logo_lightBrown.png";

interface LoginProps {
    onLogin: () => void; // Added prop for redirection
}

export const LoginForm = ({ onLogin }: LoginProps) => {
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!mobile || !password) {
            setError('Mobile and Password are required.');
            return;
        }
        if (!/^\d{10}$/.test(mobile)) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }
        onLogin();
    };

    return (
        <div className={styles.authContainer}>
            <form className={styles.authCard} onSubmit={handleSubmit}>
                <div className={styles.topBar}>
                    <h2 className={styles.authTitle}>Log In</h2>
                    <img src={logo_lightBrown} alt="Equitas Logo" className={styles.logoImage} />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Mobile Number</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={mobile}
                        onChange={(e) => {setMobile(e.target.value); setError('');}}
                        placeholder="e.g. 07xxxxxxxx"
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Password</label>
                    <input
                        type="password"
                        className={styles.input}
                        value={password}
                        onChange={(e) => {setPassword(e.target.value); setError('');}}
                    />
                </div>

                {error && <p className={styles.errorText}>{error}</p>}

                <button type="submit" className={styles.btnSubmit}>Sign In</button>
            </form>
        </div>
    );
};