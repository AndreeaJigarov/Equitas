import { useState } from 'react';
import { type Horse } from '../../../types/Horse';
import styles from './HorseTable.module.css';

interface HorseTableProps {
    horses: Horse [];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onAddNew: () => void;
}

const PAGE_SIZE = 6;

export const HorseTable = ({ horses, selectedId, onSelect, onAddNew }: HorseTableProps) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(horses.length / PAGE_SIZE));

    // Clamăm în render — fix pentru când WebSocket adaugă cai și lista crește brusc
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;
    const paginatedHorses = horses.slice(startIndex, startIndex + PAGE_SIZE);

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <h2 className={styles.title}>Horses</h2>
                <button className={styles.btnAdd} onClick={onAddNew}>add new +</button>
            </div>

            <div className={styles.list}>
                {paginatedHorses.length === 0 ? (
                    <div className={styles.empty}>No horses yet.</div>
                ) : (
                    paginatedHorses.map((horse) => (
                        <div
                            key={horse.id}
                            className={`${styles.row} ${horse.id === selectedId ? styles.rowSelected : ''}`}
                            onClick={() => onSelect(horse.id)}
                        >
                            <div className={styles.avatar}>
                                <span className={styles.avatarInitial}>
                                    {horse.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className={styles.rowInfo}>
                                <span className={styles.rowName}>{horse.name}</span>
                                <span className={styles.rowSub}>ID: {horse.id} · {horse.breed}</span>
                            </div>
                            <span className={`${styles.badge} ${diffBadge(horse.difficulty, styles)}`}>
                                {horse.difficulty}
                            </span>
                        </div>
                    ))
                )}
            </div>

            <div className={styles.pagination}>
                <button
                    className={styles.pageBtn}
                    disabled={safePage === 1}
                    onClick={() => setCurrentPage(safePage - 1)}
                >
                    Prev
                </button>
                <span className={styles.pageText}>{safePage} / {totalPages}</span>
                <button
                    className={styles.pageBtn}
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage(safePage + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

function diffBadge(d: string, styles: Record<string, string>) {
    if (d === 'Easy') return styles.badgeEasy;
    if (d === 'Medium') return styles.badgeMedium;
    return styles.badgeHard;
}