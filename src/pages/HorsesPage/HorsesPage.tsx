import { useState, useEffect } from 'react';
import { HorseTable } from '../../components/HorsesComponents/HorseTable/HorseTable';
import { HorseDetailView } from '../../components/HorsesComponents/HorseDetailView/HorseDetailView';
import { useHorseStore } from '../../store/useHorseStore';
import { type HorseFormData } from '../../types/Horse';
import styles from './HorsesPage.module.css';
import { setLastViewedHorseId, getLastViewedHorseId } from '../../utils/CookieUtils';

export type PanelMode = 'none' | 'view' | 'edit' | 'add';

export const HorsesPage = () => {
  const { horses, addHorse, updateHorse, removeHorse, getHorseById } = useHorseStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<PanelMode>('none');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);


  // --- COOKIE MONITORING LOGIC ---
  // On mount, check if there is a "last viewed" horse preference in cookies 
    useEffect(() => {
        // Keep your existing cookie check
        const savedId = getLastViewedHorseId();
        if (savedId && getHorseById(savedId)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedId(savedId);
            setMode('view');
        }

        // Add resize listener for Gold responsiveness [cite: 95, 96]
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [getHorseById]);

  const selectedHorse = selectedId ? getHorseById(selectedId) : undefined;

  // Modified to save preference whenever a user selects a horse 
    const handleSelectHorse = (id: string) => {
        setSelectedId(id);
        setMode('view');
        setLastViewedHorseId(id); // Existing Silver activity monitoring
    };







  // const selectedHorse = selectedId ? getHorseById(selectedId) : undefined;

  // const handleSelectHorse = (id: string) => { setSelectedId(id); setMode('view'); };
  const handleAddNew = () => { setSelectedId(null); setMode('add'); };
  const handleEdit = () => { setMode('edit'); };
    const handleCancel = () => {
        // Resetting both mode and selectedId ensures the DetailView
        // disappears and the HorseTable reappears on mobile.
        setMode('none');
        setSelectedId(null);
    };
  const handleSubmitAdd = (data: HorseFormData) => {
    addHorse(data); setMode('none'); setSelectedId(null);
  };
  const handleSubmitEdit = (data: HorseFormData) => {
    if (selectedId) { updateHorse(selectedId, data); setMode('view'); }
  };
  const handleDelete = (id: string) => {
    removeHorse(id); setSelectedId(null); setMode('none');
  };

    /* HorsesPage.tsx - Replace the return statement */
    return (
        <div className={styles.splitWrapper}>
            {/* On mobile: Show list ONLY if no horse is selected (mode === 'none') */}
            {(!isMobile || mode === 'none') && (
                <div className={styles.leftPanel}>
                    <HorseTable
                        horses={horses}
                        selectedId={selectedId}
                        onSelect={handleSelectHorse}
                        onAddNew={handleAddNew}
                    />
                </div>
            )}

            {/* On mobile: Show detail panel ONLY if a horse IS selected or adding */}
            {(!isMobile || mode !== 'none') && (
                <div className={styles.rightPanel}>
                    <HorseDetailView
                        mode={mode}
                        horse={selectedHorse}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onSubmitAdd={handleSubmitAdd}
                        onSubmitEdit={handleSubmitEdit}
                        onCancel={handleCancel} /* This handles the "X" button logic */
                    />
                </div>
            )}
        </div>
    );
};