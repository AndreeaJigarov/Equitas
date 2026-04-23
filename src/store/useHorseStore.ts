import { create } from 'zustand';
import { type Horse, type HorseFormData } from '../types/Horse';
import * as api from '../api/horseApi';

// Operații efectuate offline care trebuie sincronizate când revine conexiunea
interface PendingOperation {
    type: 'add' | 'update' | 'delete';
    localId: string;           // id-ul local (temporar pentru add)
    serverId?: string;         // id-ul real de pe server (după sync)
    data?: HorseFormData;
}

interface HorseStore {
    horses: Horse[];
    isLoading: boolean;
    isOnline: boolean;
    pendingOps: PendingOperation[];

    // Acțiuni
    fetchHorses: () => Promise<void>;
    addHorse: (data: HorseFormData) => Promise<void>;
    updateHorse: (id: string, data: HorseFormData) => Promise<void>;
    removeHorse: (id: string) => Promise<void>;
    getHorseById: (id: string) => Horse | undefined;
    setOnline: (online: boolean) => void;
    syncPendingOps: () => Promise<void>;
}

let tempIdCounter = 1;

export const useHorseStore = create<HorseStore>((set, get) => ({
    horses: [],
    isLoading: false,
    isOnline: navigator.onLine,
    pendingOps: [],

    // ── FETCH (load all from backend) ─────────────────────────────────────
    fetchHorses: async () => {
        set({ isLoading: true });
        try {
            const horses = await api.fetchAllHorses();
            set({ horses, isLoading: false, isOnline: true });
        } catch {
            // Backend inaccessibil — rămânem cu ce avem în store (offline mode)
            set({ isLoading: false, isOnline: false });
        }
    },

    // ── ADD ───────────────────────────────────────────────────────────────
    addHorse: async (data) => {
        const { isOnline } = get();

        if (isOnline) {
            try {
                const created = await api.createHorse(data);
                set((state) => ({ horses: [...state.horses, created] }));
                return;
            } catch {
                set({ isOnline: false });
            }
        }

        // Offline — adăugăm local cu id temporar
        const localId = `temp-${tempIdCounter++}`;
        const tempHorse: Horse = { ...data, id: localId };
        set((state) => ({
            horses: [...state.horses, tempHorse],
            pendingOps: [...state.pendingOps, { type: 'add', localId, data }],
        }));
    },

    // ── UPDATE ────────────────────────────────────────────────────────────
    updateHorse: async (id, data) => {
        const { isOnline } = get();

        if (isOnline) {
            try {
                const updated = await api.updateHorse(id, data);
                set((state) => ({
                    horses: state.horses.map((h) => h.id === id ? updated : h),
                }));
                return;
            } catch {
                set({ isOnline: false });
            }
        }

        // Offline — actualizăm local
        set((state) => ({
            horses: state.horses.map((h) => h.id === id ? { ...data, id } : h),
            pendingOps: [...state.pendingOps, { type: 'update', localId: id, data }],
        }));
    },

    // ── DELETE ────────────────────────────────────────────────────────────
    removeHorse: async (id) => {
        const { isOnline } = get();

        // Optimistic update — ștergem imediat din UI
        set((state) => ({
            horses: state.horses.filter((h) => h.id !== id),
        }));

        if (isOnline) {
            try {
                await api.deleteHorse(id);
                return;
            } catch {
                set({ isOnline: false });
            }
        }

        // Offline — marcăm pentru sync ulterior (doar dacă nu e id temporar)
        if (!id.startsWith('temp-')) {
            set((state) => ({
                pendingOps: [...state.pendingOps, { type: 'delete', localId: id }],
            }));
        }
    },

    // ── GET BY ID ─────────────────────────────────────────────────────────
    getHorseById: (id) => get().horses.find((h) => h.id === id),

    // ── NETWORK STATUS ────────────────────────────────────────────────────
    setOnline: (online) => {
        set({ isOnline: online });
        if (online) {
            get().syncPendingOps();
        }
    },

    // ── SYNC PENDING OPS (Silver) ─────────────────────────────────────────
    syncPendingOps: async () => {
        const { pendingOps } = get();
        if (pendingOps.length === 0) return;

        const remaining: PendingOperation[] = [];

        for (const op of pendingOps) {
            try {
                if (op.type === 'add' && op.data) {
                    const created = await api.createHorse(op.data);
                    // Înlocuim id-ul temporar cu cel real
                    set((state) => ({
                        horses: state.horses.map((h) =>
                            h.id === op.localId ? created : h
                        ),
                    }));
                } else if (op.type === 'update' && op.data) {
                    const updated = await api.updateHorse(op.localId, op.data);
                    set((state) => ({
                        horses: state.horses.map((h) =>
                            h.id === op.localId ? updated : h
                        ),
                    }));
                } else if (op.type === 'delete') {
                    await api.deleteHorse(op.localId);
                }
            } catch {
                // Dacă operația eșuează, o păstrăm pentru retry
                remaining.push(op);
            }
        }

        set({ pendingOps: remaining, isOnline: remaining.length === 0 });
    },
}));