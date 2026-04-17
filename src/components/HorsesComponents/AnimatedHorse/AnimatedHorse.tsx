/* components/HorsesComponents/AnimatedHorse/AnimatedHorse.tsx */
import styles from './AnimatedHorse.module.css';

export const AnimatedHorse = () => {
    return (
        <div className={styles.container}>
            <div className={styles.horseIcon}>🐴</div>
            <div className={styles.shadow}></div>
        </div>
    );
};