import { useState, useEffect } from 'react';
import { HorseTable } from '../../components/HorsesComponents/HorseTable/HorseTable';
import { HorseDetailView } from '../../components/HorsesComponents/HorseDetailView/HorseDetailView';
import { GeneratorControls } from '../../components/GeneratorControls/GeneratorControls';
import { useHorseStore } from '../../store/useHorseStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { type HorseFormData } from '../../types/Horse';
import styles from './HorsesPage.module.css';
import { setLastViewedHorseId, getLastViewedHorseId, incrementHorseViewCount } from '../../utils/CookieUtils';

export type PanelMode = 'none' | 'view' | 'edit' | 'add';

export const HorsesPage = () => {
    const { horses, addHorse, updateHorse, removeHorse, getHorseById, isLoading } = useHorseStore();

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [mode, setMode] = useState<PanelMode>('none');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // WebSocket — primim cai noi în timp real de la generator
    useWebSocket();

    // ── Cookie: redeschide ultimul cal vizualizat ─────────────────────────
    useEffect(() => {
        if (horses.length === 0) return;
        const savedId = getLastViewedHorseId();
        if (savedId && getHorseById(savedId)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedId(savedId);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMode('view');
        }
    }, [horses.length]);

    // ── Resize listener ───────────────────────────────────────────────────
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const selectedHorse = selectedId ? getHorseById(selectedId) : undefined;

    const handleSelectHorse = (id: string) => {
        setSelectedId(id); setMode('view');
        setLastViewedHorseId(id); incrementHorseViewCount(id);
    };
    const handleAddNew = () => { setSelectedId(null); setMode('add'); };
    const handleEdit = () => { setMode('edit'); };
    const handleCancel = () => {
        setMode('none'); setSelectedId(null);
        document.cookie = "lastHorseId=; max-age=0; path=/; SameSite=Strict";
    };
    const handleSubmitAdd = async (data: HorseFormData) => {
        await addHorse(data); setMode('none'); setSelectedId(null);
    };
    const handleSubmitEdit = async (data: HorseFormData) => {
        if (selectedId) { await updateHorse(selectedId, data); setMode('view'); }
    };
    const handleDelete = async (id: string) => {
        await removeHorse(id); setSelectedId(null); setMode('none');
    };

    if (isLoading) {
        return (
            <div className={styles.splitWrapper} style={{ alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--dark-earth)', fontFamily: 'var(--font-serif)' }}>Loading horses...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <GeneratorControls />

            <div className={styles.splitWrapper}>
                {(!isMobile || mode === 'none') && (
                    <div className={styles.leftPanel}>
                        <HorseTable horses={horses} selectedId={selectedId} onSelect={handleSelectHorse} onAddNew={handleAddNew} />
                    </div>
                )}
                {(!isMobile || mode !== 'none') && (
                    <div className={styles.rightPanel}>
                        <HorseDetailView mode={mode} horse={selectedHorse} onEdit={handleEdit}
                                         onDelete={handleDelete} onSubmitAdd={handleSubmitAdd}
                                         onSubmitEdit={handleSubmitEdit} onCancel={handleCancel} />
                    </div>
                )}
            </div>
        </div>
    );
};