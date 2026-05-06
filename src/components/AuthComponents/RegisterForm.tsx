import React, { useState } from 'react';
import styles from './AuthForm.module.css';
import logo_lightBrown from "../../assets/logo/logo_lightBrown.png";
import { useAuthStore } from '../../store/useAuthStore';

interface RegisterProps {
    onRegister: () => void;
}

export const RegisterForm = ({ onRegister }: RegisterProps) => {
    const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');

    const register = useAuthStore((s) => s.register);
    const isLoading = useAuthStore((s) => s.isLoading);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { username, email, password, confirmPassword } = formData;

        if (!username || !email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        if (username.length < 3) {
            setError('Username must be at least 3 characters.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!acceptedDisclaimer) return;

        try {
            await register({ username, email, password });
            onRegister();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        }
    };

    return (
        <div className={styles.authContainer}>
            <form className={styles.authCard} onSubmit={handleSubmit}>
                <div className={styles.topBar}>
                    <h2 className={styles.authTitle}>Register</h2>
                    <img src={logo_lightBrown} alt="Equitas Logo" className={styles.logoImage} />
                </div>

                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label className={styles.label}>Username</label>
                        <input name="username" type="text" className={styles.input}
                               value={formData.username} onChange={handleChange}
                               autoComplete="username" />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Email</label>
                        <input name="email" type="email" className={styles.input}
                               value={formData.email} onChange={handleChange}
                               autoComplete="email" />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Password</label>
                        <input name="password" type="password" className={styles.input}
                               value={formData.password} onChange={handleChange}
                               autoComplete="new-password" />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Confirm Password</label>
                        <input name="confirmPassword" type="password" className={styles.input}
                               value={formData.confirmPassword} onChange={handleChange}
                               autoComplete="new-password" />
                    </div>
                </div>

                {error && <p className={styles.errorText}>{error}</p>}

                <div className={styles.disclaimerBox}>
                    <label className={styles.checkItem}>
                        <input
                            type="checkbox"
                            checked={acceptedDisclaimer}
                            onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                        />
                        <span>I accept the 15-20% horse weight rule</span>
                    </label>
                </div>

                <button type="submit" className={styles.btnSubmit}
                        disabled={!acceptedDisclaimer || isLoading}>
                    {isLoading ? 'Creating account...' : 'Register'}
                </button>
            </form>
        </div>
    );
};
