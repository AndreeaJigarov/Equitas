import { describe, it, expect } from 'vitest';
import { validateHorse, isFormValid } from '../utils/Validation';
import { type HorseFormData } from '../types/Horse';

const valid: HorseFormData = {
  name: 'Bella',
  breed: 'Andalusian',
  difficulty: 'Medium',
  weight: 480,
  dateOfBirth: '2017-04-12',
  about: 'Calm and responsive mare.',
  isAvailable: true,
  inTraining: false,
  recommendedFor: 'Both',
  
};

describe('validateHorse', () => {
  it('returns no errors for valid data', () => {
    expect(validateHorse(valid)).toEqual({});
  });

  // NAME
  it('errors when name is empty', () => {
    const errs = validateHorse({ ...valid, name: '' });
    expect(errs.name).toBeDefined();
  });

  it('errors when name is only whitespace', () => {
    const errs = validateHorse({ ...valid, name: '   ' });
    expect(errs.name).toBeDefined();
  });

  it('errors when name is too short', () => {
    const errs = validateHorse({ ...valid, name: 'A' });
    expect(errs.name).toBeDefined();
  });

  it('errors when name exceeds 50 characters', () => {
    const errs = validateHorse({ ...valid, name: 'A'.repeat(51) });
    expect(errs.name).toBeDefined();
  });

  it('accepts name of exactly 2 characters', () => {
    const errs = validateHorse({ ...valid, name: 'Bo' });
    expect(errs.name).toBeUndefined();
  });

  // BREED
  it('errors when breed is empty', () => {
    const errs = validateHorse({ ...valid, breed: '' });
    expect(errs.breed).toBeDefined();
  });

  it('errors when breed is too short', () => {
    const errs = validateHorse({ ...valid, breed: 'X' });
    expect(errs.breed).toBeDefined();
  });

  // WEIGHT
  it('errors when weight is 0', () => {
    const errs = validateHorse({ ...valid, weight: 0 });
    expect(errs.weight).toBeDefined();
  });

  it('errors when weight is below 200', () => {
    const errs = validateHorse({ ...valid, weight: 199 });
    expect(errs.weight).toBeDefined();
  });

  it('errors when weight exceeds 900', () => {
    const errs = validateHorse({ ...valid, weight: 901 });
    expect(errs.weight).toBeDefined();
  });

  it('accepts boundary weight of 200', () => {
    const errs = validateHorse({ ...valid, weight: 200 });
    expect(errs.weight).toBeUndefined();
  });

  it('accepts boundary weight of 900', () => {
    const errs = validateHorse({ ...valid, weight: 900 });
    expect(errs.weight).toBeUndefined();
  });

  // DATE OF BIRTH
  it('errors when dateOfBirth is empty', () => {
    const errs = validateHorse({ ...valid, dateOfBirth: '' });
    expect(errs.dateOfBirth).toBeDefined();
  });

  it('errors when dateOfBirth is in the future', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const errs = validateHorse({ ...valid, dateOfBirth: future.toISOString().split('T')[0] });
    expect(errs.dateOfBirth).toBeDefined();
  });

  it('errors when dateOfBirth is invalid string', () => {
    const errs = validateHorse({ ...valid, dateOfBirth: 'not-a-date' });
    expect(errs.dateOfBirth).toBeDefined();
  });

  // ABOUT
  it('errors when about is empty', () => {
    const errs = validateHorse({ ...valid, about: '' });
    expect(errs.about).toBeDefined();
  });

  it('errors when about is too short', () => {
    const errs = validateHorse({ ...valid, about: 'Short' });
    expect(errs.about).toBeDefined();
  });

  it('accepts about of exactly 10 characters', () => {
    const errs = validateHorse({ ...valid, about: '1234567890' });
    expect(errs.about).toBeUndefined();
  });

  // DIFFICULTY
  it('errors when difficulty is missing', () => {
    // @ts-expect-error intentional bad value
    const errs = validateHorse({ ...valid, difficulty: '' });
    expect(errs.difficulty).toBeDefined();
  });

  // RECOMMENDED FOR
  it('errors when recommendedFor is missing', () => {
    // @ts-expect-error intentional bad value
    const errs = validateHorse({ ...valid, recommendedFor: '' });
    expect(errs.recommendedFor).toBeDefined();
  });
});

describe('isFormValid', () => {
  it('returns true when no errors', () => {
    expect(isFormValid({})).toBe(true);
  });

  it('returns false when errors exist', () => {
    expect(isFormValid({ name: 'required' })).toBe(false);
  });
});