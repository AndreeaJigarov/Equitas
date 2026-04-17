import { Outlet } from 'react-router-dom';
import { AdminNavbar } from '../../components/NavBar/AdminNavBar';
import styles from './AdminLayout.module.css';
import {useEffect} from "react";
import {setSessionStart} from "../../utils/CookieUtils.ts";

export const AdminLayout = () => {
    useEffect(() => {
        // Start the session timer as soon as the admin area loads
        setSessionStart();
    }, []);
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