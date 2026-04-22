import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    setLastViewedHorseId,
    getLastViewedHorseId,
    incrementHorseViewCount,
    getHorseViewCount,
    setSessionStart,
    getSessionDuration,
} from '../utils/CookieUtils';

// Helper: reset all cookies between tests
const clearAllCookies = () => {
    document.cookie.split(';').forEach((c) => {
        const key = c.split('=')[0].trim();
        document.cookie = `${key}=; max-age=0; path=/`;
    });
};

describe('CookieUtils', () => {
    beforeEach(() => {
        clearAllCookies();
    });

    afterEach(() => {
        clearAllCookies();
        vi.restoreAllMocks();
    });

    // ── setLastViewedHorseId / getLastViewedHorseId ───────────────────────
    describe('setLastViewedHorseId & getLastViewedHorseId', () => {
        it('returns null when no cookie is set', () => {
            expect(getLastViewedHorseId()).toBeNull();
        });

        it('stores and retrieves a horse id', () => {
            setLastViewedHorseId('42');
            expect(getLastViewedHorseId()).toBe('42');
        });

        it('overwrites the previous horse id', () => {
            setLastViewedHorseId('1');
            setLastViewedHorseId('99');
            expect(getLastViewedHorseId()).toBe('99');
        });

        it('stores id with special characters correctly', () => {
            setLastViewedHorseId('horse-abc-123');
            expect(getLastViewedHorseId()).toBe('horse-abc-123');
        });
    });

    // ── incrementHorseViewCount / getHorseViewCount ───────────────────────
    describe('incrementHorseViewCount & getHorseViewCount', () => {
        it('returns 0 for a horse that has never been viewed', () => {
            expect(getHorseViewCount('horse-1')).toBe(0);
        });

        it('returns 1 after the first view', () => {
            incrementHorseViewCount('horse-1');
            expect(getHorseViewCount('horse-1')).toBe(1);
        });

        it('increments correctly on subsequent views', () => {
            incrementHorseViewCount('horse-1');
            incrementHorseViewCount('horse-1');
            incrementHorseViewCount('horse-1');
            expect(getHorseViewCount('horse-1')).toBe(3);
        });

        it('tracks counts separately for different horse ids', () => {
            incrementHorseViewCount('horse-A');
            incrementHorseViewCount('horse-A');
            incrementHorseViewCount('horse-B');
            expect(getHorseViewCount('horse-A')).toBe(2);
            expect(getHorseViewCount('horse-B')).toBe(1);
        });

        it('returns 0 for an id that has not been viewed, even if others have', () => {
            incrementHorseViewCount('horse-X');
            expect(getHorseViewCount('horse-Y')).toBe(0);
        });
    });

    // ── setSessionStart / getSessionDuration ─────────────────────────────
    describe('setSessionStart & getSessionDuration', () => {
        it('returns "0m" when no session cookie is set', () => {
            expect(getSessionDuration()).toBe('0m');
        });

        it('sets a session start cookie', () => {
            setSessionStart();
            expect(document.cookie).toContain('sessionStart=');
        });

        it('does not overwrite an existing session start cookie', () => {
            setSessionStart();
            const firstValue = document.cookie.match(/sessionStart=([^;]+)/)?.[1];

            setSessionStart(); // called again
            const secondValue = document.cookie.match(/sessionStart=([^;]+)/)?.[1];

            expect(firstValue).toBe(secondValue);
        });

        it('returns "0m" immediately after session starts (no time elapsed)', () => {
            setSessionStart();
            // Duration should be 0 minutes since it was just set
            expect(getSessionDuration()).toBe('0m');
        });

        it('returns correct duration when time has elapsed', () => {
            // Mock Date.now to simulate 90 seconds in the past as the session start
            const now = Date.now();
            const pastTimestamp = now - 90_000; // 90 seconds ago

            // Manually set the cookie to a past timestamp
            document.cookie = `sessionStart=${pastTimestamp}; path=/; SameSite=Strict`;

            const duration = getSessionDuration();
            // 90 seconds = 1 minute (Math.floor(90000/60000) = 1)
            expect(duration).toBe('1m');
        });

        it('returns "2m" for a session started 2.5 minutes ago', () => {
            const pastTimestamp = Date.now() - 150_000; // 150 seconds ago
            document.cookie = `sessionStart=${pastTimestamp}; path=/; SameSite=Strict`;
            expect(getSessionDuration()).toBe('2m');
        });
    });
});