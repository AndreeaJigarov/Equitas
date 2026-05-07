import { useCallback, useEffect, useState } from 'react';
import {
    fetchAuditLogs,
    fetchObservationList,
    resolveObservation,
    type AuditLog,
    type ObservationEntry,
} from '../../api/adminApi';
import styles from './AdminPage.module.css';

const REFRESH_MS = 5000; // poll so the demo stays live without WS plumbing

export const AdminPage = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [observations, setObservations] = useState<ObservationEntry[]>([]);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        try {
            const [logsResp, obsResp] = await Promise.all([
                fetchAuditLogs(0, 100),
                fetchObservationList(0, 100),
            ]);
            setLogs(logsResp.content);
            setObservations(obsResp.content);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to refresh');
        }
    }, []);

    useEffect(() => {
        reload();
        const id = setInterval(reload, REFRESH_MS);
        return () => clearInterval(id);
    }, [reload]);

    const handleResolve = async (id: string) => {
        try {
            await resolveObservation(id);
            await reload();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to resolve');
        }
    };

    const fmtTime = (iso: string) => {
        try { return new Date(iso).toLocaleString(); } catch { return iso; }
    };

    const roleBadge = (role: string) => {
        const cls = role === 'ADMIN' ? styles.badgeAdmin
            : role === 'USER' ? styles.badgeUser
            : styles.badgeAnon;
        return <span className={`${styles.badge} ${cls}`}>{role}</span>;
    };

    return (
        <div className={styles.adminWrapper}>
            <h1 style={{ fontFamily: 'var(--font-serif, serif)' }}>Admin · Activity & Observation</h1>
            {error && <div className={styles.errorBanner}>{error}</div>}

            {/* ── Observation list ── */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Observation List ({observations.filter(o => !o.resolved).length} active)</h2>
                    <button className={styles.refreshBtn} onClick={reload}>Refresh</button>
                </div>
                <div className={styles.tableWrap}>
                    {observations.length === 0 ? (
                        <div className={styles.empty}>No suspicious users yet 🟢</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Detected at</th>
                                    <th>User</th>
                                    <th>Rule</th>
                                    <th>Reason</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {observations.map(o => (
                                    <tr key={o.id} className={o.resolved ? styles.resolved : ''}>
                                        <td>{fmtTime(o.detectedAt)}</td>
                                        <td><strong>{o.username}</strong><br/>
                                            <small style={{ opacity: 0.6 }}>{o.userId}</small>
                                        </td>
                                        <td><span className={`${styles.badge} ${styles.badgeRule}`}>{o.rule}</span></td>
                                        <td>{o.reason}</td>
                                        <td>
                                            {o.resolved
                                                ? <span style={{ opacity: 0.6 }}>resolved</span>
                                                : <button className={styles.resolveBtn}
                                                          onClick={() => handleResolve(o.id)}>
                                                    Resolve
                                                  </button>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {/* ── Audit log ── */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Audit Log (latest {logs.length})</h2>
                    <button className={styles.refreshBtn} onClick={reload}>Refresh</button>
                </div>
                <div className={styles.tableWrap}>
                    {logs.length === 0 ? (
                        <div className={styles.empty}>No actions logged yet.</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                    <th>Resource</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(l => (
                                    <tr key={l.id}>
                                        <td>{fmtTime(l.timestamp)}</td>
                                        <td>{l.username || <em style={{ opacity: 0.55 }}>—</em>}</td>
                                        <td>{roleBadge(l.role)}</td>
                                        <td><strong>{l.action}</strong></td>
                                        <td><code style={{ fontSize: '0.8rem' }}>{l.resource}</code></td>
                                        <td>
                                            <span className={`${styles.badge} ${l.success ? styles.badgeOk : styles.badgeFail}`}>
                                                {l.success ? 'OK' : 'FAIL'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
        </div>
    );
};
