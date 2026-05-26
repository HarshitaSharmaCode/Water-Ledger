'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './Header';
import { AuthService } from '@/services/auth.service';
import { ROUTES } from '@/constants';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const t = useTranslations('Navbar');
  const tCommon = useTranslations('Common');
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authStatus = AuthService.isAuthenticated();
    if (!authStatus) {
      router.push(ROUTES.LOGIN);
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div
        className="flex flex-col flex-1 items-center justify-center min-h-screen"
        style={{ background: '#F6FAFD' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#1A3D63', borderTopColor: 'transparent' }}
          />
          <p className="font-medium text-sm" style={{ color: '#4A7FA7' }}>
            {tCommon('loading')}
          </p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: t('dashboard'), path: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: t('clients'),   path: ROUTES.CLIENTS,   icon: Users },
  ];

  return (
    <div
      className="flex flex-col min-h-screen pb-20 md:pb-0"
      style={{ background: '#F6FAFD', color: '#0A1931' }}
    >

      {/* Top Header */}
      <Header />

      {/* Body — spacing tokens: --spacing-5 = 1.375rem, --spacing-8 = 2.25rem, --spacing-10 = 3rem */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-10 py-7 md:py-10 flex gap-6 md:gap-8">

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div
            className="sticky flex flex-col gap-1 p-2"
            style={{
              top: 'calc(3.5rem + 1.25rem)',
              background: '#FFFFFF',
              border: '1px solid #D0E4F2',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(10,25,49,0.06)',
            }}
          >
            <p
              className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: '#4A7FA7' }}
            >
              Menu
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => router.push(item.path)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                  style={
                    isActive
                      ? {
                          background: 'linear-gradient(135deg, #0A1931, #1A3D63)',
                          color: '#FFFFFF',
                          boxShadow: '0 4px 12px rgba(10,25,49,0.25)',
                        }
                      : {
                          color: '#1A3D63',
                          background: 'transparent',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = '#EEF5FB';
                      (e.currentTarget as HTMLButtonElement).style.color = '#0A1931';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      (e.currentTarget as HTMLButtonElement).style.color = '#1A3D63';
                    }
                  }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex-1 flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-3 left-3 right-3 h-16 z-40 flex items-center justify-around px-2"
        style={{
          background: '#0A1931',
          border: '1px solid rgba(74,127,167,0.25)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(10,25,49,0.35)',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => router.push(item.path)}
              className="relative flex flex-col items-center justify-center flex-1 h-full cursor-pointer select-none active:scale-95 transition-transform"
              style={{ minHeight: '48px' }}
            >
              <div
                className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, #1A3D63, #4A7FA7)',
                        color: '#FFFFFF',
                        boxShadow: '0 2px 8px rgba(74,127,167,0.4)',
                      }
                    : { color: '#4A7FA7' }
                }
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className="text-[9px] font-bold mt-0.5 tracking-tight transition-colors duration-200"
                style={{ color: isActive ? '#F6FAFD' : '#4A7FA7' }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
};

export default Layout;
