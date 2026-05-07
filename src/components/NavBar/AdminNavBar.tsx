import {NavLink, useNavigate} from 'react-router-dom';
import styles from './NavBar.module.css';
import logo_White from "../../assets/logo/logo_White.png";
import { useAuthStore } from '../../store/useAuthStore';

export const AdminNavbar = () => {

    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    const handleLogout = () => {
        logout();
        document.cookie = "sessionStart=; max-age=0; path=/; SameSite=Strict";
        document.cookie = "lastHorseId=; max-age=0; path=/; SameSite=Strict";
        navigate('/login');
    };

    return (
        <nav className={styles.navbar}>
            {/* Restore the Logo/Brand visibility */}
            <img src={logo_White} alt="Equitas Logo" className={styles.logoImage} />

            <div className={styles.nav}>
                {/*<NavLink*/}
                {/*    to="/"*/}
                {/*    end*/}
                {/*    className={({ isActive }) =>*/}
                {/*        `${styles.navLink} ${isActive ? styles.active : ''}`*/}
                {/*    }*/}
                {/*>*/}
                {/*    Home*/}
                {/*</NavLink>*/}
                <NavLink
                    to="/horses"
                    className={({ isActive }) =>
                        `${styles.navLink} ${isActive ? styles.active : ''}`
                    }
                >
                    Horses
                </NavLink>
                <NavLink
                    to="/statistics"
                    className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                    Statistics
                </NavLink>
                <NavLink
                    to="/chat"
                    className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                    Chat
                </NavLink>
                {user?.roles.includes('ADMIN') && (
                    <NavLink
                        to="/admin"
                        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                    >
                        Admin
                    </NavLink>
                )}

                {user && (
                    <span className={styles.navLink} style={{ cursor: 'default', opacity: 0.85 }}>
                        {user.username} · {user.roles.join(', ')}
                    </span>
                )}

                <button onClick={handleLogout} className={styles.logoutBtn}>
                    Logout
                </button>

            </div>
        </nav>
    );
};