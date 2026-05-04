import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHorseStore } from '../store/useHorseStore';
import { type HorseFormData } from '../types/Horse';

let mockIdCounter = 1;

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
        useHorseStore.setState({ horses: [], isLoading: false });
    });

    // ── INITIAL STATE ─────────────────────────────────────────────────────

    it('starts with empty horses array', () => {
        expect(useHorseStore.getState().horses).toHaveLength(0);
    });

    it('starts not loading', () => {
        expect(useHorseStore.getState().isLoading).toBe(false);
    });

    // ── addHorse ──────────────────────────────────────────────────────────

    it('addHorse adds exactly one horse', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        expect(useHorseStore.getState().horses).toHaveLength(1);
    });

    it('addHorse assigns an id', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        expect(useHorseStore.getState().horses[0].id).toBeDefined();
    });

    it('addHorse preserves all form fields', async () => {
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

    it('addHorse appends each new horse', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        await useHorseStore.getState().addHorse({ ...sampleHorse, name: 'Horse2' });
        await useHorseStore.getState().addHorse({ ...sampleHorse, name: 'Horse3' });
        expect(useHorseStore.getState().horses).toHaveLength(3);
    });

    // ── removeHorse ───────────────────────────────────────────────────────

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

    // ── updateHorse ───────────────────────────────────────────────────────

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

    it('updateHorse does not change other horses', async () => {
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

    // ── getHorseById ──────────────────────────────────────────────────────

    it('getHorseById returns the correct horse', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        const id = useHorseStore.getState().horses[0].id;

        const found = useHorseStore.getState().getHorseById(id);
        expect(found).toBeDefined();
        expect(found?.name).toBe('TestHorse');
    });

    it('getHorseById returns undefined for unknown id', () => {
        expect(useHorseStore.getState().getHorseById('does-not-exist')).toBeUndefined();
    });

    it('getHorseById finds the correct horse among multiple', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        await useHorseStore.getState().addHorse({ ...sampleHorse, name: 'SecondHorse' });
        const secondId = useHorseStore.getState().horses[1].id;

        expect(useHorseStore.getState().getHorseById(secondId)?.name).toBe('SecondHorse');
    });

    // ── INTEGRATION ───────────────────────────────────────────────────────

    it('full CRUD flow: add -> update -> delete', async () => {
        await useHorseStore.getState().addHorse(sampleHorse);
        const id = useHorseStore.getState().horses[0].id;
        expect(useHorseStore.getState().horses).toHaveLength(1);

        await useHorseStore.getState().updateHorse(id, { ...sampleHorse, name: 'Modified' });
        expect(useHorseStore.getState().getHorseById(id)?.name).toBe('Modified');

        await useHorseStore.getState().removeHorse(id);
        expect(useHorseStore.getState().horses).toHaveLength(0);
        expect(useHorseStore.getState().getHorseById(id)).toBeUndefined();
    });
});