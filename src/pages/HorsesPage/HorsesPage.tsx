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



  // --- COOKIE MONITORING LOGIC ---
  // On mount, check if there is a "last viewed" horse preference in cookies 
  useEffect(() => {
    const savedId = getLastViewedHorseId();
    if (savedId && getHorseById(savedId)) {
      setSelectedId(savedId);
      setMode('view');
    }
  }, []); // Only runs once on initial load

  const selectedHorse = selectedId ? getHorseById(selectedId) : undefined;

  // Modified to save preference whenever a user selects a horse 
  const handleSelectHorse = (id: string) => { 
    setSelectedId(id); 
    setMode('view'); 
    setLastViewedHorseId(id); // Monitor and save user activity 
  };





  // const selectedHorse = selectedId ? getHorseById(selectedId) : undefined;

  // const handleSelectHorse = (id: string) => { setSelectedId(id); setMode('view'); };
  const handleAddNew = () => { setSelectedId(null); setMode('add'); };
  const handleEdit = () => { setMode('edit'); };
  const handleCancel = () => {
    if (mode === 'add') { setMode('none'); setSelectedId(null); }
    else { setMode('view'); }
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

  return (
    <div className={styles.splitWrapper}>
      <div className={styles.leftPanel}>
        <HorseTable
          horses={horses}
          selectedId={selectedId}
          onSelect={handleSelectHorse}
          onAddNew={handleAddNew}
        />
      </div>
      <div className={styles.rightPanel}>
        <HorseDetailView
          mode={mode}
          horse={selectedHorse}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSubmitAdd={handleSubmitAdd}
          onSubmitEdit={handleSubmitEdit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};