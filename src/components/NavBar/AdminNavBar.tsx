import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

export const AdminNavbar = () => {
  return (
    <nav className={styles.navbar}>
      <span className={styles.brand}>Equitas</span>
      <div className={styles.nav}>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.active : ''}`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/horses"
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.active : ''}`
          }
        >
          Horses
        </NavLink>
      </div>
    </nav>
  );
};