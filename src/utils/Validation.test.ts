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

    // ── NAME ──────────────────────────────────────────────────────────────
    it('errors when name is empty', () => {
        expect(validateHorse({ ...valid, name: '' }).name).toBeDefined();
    });

    it('errors when name is only whitespace', () => {
        expect(validateHorse({ ...valid, name: '   ' }).name).toBeDefined();
    });

    it('errors when name is 1 character (too short)', () => {
        expect(validateHorse({ ...valid, name: 'A' }).name).toBeDefined();
    });

    it('accepts name of exactly 2 characters', () => {
        expect(validateHorse({ ...valid, name: 'Bo' }).name).toBeUndefined();
    });

    it('errors when name exceeds 50 characters', () => {
        expect(validateHorse({ ...valid, name: 'A'.repeat(51) }).name).toBeDefined();
    });

    it('accepts name of exactly 50 characters', () => {
        expect(validateHorse({ ...valid, name: 'A'.repeat(50) }).name).toBeUndefined();
    });

    it('name error says "required" when empty', () => {
        expect(validateHorse({ ...valid, name: '' }).name).toMatch(/required/i);
    });

    it('name error mentions minimum length when too short', () => {
        expect(validateHorse({ ...valid, name: 'A' }).name).toMatch(/2/);
    });

    it('name error mentions max length when too long', () => {
        expect(validateHorse({ ...valid, name: 'A'.repeat(51) }).name).toMatch(/50/);
    });

    // ── BREED ─────────────────────────────────────────────────────────────
    it('errors when breed is empty', () => {
        expect(validateHorse({ ...valid, breed: '' }).breed).toBeDefined();
    });

    it('errors when breed is only whitespace', () => {
        expect(validateHorse({ ...valid, breed: '  ' }).breed).toBeDefined();
    });

    it('errors when breed is 1 character (too short)', () => {
        expect(validateHorse({ ...valid, breed: 'X' }).breed).toBeDefined();
    });

    it('accepts breed of exactly 2 characters', () => {
        expect(validateHorse({ ...valid, breed: 'QB' }).breed).toBeUndefined();
    });

    it('breed error says "required" when empty', () => {
        expect(validateHorse({ ...valid, breed: '' }).breed).toMatch(/required/i);
    });

    // ── WEIGHT ────────────────────────────────────────────────────────────
    it('errors when weight is 0 (falsy)', () => {
        expect(validateHorse({ ...valid, weight: 0 }).weight).toBeDefined();
    });

    it('errors when weight is below 200', () => {
        expect(validateHorse({ ...valid, weight: 199 }).weight).toBeDefined();
    });

    it('errors when weight exceeds 900', () => {
        expect(validateHorse({ ...valid, weight: 901 }).weight).toBeDefined();
    });

    it('accepts boundary weight of 200', () => {
        expect(validateHorse({ ...valid, weight: 200 }).weight).toBeUndefined();
    });

    it('accepts boundary weight of 900', () => {
        expect(validateHorse({ ...valid, weight: 900 }).weight).toBeUndefined();
    });

    it('accepts mid-range weight', () => {
        expect(validateHorse({ ...valid, weight: 550 }).weight).toBeUndefined();
    });

    it('weight error mentions 200 and 900 boundaries', () => {
        const msg = validateHorse({ ...valid, weight: 100 }).weight ?? '';
        expect(msg).toMatch(/200/);
        expect(msg).toMatch(/900/);
    });

    // ── DATE OF BIRTH ─────────────────────────────────────────────────────
    it('errors when dateOfBirth is empty', () => {
        expect(validateHorse({ ...valid, dateOfBirth: '' }).dateOfBirth).toBeDefined();
    });

    it('errors when dateOfBirth is in the future', () => {
        const future = new Date();
        future.setFullYear(future.getFullYear() + 1);
        const errs = validateHorse({ ...valid, dateOfBirth: future.toISOString().split('T')[0] });
        expect(errs.dateOfBirth).toBeDefined();
    });

    it('errors when dateOfBirth is an invalid string', () => {
        expect(validateHorse({ ...valid, dateOfBirth: 'not-a-date' }).dateOfBirth).toBeDefined();
    });

    it('accepts a valid past date', () => {
        expect(validateHorse({ ...valid, dateOfBirth: '2010-06-15' }).dateOfBirth).toBeUndefined();
    });

    // ── ABOUT ─────────────────────────────────────────────────────────────
    it('errors when about is empty', () => {
        expect(validateHorse({ ...valid, about: '' }).about).toBeDefined();
    });

    it('errors when about is only whitespace', () => {
        expect(validateHorse({ ...valid, about: '          ' }).about).toBeDefined();
    });

    it('errors when about is fewer than 10 characters', () => {
        expect(validateHorse({ ...valid, about: 'Short' }).about).toBeDefined();
    });

    it('accepts about of exactly 10 characters', () => {
        expect(validateHorse({ ...valid, about: '1234567890' }).about).toBeUndefined();
    });

    it('accepts about longer than 10 characters', () => {
        expect(validateHorse({ ...valid, about: 'This horse is great for training.' }).about).toBeUndefined();
    });

    // ── DIFFICULTY ────────────────────────────────────────────────────────
    it('errors when difficulty is empty string', () => {
        // @ts-expect-error intentional bad value
        expect(validateHorse({ ...valid, difficulty: '' }).difficulty).toBeDefined();
    });

    it('accepts Easy difficulty', () => {
        expect(validateHorse({ ...valid, difficulty: 'Easy' }).difficulty).toBeUndefined();
    });

    it('accepts Medium difficulty', () => {
        expect(validateHorse({ ...valid, difficulty: 'Medium' }).difficulty).toBeUndefined();
    });

    it('accepts Hard difficulty', () => {
        expect(validateHorse({ ...valid, difficulty: 'Hard' }).difficulty).toBeUndefined();
    });

    // ── RECOMMENDED FOR ───────────────────────────────────────────────────
    it('errors when recommendedFor is empty string', () => {
        // @ts-expect-error intentional bad value
        expect(validateHorse({ ...valid, recommendedFor: '' }).recommendedFor).toBeDefined();
    });

    it('accepts Children', () => {
        expect(validateHorse({ ...valid, recommendedFor: 'Children' }).recommendedFor).toBeUndefined();
    });

    it('accepts Adults', () => {
        expect(validateHorse({ ...valid, recommendedFor: 'Adults' }).recommendedFor).toBeUndefined();
    });

    it('accepts Both', () => {
        expect(validateHorse({ ...valid, recommendedFor: 'Both' }).recommendedFor).toBeUndefined();
    });

    // ── MULTIPLE / EDGE CASES ─────────────────────────────────────────────
    it('returns multiple errors when multiple fields are invalid', () => {
        const errs = validateHorse({ ...valid, name: '', breed: '', weight: 0, about: '' });
        expect(Object.keys(errs).length).toBeGreaterThanOrEqual(3);
    });

    it('returns only the relevant error, not extras, when just one field is invalid', () => {
        const errs = validateHorse({ ...valid, name: '' });
        expect(Object.keys(errs)).toEqual(['name']);
    });
});

describe('isFormValid', () => {
    it('returns true when there are no errors', () => {
        expect(isFormValid({})).toBe(true);
    });

    it('returns false when there is one error', () => {
        expect(isFormValid({ name: 'Name is required.' })).toBe(false);
    });

    it('returns false when there are multiple errors', () => {
        expect(isFormValid({ name: 'required', breed: 'required', weight: 'invalid' })).toBe(false);
    });
});