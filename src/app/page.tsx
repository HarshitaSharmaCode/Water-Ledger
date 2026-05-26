'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Droplet, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '@/services/auth.service';
import { ROUTES } from '@/constants';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export const Home: React.FC = () => {
  const t = useTranslations('Auth');
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      await AuthService.login(email, password);
      router.push(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.message || 'invalidCredentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col flex-1 min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0A1931 0%, #1A3D63 50%, #0A1931 100%)',
      }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74,127,167,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Language toggle — top right */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle />
      </div>

      {/* Content wrapper — spacing tokens: --spacing-8=2.25rem(px-8), --spacing-10=3rem(py-10), --spacing-16=5rem(py-16) */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-10 sm:py-16">

        {/* Login Card */}
        <div
          className="w-full max-w-sm overflow-hidden"
          style={{
            background: '#FFFFFF',
            border: '1px solid #D0E4F2',
            borderRadius: '20px',
            boxShadow: '0 12px 40px rgba(10,25,49,0.22), 0 0 0 1px rgba(10,25,49,0.07)',
          }}
        >
          {/* Card top stripe */}
          <div
            style={{
              height: '4px',
              background: 'linear-gradient(90deg, #0A1931, #4A7FA7, #B3CFE5)',
            }}
          />

          <div className="flex flex-col gap-7 px-8 py-9">

            {/* Brand */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className="flex items-center justify-center w-14 h-14 text-white"
                style={{
                  background: 'linear-gradient(135deg, #0A1931, #1A3D63)',
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(10,25,49,0.35)',
                }}
              >
                <Droplet className="w-7 h-7 fill-current" />
              </div>
              <div>
                <h1
                  className="text-lg font-bold leading-tight tracking-tight"
                  style={{ color: '#0A1931' }}
                >
                  {t('title')}
                </h1>
                <p
                  className="text-xs font-semibold mt-1 tracking-widest uppercase"
                  style={{ color: '#4A7FA7' }}
                >
                  {t('subtitle')}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Error Banner */}
              {error && (
                <div
                  className="px-4 py-3 rounded-xl text-xs font-semibold"
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#C0392B',
                  }}
                >
                  {t(error)}
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#1A3D63' }}
                >
                  {t('email')}
                </label>
                <div className="relative">
                  <span
                    className="absolute inset-y-0 left-0 pl-3.5 flex items-center"
                    style={{ color: '#4A7FA7' }}
                  >
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="operator@tanker.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input input-icon-left"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#1A3D63' }}
                >
                  {t('password')}
                </label>
                <div className="relative">
                  <span
                    className="absolute inset-y-0 left-0 pl-3.5 flex items-center"
                    style={{ color: '#4A7FA7' }}
                  >
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-icon-left input-icon-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer transition-colors"
                    style={{ color: '#4A7FA7' }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full mt-1"
              >
                {loading ? t('signingIn') : t('login')}
              </button>
            </form>

            {/* Demo credentials hint */}
            <div
              className="px-5 py-4 rounded-xl text-center"
              style={{
                background: '#EEF5FB',
                border: '1px solid #D0E4F2',
              }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-widest block mb-1.5"
                style={{ color: '#4A7FA7' }}
              >
                Demo Credentials
              </span>
              <code
                className="text-xs block select-all"
                style={{ color: '#1A3D63' }}
              >
                operator@tanker.com
              </code>
              <code
                className="text-xs block select-all mt-0.5"
                style={{ color: '#1A3D63' }}
              >
                password123
              </code>
            </div>

          </div>
        </div>

        {/* Footer text */}
        <p
          className="mt-6 text-xs font-medium text-center"
          style={{ color: 'rgba(179,207,229,0.7)' }}
        >
          The Indian Water Tanker · Operator Portal
        </p>
      </div>
    </div>
  );
};

export default Home;
