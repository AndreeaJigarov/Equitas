import { describe, it, expect, beforeEach } from 'vitest';
import { useHorseStore } from '../store/useHorseStore';
import {type HorseFormData } from '../types/Horse';

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
    // reset store to initial state before each test
    useHorseStore.setState({
      horses: [],
    });
  });

  it('starts with empty horses after reset', () => {
    const { horses } = useHorseStore.getState();
    expect(horses).toHaveLength(0);
  });

  it('addHorse adds a horse with an id', () => {
    const { addHorse } = useHorseStore.getState();
    addHorse(sampleHorse);
    const { horses } = useHorseStore.getState();
    expect(horses).toHaveLength(1);
    expect(horses[0].name).toBe('TestHorse');
    expect(horses[0].id).toBeDefined();
    expect(typeof horses[0].id).toBe('string');
  });

  it('addHorse assigns unique ids to multiple horses', () => {
    const { addHorse } = useHorseStore.getState();
    addHorse(sampleHorse);
    addHorse({ ...sampleHorse, name: 'Horse2' });
    const { horses } = useHorseStore.getState();
    expect(horses[0].id).not.toBe(horses[1].id);
  });

  it('removeHorse removes the correct horse', () => {
    const { addHorse } = useHorseStore.getState();
    addHorse(sampleHorse);
    addHorse({ ...sampleHorse, name: 'Horse2' });
    const idToRemove = useHorseStore.getState().horses[0].id;

    useHorseStore.getState().removeHorse(idToRemove);
    const { horses } = useHorseStore.getState();
    expect(horses).toHaveLength(1);
    expect(horses[0].name).toBe('Horse2');
  });

  it('removeHorse does nothing for unknown id', () => {
    const { addHorse } = useHorseStore.getState();
    addHorse(sampleHorse);
    useHorseStore.getState().removeHorse('nonexistent-id');
    expect(useHorseStore.getState().horses).toHaveLength(1);
  });

  it('updateHorse updates the correct fields', () => {
    const { addHorse } = useHorseStore.getState();
    addHorse(sampleHorse);
    const id = useHorseStore.getState().horses[0].id;

    useHorseStore.getState().updateHorse(id, {
      ...sampleHorse,
      name: 'UpdatedName',
      difficulty: 'Hard',
    });

    const updated = useHorseStore.getState().horses[0];
    expect(updated.name).toBe('UpdatedName');
    expect(updated.difficulty).toBe('Hard');
    expect(updated.id).toBe(id);
  });

  it('updateHorse preserves the original id', () => {
    const { addHorse } = useHorseStore.getState();
    addHorse(sampleHorse);
    const id = useHorseStore.getState().horses[0].id;

    useHorseStore.getState().updateHorse(id, { ...sampleHorse, name: 'New' });
    expect(useHorseStore.getState().horses[0].id).toBe(id);
  });

  it('getHorseById returns the correct horse', () => {
    const { addHorse } = useHorseStore.getState();
    addHorse(sampleHorse);
    const id = useHorseStore.getState().horses[0].id;

    const found = useHorseStore.getState().getHorseById(id);
    expect(found).toBeDefined();
    expect(found?.name).toBe('TestHorse');
  });

  it('getHorseById returns undefined for unknown id', () => {
    const found = useHorseStore.getState().getHorseById('does-not-exist');
    expect(found).toBeUndefined();
  });

  it('addHorse preserves all fields', () => {
    useHorseStore.getState().addHorse(sampleHorse);
    const horse = useHorseStore.getState().horses[0];
    expect(horse.breed).toBe(sampleHorse.breed);
    expect(horse.difficulty).toBe(sampleHorse.difficulty);
    expect(horse.weight).toBe(sampleHorse.weight);
    expect(horse.dateOfBirth).toBe(sampleHorse.dateOfBirth);
    expect(horse.about).toBe(sampleHorse.about);
    expect(horse.inTraining).toBe(sampleHorse.inTraining);
    expect(horse.recommendedFor).toBe(sampleHorse.recommendedFor);
  });

  it('updateHorse does nothing if the ID is not found', () => {
    const { addHorse, updateHorse } = useHorseStore.getState();
    addHorse(sampleHorse); // Adds a horse with a real ID
    
    const initialHorses = [...useHorseStore.getState().horses];
    
    // Try to update a non-existent ID
    updateHorse('999', { ...sampleHorse, name: 'Ghost' });
    
    const finalHorses = useHorseStore.getState().horses;
    
    // Verify nothing changed
    expect(finalHorses).toEqual(initialHorses);
  });


});