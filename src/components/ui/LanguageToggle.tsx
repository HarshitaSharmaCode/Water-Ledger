'use client';

import React, { useEffect, useState } from 'react';
import { useLanguageStore } from '@/store/language.store';

export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div
        className="w-[104px] h-[34px] rounded-full animate-pulse"
        style={{ background: 'rgba(74,127,167,0.15)', border: '1px solid rgba(74,127,167,0.2)' }}
      />
    );
  }

  /* Detect if we are inside a navy header (dark) or a light page */
  const isDarkContext = typeof window !== 'undefined'
    ? false // runtime detection not needed — we use explicit styles
    : false;

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="relative flex items-center justify-between w-[104px] h-[34px] px-1 rounded-full cursor-pointer select-none transition-all duration-200 active:scale-95"
      style={{
        background: 'rgba(74,127,167,0.15)',
        border: '1px solid rgba(74,127,167,0.3)',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(74,127,167,0.55)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(74,127,167,0.3)';
      }}
      aria-label={`Switch language. Current: ${language === 'en' ? 'English' : 'Hindi'}`}
    >
      {/* Sliding indicator */}
      <span
        className="absolute top-[3px] bottom-[3px] w-[48px] rounded-full transition-all duration-200 ease-out"
        style={{
          background: 'linear-gradient(135deg, #0A1931, #1A3D63)',
          left: language === 'en' ? '3px' : '52px',
          boxShadow: '0 2px 6px rgba(10,25,49,0.35)',
        }}
      />

      {/* EN label */}
      <span
        className="flex-1 text-center text-[11px] font-bold z-10 transition-colors duration-200"
        style={{ color: language === 'en' ? '#FFFFFF' : '#4A7FA7' }}
      >
        EN
      </span>

      {/* HI label */}
      <span
        className="flex-1 text-center text-[11px] font-bold z-10 transition-colors duration-200"
        style={{ color: language === 'hi' ? '#FFFFFF' : '#4A7FA7' }}
      >
        हिन्दी
      </span>
    </button>
  );
};
