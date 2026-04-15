import React, { useState } from 'react';
import styles from './AuthForm.module.css';
import logo_lightBrown from "../../assets/logo/logo_lightBrown.png";

interface RegisterProps {
    onRegister: () => void;
}

export const RegisterForm = ({ onRegister }: RegisterProps) => {
    const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (acceptedDisclaimer) {
            onRegister(); // Trigger the redirect to login
        }
    };

    return (
        <div className={styles.authContainer}>
            <form className={styles.authCard} onSubmit={handleSubmit} >
                <div className={styles.topBar}>
                    <h2 className={styles.authTitle}>Register</h2>
                    <img src={logo_lightBrown} alt="Equitas Logo" className={styles.logoImage} />
                </div>
                <br></br>
                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label className={styles.label}>Full Name</label>
                        <input type="text" className={styles.input} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Mobile No.</label>
                        <input type="text" className={styles.input} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Weight (kg)</label>
                        <input type="number" className={styles.input} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Skill Level</label>
                        <select className={styles.select}>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>
                    </div>
                </div>

                <div className={styles.disclaimerBox}>
                    <label className={styles.checkItem}>
                        <input
                            type="checkbox"
                            checked={acceptedDisclaimer}
                            onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                        />
                        <span>I accept the 15-20% horse weight rule </span>
                    </label>
                </div>

                <button
                    type="submit"
                    className={styles.btnSubmit}
                    disabled={!acceptedDisclaimer}
                >
                    Register
                </button>
            </form>
        </div>
    );
};