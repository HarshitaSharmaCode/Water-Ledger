'use client';

import React, { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { useLanguageStore } from '@/store/language.store';
import { AuthService } from '@/services/auth.service';
import enMessages from '@/locales/en.json';
import hiMessages from '@/locales/hi.json';

const messagesMap = {
  en: enMessages,
  hi: hiMessages,
};

interface AppLanguageProviderProps {
  children: React.ReactNode;
}

export const AppLanguageProvider: React.FC<AppLanguageProviderProps> = ({ children }) => {
  const language = useLanguageStore((state) => state.language);
  const [mounted, setMounted] = useState(false);

  // Avoid SSR hydration mismatches by waiting for the client mount.
  // Also initialise Supabase auth session once on mount.
  useEffect(() => {
    setMounted(true);
    const unsubscribe = AuthService.init();
    return () => {
      unsubscribe();
    };
  }, []);

  const activeLang = mounted ? language : 'en';
  const activeMessages = messagesMap[activeLang];

  return (
    <NextIntlClientProvider
      locale={activeLang}
      messages={activeMessages}
      timeZone="Asia/Kolkata"
    >
      {children}
    </NextIntlClientProvider>
  );
};
export default AppLanguageProvider;
