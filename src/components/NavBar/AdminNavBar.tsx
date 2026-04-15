import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';
import logo_White from "../../assets/logo/logo_White.png";

export const AdminNavbar = () => {

    return (
        <nav className={styles.navbar}>
            {/* Restore the Logo/Brand visibility */}
            <img src={logo_White} alt="Equitas Logo" className={styles.logoImage} />

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