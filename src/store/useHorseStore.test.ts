import { describe, it, expect, beforeEach } from 'vitest';
import { useHorseStore } from '../store/useHorseStore';
import { type HorseFormData } from '../types/Horse';

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
        useHorseStore.setState({ horses: [] });
    });

    // ── INITIAL STATE ─────────────────────────────────────────────────────
    it('starts with empty horses array after reset', () => {
        expect(useHorseStore.getState().horses).toHaveLength(0);
    });

    // ── addHorse ──────────────────────────────────────────────────────────
    it('addHorse adds exactly one horse', () => {
        useHorseStore.getState().addHorse(sampleHorse);
        expect(useHorseStore.getState().horses).toHaveLength(1);
    });

    it('addHorse assigns an id of type string', () => {
        useHorseStore.getState().addHorse(sampleHorse);
        const horse = useHorseStore.getState().horses[0];
        expect(horse.id).toBeDefined();
        expect(typeof horse.id).toBe('string');
    });

    it('addHorse preserves all form fields', () => {
        useHorseStore.getState().addHorse(sampleHorse);
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

    it('addHorse assigns unique ids to multiple horses', () => {
        useHorseStore.getState().addHorse(sampleHorse);
        useHorseStore.getState().addHorse({ ...sampleHorse, name: 'Horse2' });
        const { horses } = useHorseStore.getState();
        expect(horses[0].id).not.toBe(horses[1].id);
    });

    it('addHorse appends each new horse to the list', () => {
        useHorseStore.getState().addHorse(sampleHorse);
        useHorseStore.getState().addHorse({ ...sampleHorse, name: 'Horse2' });
        useHorseStore.getState().addHorse({ ...sampleHorse, name: 'Horse3' });
        expect(useHorseStore.getState().horses).toHaveLength(3);
    });

    // ── removeHorse ───────────────────────────────────────────────────────
    it('removeHorse removes the horse with the given id', () => {
        useHorseStore.getState().addHorse(sampleHorse);
        useHorseStore.getState().addHorse({ ...sampleHorse, name: 'Horse2' });
        const idToRemove = useHorseStore.getState().horses[0].id;

        useHorseStore.getState().removeHorse(idToRemove);
        const { horses } = useHorseStore.getState();
        expect(horses).toHaveLength(1);
        expect(horses.find(h => h.id === idToRemove)).toBeUndefined();
    });

    it('removeHorse keeps other horses intact', () => {
        useHorseStore.getState().addHorse(sampleHorse);
        useHorseStore.getState().addHorse({ ...sampleHorse, name: 'Horse2' });
        const idToRemove = useHorseStore.getState().horses[0].id;
        const idToKeep = useHorseStore.getState().horses[1].id;

        useHorseStore.getState().removeHorse(idToRemove);
        expect(useHorseStore.getState().horses[0].id).toBe(idToKeep);
    });

    it('removeHorse does nothing for an unknown id', () => {
        useHorseStore.getState().addHorse(sampleHorse);
        useHorseStore.getState().removeHorse('nonexistent-id');
        expect(useHorseStore.getState().horses).toHaveLength(1);
    });

    it('removeHorse on empty store leaves it empty', () => {
        useHorseStore.getState().removeHorse('any-id');
        expect(useHorseStore.getState().horses).toHaveLength(0);
    });

    // ── updateHorse ───────────────────────────────────────────────────────
    it('updateHorse changes the specified fields', () => {
        useHorseStore.getState().addHorse(sampleHorse);
        const id = useHorseStore.getState().horses[0].id;

        useHorseStore.getState().updateHorse(id, {
            ...sampleHorse,
            name: 'UpdatedName',
            difficulty: 'Hard',
        });

        const updated = useHorseStore.getState().horses[0];
        expect(updated.name).toBe('UpdatedName');
        expect(updated.difficulty).toBe('Hard');
    });

    it('updateHorse preserves the original id', () => {
        useHorseStore.getState().addHorse(sampleHorse);
        const id = useHorseStore.getState().horses[0].id;
        useHorseStore.getState().updateHorse(id, { ...sampleHorse, name: 'NewName' });
        expect(useHorseStore.getState().horses[0].id).toBe(id);
    });

    it('updateHorse does not change other horses in the list', () => {
        useHorseStore.getState().addHorse(sampleHorse);
        useHorseStore.getState().addHorse({ ...sampleHorse, name: 'Horse2' });
        const idFirst = useHorseStore.getState().horses[0].id;

        useHorseStore.getState().updateHorse(idFirst, { ...sampleHorse, name: 'Changed' });

        expect(useHorseStore.getState().horses[1].name).toBe('Horse2');
    });

    it('updateHorse with a non-existent id leaves the store unchanged', () => {
        useHorseStore.getState().addHorse(sampleHorse);
        const before = [...useHorseStore.getState().horses];

        useHorseStore.getState().updateHorse('does-not-exist', { ...sampleHorse, name: 'Ghost' });

        expect(useHorseStore.getState().horses).toEqual(before);
    });

    it('updateHorse keeps total horse count the same', () => {
        useHorseStore.getState().addHorse(sampleHorse);
        useHorseStore.getState().addHorse({ ...sampleHorse, name: 'Horse2' });
        const id = useHorseStore.getState().horses[0].id;

        useHorseStore.getState().updateHorse(id, { ...sampleHorse, name: 'Updated' });

        expect(useHorseStore.getState().horses).toHaveLength(2);
    });

    // ── getHorseById ──────────────────────────────────────────────────────
    it('getHorseById returns the correct horse by id', () => {
        useHorseStore.getState().addHorse(sampleHorse);
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

    it('getHorseById finds the correct horse among multiple', () => {
        useHorseStore.getState().addHorse(sampleHorse);
        useHorseStore.getState().addHorse({ ...sampleHorse, name: 'SecondHorse' });
        const secondId = useHorseStore.getState().horses[1].id;

        const found = useHorseStore.getState().getHorseById(secondId);
        expect(found?.name).toBe('SecondHorse');
    });

    // ── INTEGRATION: complete CRUD flow ───────────────────────────────────
    it('full CRUD: add → update → delete works correctly', () => {
        // Add
        useHorseStore.getState().addHorse(sampleHorse);
        const id = useHorseStore.getState().horses[0].id;
        expect(useHorseStore.getState().horses).toHaveLength(1);

        // Update
        useHorseStore.getState().updateHorse(id, { ...sampleHorse, name: 'Modified' });
        expect(useHorseStore.getState().getHorseById(id)?.name).toBe('Modified');

        // Delete
        useHorseStore.getState().removeHorse(id);
        expect(useHorseStore.getState().horses).toHaveLength(0);
        expect(useHorseStore.getState().getHorseById(id)).toBeUndefined();
    });
});