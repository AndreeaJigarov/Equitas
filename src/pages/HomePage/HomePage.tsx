import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import logo_White from '../../assets/logo/logo_White.png';

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.topBar}>
          <img src={logo_White} alt="Equitas Logo" className={styles.logoImage} />
          <span className={styles.topLink}>← back to site</span>
        </div>


        <div className={styles.logoWrap}>
          <div className={styles.logoText}>Equitas</div>
        </div>

        <h1 className={styles.tagline}>
          Precision and care for<br></br>
          every horse, every ride
        </h1>

        <div className={styles.ctaRow}>
          <button 
            className={styles.btnPrimary}
            onClick={() => navigate('/horses')}
          >
            View Horses
          </button>
        </div>

        <p className={styles.description}>
          Seamlessly organize training sessions, track horse health and performance, 
          and manage event participation in one integrated environment.
        </p>
      </section>
    </div>
  );
};