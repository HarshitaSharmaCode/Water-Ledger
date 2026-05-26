// src/store/language.store.ts
// Handles UI language preferences. Persists selection in localStorage under 'tiwt_language'.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LOCAL_STORAGE_KEYS } from '@/constants';

export type Language = 'en' | 'hi';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      toggleLanguage: () =>
        set((state) => ({
          language: state.language === 'en' ? 'hi' : 'en',
        })),
    }),
    {
      name: LOCAL_STORAGE_KEYS.LANGUAGE,
    }
  )
);
