// src/services/auth.service.ts
// Mock authentication layer managing operator session as per global-rules.md.

import { LOCAL_STORAGE_KEYS } from '@/constants';

export interface Operator {
  email: string;
  name: string;
}

/**
 * Service to handle operator logins and authentication states.
 */
export const AuthService = {
  /**
   * Log in using mock operator email & password.
   */
  login: async (email: string, password: string): Promise<Operator> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email.toLowerCase() === 'operator@tanker.com' && password === 'password123') {
          const operator: Operator = {
            email: 'operator@tanker.com',
            name: 'Rajesh (Operator)',
          };
          localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, JSON.stringify(operator));
          resolve(operator);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500); // Small delay to feel realistic
    });
  },

  /**
   * Logs out the active operator session.
   */
  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH);
      resolve();
    });
  },

  /**
   * Checks if an operator session is currently active.
   */
  getCurrentOperator: (): Operator | null => {
    if (typeof window === 'undefined') return null;
    const sessionStr = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH);
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  },

  /**
   * Checks if the operator is authenticated.
   */
  isAuthenticated: (): boolean => {
    return AuthService.getCurrentOperator() !== null;
  },
};
