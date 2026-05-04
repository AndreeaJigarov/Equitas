import { create } from 'zustand';
import { type Horse, type HorseFormData } from '../types/Horse';
import * as api from '../api/horseApi';

interface HorseStore {
    horses: Horse[];
    isLoading: boolean;

    fetchHorses: () => Promise<void>;
    addHorse: (data: HorseFormData) => Promise<void>;
    updateHorse: (id: string, data: HorseFormData) => Promise<void>;
    removeHorse: (id: string) => Promise<void>;
    getHorseById: (id: string) => Horse | undefined;
}

export const useHorseStore = create<HorseStore>((set, get) => ({
    horses: [],
    isLoading: false,

    fetchHorses: async () => {
        set({ isLoading: true });
        try {
            const horses = await api.fetchAllHorses();
            set({ horses, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },

    addHorse: async (data) => {
        const created = await api.createHorse(data);
        set((state) => ({ horses: [...state.horses, created] }));
    },

    updateHorse: async (id, data) => {
        const updated = await api.updateHorse(id, data);
        set((state) => ({
            horses: state.horses.map((h) => (h.id === id ? updated : h)),
        }));
    },

    removeHorse: async (id) => {
        await api.deleteHorse(id);
        set((state) => ({
            horses: state.horses.filter((h) => h.id !== id),
        }));
    },

    getHorseById: (id) => get().horses.find((h) => h.id === id),
}));