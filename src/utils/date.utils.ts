// src/utils/date.utils.ts
// IST-aware date helpers. All dates in this app are stored as YYYY-MM-DD strings.
// Use these instead of new Date().toISOString() to avoid UTC-offset bugs.

const IST_LOCALE = 'en-CA'; // en-CA gives YYYY-MM-DD format natively
const IST_TZ = 'Asia/Kolkata';

/**
 * Returns today's date as a YYYY-MM-DD string in IST.
 * Safe to use as default value for <input type="date">.
 * Never use new Date().toISOString().split('T')[0] — that's UTC and wrong before 5:30 AM IST.
 */
export const getTodayIST = (): string => {
    return new Date().toLocaleDateString(IST_LOCALE, { timeZone: IST_TZ });
};

/**
 * Returns the YYYY-MM-DD string for today in IST (alias for clarity in filter logic).
 */
export const getTodayISTString = getTodayIST;

/**
 * Checks whether a given YYYY-MM-DD string equals today's date in IST.
 */
export const isToday = (dateStr: string): boolean => {
    return dateStr === getTodayIST();
};