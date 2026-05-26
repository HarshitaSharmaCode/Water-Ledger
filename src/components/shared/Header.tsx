'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Droplet, LogOut } from 'lucide-react';
import { LanguageToggle } from '../ui/LanguageToggle';
import { AuthService } from '@/services/auth.service';
import { ROUTES } from '@/constants';

export const Header: React.FC = () => {
  const t = useTranslations('Navbar');
  const tAuth = useTranslations('Auth');
  const router = useRouter();

  const handleLogout = async () => {
    await AuthService.logout();
    router.push(ROUTES.LOGIN);
  };

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        background: '#0A1931',
        borderBottom: '1px solid rgba(74,127,167,0.2)',
        boxShadow: '0 2px 12px rgba(10,25,49,0.25)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Brand */}
        <button
          type="button"
          onClick={() => router.push(ROUTES.DASHBOARD)}
          className="flex items-center gap-2.5 cursor-pointer select-none active:scale-95 transition-transform"
        >
          <div
            className="flex items-center justify-center w-8 h-8 text-white shrink-0"
            style={{
              background: 'linear-gradient(135deg, #1A3D63, #4A7FA7)',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(74,127,167,0.35)',
            }}
          >
            <Droplet className="w-4 h-4 fill-current" />
          </div>
          <div className="flex flex-col leading-none">
            <span
              className="text-sm font-bold tracking-tight"
              style={{ color: '#F6FAFD' }}
            >
              {tAuth('title')}
            </span>
            <span
              className="text-[10px] font-medium mt-0.5"
              style={{ color: '#4A7FA7' }}
            >
              {tAuth('subtitle')}
            </span>
          </div>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <LanguageToggle />

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-all"
            style={{
              color: '#B3CFE5',
              border: '1px solid rgba(74,127,167,0.25)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(74,127,167,0.15)';
              (e.currentTarget as HTMLButtonElement).style.color = '#F6FAFD';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = '#B3CFE5';
            }}
            title={t('logout')}
            aria-label={t('logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
