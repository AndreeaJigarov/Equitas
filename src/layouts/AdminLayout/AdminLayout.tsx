import { Outlet } from 'react-router-dom';
import { AdminNavbar } from '../../components/NavBar/AdminNavBar';
import styles from './AdminLayout.module.css';
import { useEffect } from 'react';
import { setSessionStart } from '../../utils/CookieUtils.ts';
import { useHorseStore } from '../../store/useHorseStore';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const AdminLayout = () => {
    const { setOnline, syncPendingOps, pendingOps, fetchHorses } = useHorseStore();
    const storeIsOnline = useHorseStore((s) => s.isOnline);
    const isOnline = useNetworkStatus();

    useEffect(() => {
        setSessionStart();
        fetchHorses();
    }, []);

    // ── Detectare browser offline/online ─────────────────────────────────
    useEffect(() => {
        setOnline(isOnline);
        if (isOnline && pendingOps.length > 0) syncPendingOps();
    }, [isOnline]);

    // ── Health check la server la fiecare 5 secunde ───────────────────────
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                await fetch('http://localhost:8080/api/horses?page=0&size=1');
                setOnline(true);
            } catch {
                setOnline(false);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.adminWrapper}>
            {/* Banner offline global — apare pe toate paginile din admin */}
            {!storeIsOnline && (
                <div style={{
                    background: '#8B5E3C',
                    color: 'white',
                    textAlign: 'center',
                    padding: '6px',
                    fontSize: '0.85rem',
                    width: '100%',
                    zIndex: 1000,
                }}>
                    ⚠ Offline mode — changes will sync when connection is restored
                    {pendingOps.length > 0 && ` (${pendingOps.length} pending)`}
                </div>
            )}

            <AdminNavbar />
            <main className={styles.contentArea}>
                <Outlet />
            </main>
        </div>
    );
};