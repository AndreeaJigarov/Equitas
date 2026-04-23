import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHorseStore } from '../store/useHorseStore';
import { type HorseFormData } from '../types/Horse';

let mockIdCounter = 1;

// ── Mock API ──────────────────────────────────────────────────────────────
// Mockăm modulul API ca să nu depindem de backend în teste
vi.mock('../api/horseApi', () => ({
    fetchAllHorses: vi.fn().mockResolvedValue([]),
    createHorse: vi.fn().mockImplementation((data: HorseFormData) =>
        Promise.resolve({ ...data, id: `mock-id-${mockIdCounter++}` })
    ),
    updateHorse: vi.fn().mockImplementation((id: string, data: HorseFormData) =>
        Promise.resolve({ ...data, id })
    ),
    deleteHorse: vi.fn().mockResolvedValue(undefined),
}));

const sampleHorse: HorseFormData = {
    name: 'TestHorse',
    breed: 'Thoroughbred',
    difficulty: 'Easy',
    weight: 450,
    dateOfBirth: '2018-01-01',
    about: 'A test horse for unit testing.',
    inTraining: false,
    recommendedFor: 'Both',
    isAvailable: true,
};

describe('useHorseStore', () => {
    beforeEach(() => {
        useHorseStore.setState({
            horses: [],
            isLoading: false,
            isOnline: true,
            pendingOps: [],
        });
    });

    // ── INITIAL STATE ─────────────────────────────────────────────────────
    it('starts with empty horses array after reset', () => {
        expect(useHorseStore.getState().horses).toHaveLength(0);
    });

    it('starts with isOnline true', () => {
        expect(useHorseStore.getState().isOnline).toBe(true);
    });

    it('starts with no pending operations', () => {
        expect(useHorseStore.getState().pendingOps).toHaveLength(0);
    });

    // ── addHorse (online) ─────────────────────────────────────────────────
    it('addHorse adds exactly one horse when online', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        expect(useHorseStore.getState().horses).toHaveLength(1);
    });

    it('addHorse assigns an id of type string when online', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        const horse = useHorseStore.getState().horses[0];
        expect(horse.id).toBeDefined();
        expect(typeof horse.id).toBe('string');
    });

    it('addHorse preserves all form fields when online', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        const horse = useHorseStore.getState().horses[0];
        expect(horse.name).toBe(sampleHorse.name);
        expect(horse.breed).toBe(sampleHorse.breed);
        expect(horse.difficulty).toBe(sampleHorse.difficulty);
        expect(horse.weight).toBe(sampleHorse.weight);
        expect(horse.dateOfBirth).toBe(sampleHorse.dateOfBirth);
        expect(horse.about).toBe(sampleHorse.about);
        expect(horse.inTraining).toBe(sampleHorse.inTraining);
        expect(horse.recommendedFor).toBe(sampleHorse.recommendedFor);
        expect(horse.isAvailable).toBe(sampleHorse.isAvailable);
    });

    it('addHorse assigns unique ids to multiple horses', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        await useHorseStore.getState().addHorse({ ...sampleHorse, name: 'Horse2' });
        const { horses } = useHorseStore.getState();
        expect(horses[0].id).not.toBe(horses[1].id);
    });

    it('addHorse appends each new horse to the list', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        await useHorseStore.getState().addHorse({ ...sampleHorse, name: 'Horse2' });
        await useHorseStore.getState().addHorse({ ...sampleHorse, name: 'Horse3' });
        expect(useHorseStore.getState().horses).toHaveLength(3);
    });

    // ── addHorse (offline) ────────────────────────────────────────────────
    it('addHorse offline adds horse with temp id', async () => {
        useHorseStore.setState({ isOnline: false });
        await useHorseStore.getState().addHorse(sampleHorse);
        const { horses } = useHorseStore.getState();
        expect(horses).toHaveLength(1);
        expect(horses[0].id).toMatch(/^temp-/);
    });

    it('addHorse offline adds to pendingOps', async () => {
        useHorseStore.setState({ isOnline: false });
        await useHorseStore.getState().addHorse(sampleHorse);
        expect(useHorseStore.getState().pendingOps).toHaveLength(1);
        expect(useHorseStore.getState().pendingOps[0].type).toBe('add');
    });

    // ── removeHorse (online) ──────────────────────────────────────────────
    it('removeHorse removes the horse with the given id', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        await useHorseStore.getState().addHorse({ ...sampleHorse, name: 'Horse2' });
        const idToRemove = useHorseStore.getState().horses[0].id;

        await useHorseStore.getState().removeHorse(idToRemove);
        const { horses } = useHorseStore.getState();
        expect(horses).toHaveLength(1);
        expect(horses.find(h => h.id === idToRemove)).toBeUndefined();
    });

    it('removeHorse keeps other horses intact', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        await useHorseStore.getState().addHorse({ ...sampleHorse, name: 'Horse2' });
        const idToRemove = useHorseStore.getState().horses[0].id;
        const idToKeep = useHorseStore.getState().horses[1].id;

        await useHorseStore.getState().removeHorse(idToRemove);
        expect(useHorseStore.getState().horses[0].id).toBe(idToKeep);
    });

    it('removeHorse on empty store leaves it empty', async () => {
        await useHorseStore.getState().removeHorse('any-id');
        expect(useHorseStore.getState().horses).toHaveLength(0);
    });

    // ── removeHorse (offline) ─────────────────────────────────────────────
    it('removeHorse offline adds to pendingOps for real ids', async () => {
        // Adăugăm un cal cu id real (non-temp)
        useHorseStore.setState({
            horses: [{ ...sampleHorse, id: 'real-id-1' }],
            isOnline: false,
        });
        await useHorseStore.getState().removeHorse('real-id-1');
        expect(useHorseStore.getState().pendingOps).toHaveLength(1);
        expect(useHorseStore.getState().pendingOps[0].type).toBe('delete');
    });

    it('removeHorse offline does NOT add temp ids to pendingOps', async () => {
        useHorseStore.setState({
            horses: [{ ...sampleHorse, id: 'temp-1' }],
            isOnline: false,
        });
        await useHorseStore.getState().removeHorse('temp-1');
        expect(useHorseStore.getState().pendingOps).toHaveLength(0);
    });

    // ── updateHorse (online) ──────────────────────────────────────────────
    it('updateHorse changes the specified fields', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        const id = useHorseStore.getState().horses[0].id;

        await useHorseStore.getState().updateHorse(id, {
            ...sampleHorse,
            name: 'UpdatedName',
            difficulty: 'Hard',
        });

        const updated = useHorseStore.getState().horses[0];
        expect(updated.name).toBe('UpdatedName');
        expect(updated.difficulty).toBe('Hard');
    });

    it('updateHorse preserves the original id', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        const id = useHorseStore.getState().horses[0].id;
        await useHorseStore.getState().updateHorse(id, { ...sampleHorse, name: 'NewName' });
        expect(useHorseStore.getState().horses[0].id).toBe(id);
    });

    it('updateHorse does not change other horses in the list', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        await useHorseStore.getState().addHorse({ ...sampleHorse, name: 'Horse2' });
        const idFirst = useHorseStore.getState().horses[0].id;

        await useHorseStore.getState().updateHorse(idFirst, { ...sampleHorse, name: 'Changed' });
        expect(useHorseStore.getState().horses[1].name).toBe('Horse2');
    });

    it('updateHorse keeps total horse count the same', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        await useHorseStore.getState().addHorse({ ...sampleHorse, name: 'Horse2' });
        const id = useHorseStore.getState().horses[0].id;

        await useHorseStore.getState().updateHorse(id, { ...sampleHorse, name: 'Updated' });
        expect(useHorseStore.getState().horses).toHaveLength(2);
    });

    // ── updateHorse (offline) ─────────────────────────────────────────────
    it('updateHorse offline updates locally and adds to pendingOps', async () => {
        useHorseStore.setState({
            horses: [{ ...sampleHorse, id: 'real-id-1' }],
            isOnline: false,
        });
        await useHorseStore.getState().updateHorse('real-id-1', { ...sampleHorse, name: 'OfflineEdit' });

        expect(useHorseStore.getState().horses[0].name).toBe('OfflineEdit');
        expect(useHorseStore.getState().pendingOps).toHaveLength(1);
        expect(useHorseStore.getState().pendingOps[0].type).toBe('update');
    });

    // ── getHorseById ──────────────────────────────────────────────────────
    it('getHorseById returns the correct horse by id', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        const id = useHorseStore.getState().horses[0].id;

        const found = useHorseStore.getState().getHorseById(id);
        expect(found).toBeDefined();
        expect(found?.name).toBe('TestHorse');
    });

    it('getHorseById returns undefined for an unknown id', () => {
        const found = useHorseStore.getState().getHorseById('does-not-exist');
        expect(found).toBeUndefined();
    });

    it('getHorseById returns undefined on an empty store', () => {
        expect(useHorseStore.getState().getHorseById('1')).toBeUndefined();
    });

    it('getHorseById finds the correct horse among multiple', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        await useHorseStore.getState().addHorse({ ...sampleHorse, name: 'SecondHorse' });
        const secondId = useHorseStore.getState().horses[1].id;

        const found = useHorseStore.getState().getHorseById(secondId);
        expect(found?.name).toBe('SecondHorse');
    });

    // ── setOnline ─────────────────────────────────────────────────────────
    it('setOnline updates isOnline state', () => {
        useHorseStore.getState().setOnline(false);
        expect(useHorseStore.getState().isOnline).toBe(false);

        useHorseStore.getState().setOnline(true);
        expect(useHorseStore.getState().isOnline).toBe(true);
    });

    // ── INTEGRATION: complete CRUD flow ───────────────────────────────────
    it('full CRUD: add → update → delete works correctly', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        const id = useHorseStore.getState().horses[0].id;
        expect(useHorseStore.getState().horses).toHaveLength(1);

        await useHorseStore.getState().updateHorse(id, { ...sampleHorse, name: 'Modified' });
        expect(useHorseStore.getState().getHorseById(id)?.name).toBe('Modified');

        await useHorseStore.getState().removeHorse(id);
        expect(useHorseStore.getState().horses).toHaveLength(0);
        expect(useHorseStore.getState().getHorseById(id)).toBeUndefined();
    });

    // ── INTEGRATION: offline CRUD flow ────────────────────────────────────
    it('offline CRUD: operations work locally and queue pending ops', async () => {
        useHorseStore.setState({ isOnline: false });

        await useHorseStore.getState().addHorse(sampleHorse);
        expect(useHorseStore.getState().horses).toHaveLength(1);
        expect(useHorseStore.getState().pendingOps).toHaveLength(1);

        const tempId = useHorseStore.getState().horses[0].id;
        await useHorseStore.getState().updateHorse(tempId, { ...sampleHorse, name: 'OfflineMod' });
        expect(useHorseStore.getState().horses[0].name).toBe('OfflineMod');
        expect(useHorseStore.getState().pendingOps).toHaveLength(2);

        await useHorseStore.getState().removeHorse(tempId);
        expect(useHorseStore.getState().horses).toHaveLength(0);
        // temp id nu se adaugă în pendingOps la delete
        expect(useHorseStore.getState().pendingOps).toHaveLength(2);
    });
});