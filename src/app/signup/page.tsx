'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Droplet, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useToastStore } from '@/store/toast.store';
// ADD to imports

export const SignupPage: React.FC = () => {
    const t = useTranslations('Auth');
    const router = useRouter();
    const { session, userProfile, isLoading } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect already-authenticated users
    useEffect(() => {
        if (isLoading) return;
        if (session && userProfile) {
            router.replace(ROUTES.DASHBOARD);
        } else if (session && !userProfile) {
            router.replace(ROUTES.PROFILE_SETUP);
        }
    }, [isLoading, session, userProfile, router]);

    // ADD inside component, after existing hooks
    const { addToast } = useToastStore();
    const tToast = useTranslations('Toast');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        setError(null);

        try {
            await AuthService.signUp(email, password);
            addToast(tToast('signupSuccess'), 'success');
            router.push(ROUTES.PROFILE_SETUP);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message.toLowerCase() : '';
            if (msg.includes('rate limit')) {
                setError('rateLimitExceeded');
            } else {
                setError('signUpFailed');
            }
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
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74,127,167,0.18) 0%, transparent 70%)',
                }}
            />

            <div className="absolute top-4 right-4 z-50">
                <LanguageToggle />
            </div>

            <div className="relative flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-10 sm:py-16">
                <div
                    className="w-full max-w-sm overflow-hidden"
                    style={{
                        background: '#FFFFFF',
                        border: '1px solid #D0E4F2',
                        borderRadius: '20px',
                        boxShadow: '0 12px 40px rgba(10,25,49,0.22), 0 0 0 1px rgba(10,25,49,0.07)',
                    }}
                >
                    <div style={{ height: '4px', background: 'linear-gradient(90deg, #0A1931, #4A7FA7, #B3CFE5)' }} />

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
                                <h1 className="text-lg font-bold leading-tight tracking-tight" style={{ color: '#0A1931' }}>
                                    {t('title')}
                                </h1>
                                <p className="text-xs font-semibold mt-1 tracking-widest uppercase" style={{ color: '#4A7FA7' }}>
                                    {t('createAccount')}
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {error && (
                                <div
                                    className="px-4 py-3 rounded-xl text-xs font-semibold"
                                    style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#C0392B' }}
                                >
                                    {t(error as Parameters<typeof t>[0])}
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1A3D63' }}>
                                    {t('email')}
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center" style={{ color: '#4A7FA7' }}>
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

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1A3D63' }}>
                                    {t('password')}
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center" style={{ color: '#4A7FA7' }}>
                                        <Lock className="w-4 h-4" />
                                    </span>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
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

                            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-1">
                                {loading ? t('signingUp') : t('signUp')}
                            </button>
                        </form>

                        {/* Login link */}
                        <p className="text-center text-xs" style={{ color: '#4A7FA7' }}>
                            {t('alreadyHaveAccount')}{' '}
                            <button
                                type="button"
                                onClick={() => router.push(ROUTES.LOGIN)}
                                className="font-bold underline cursor-pointer"
                                style={{ color: '#1A3D63' }}
                            >
                                {t('login')}
                            </button>
                        </p>

                    </div>
                </div>

                <p className="mt-6 text-xs font-medium text-center" style={{ color: 'rgba(179,207,229,0.7)' }}>
                    The Indian Water Tanker · Operator Portal
                </p>
            </div>
        </div>
    );
};

export default SignupPage;