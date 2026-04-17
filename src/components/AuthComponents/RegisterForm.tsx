
import React, { useState } from 'react';
import styles from './AuthForm.module.css';
import logo_lightBrown from "../../assets/logo/logo_lightBrown.png";

interface RegisterProps {
    onRegister: () => void;
}

export const RegisterForm = ({ onRegister }: RegisterProps) => {
    const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        mobile: '',
        weight: '',
        skillLevel: 'Beginner',
        dob: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error when user types
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // --- INTUITIVE CHECKS ---
        const { fullName, mobile, weight, dob } = formData;

        // empty field check
        if (!fullName || !mobile || !weight || !dob) {
            setError('Please fill in all fields.');
            return;
        }

        //weight > 0
        if (Number(weight) <= 0) {
            setError('Weight must be a positive number.');
            return;
        }

        // mobile must be valid (10 digits) [cite: 94, 96]
        if (!/^\d{10}$/.test(mobile)) {
            setError('Mobile number must be exactly 10 digits.');
            return;
        }

        // DOB cannot be in the future
        const selectedDate = new Date(dob);
        const today = new Date();
        if (selectedDate > today) {
            setError('Date of Birth cannot be in the future.');
            return;
        }

        if (acceptedDisclaimer) {
            onRegister();
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
                        <label className={styles.label}>Full Name</label>
                        <input name="fullName" type="text" className={styles.input} onChange={handleChange} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Mobile No.</label>
                        <input name="mobile" type="text" className={styles.input} onChange={handleChange} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Weight (kg)</label>
                        <input name="weight" type="number" className={styles.input} onChange={handleChange} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Skill Level</label>
                        <select name="skillLevel" className={styles.select} onChange={handleChange}>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>
                    </div>
                </div>

                {/* --- ADDED DOB FIELD --- */}
                <div className={styles.centeredField}>
                    <label className={styles.label}>Date of Birth</label>
                    <input name="dob" type="date" className={styles.input} onChange={handleChange} />
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

                <button type="submit" className={styles.btnSubmit} disabled={!acceptedDisclaimer}>
                    Register
                </button>
            </form>
        </div>
    );
};