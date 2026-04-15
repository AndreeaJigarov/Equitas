// src/utils/CookieUtils.ts

/**
 * Saves the selected horse ID to a cookie so it persists on refresh.
 */
export const setLastViewedHorseId = (id: string) => {
  // Sets cookie for 24 hours 
  document.cookie = `lastHorseId=${id}; max-age=86400; path=/; SameSite=Strict`;
};

/**
 * Retrieves the horse ID from cookies if it exists.
 */
export const getLastViewedHorseId = (): string | null => {
  const match = document.cookie.match(new RegExp('(^| )lastHorseId=([^;]+)'));
  return match ? match[2] : null;
};


//  to know how many times each one was viewed
export const incrementHorseViewCount = (id: string) => {
  const key = `viewCount_${id}`;
  const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`));
  const current = match ? parseInt(match[2]) : 0;
  document.cookie = `${key}=${current + 1}; max-age=604800; path=/; SameSite=Strict`;
};

export const getHorseViewCount = (id: string): number => {
  const key = `viewCount_${id}`;
  const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`));
  return match ? parseInt(match[2]) : 0;
};