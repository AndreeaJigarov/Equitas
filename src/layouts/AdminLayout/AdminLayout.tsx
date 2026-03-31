import { Outlet } from 'react-router-dom';
import { AdminNavbar } from '../../components/NavBar/AdminNavBar';
import styles from './AdminLayout.module.css';

export const AdminLayout = () => {
  return (
    <div className={styles.adminWrapper}>
      {/* Sidebar stays fixed on the left */}
      <AdminNavbar /> 
      <main className={styles.contentArea}>
        <Outlet /> 
      </main>
    </div>
  );
};