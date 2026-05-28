'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/auth.store';
import { AuthService } from '@/services/auth.service';
import { ROUTES } from '@/constants';
import { useToastStore } from '@/store/toast.store';
// ADD to imports

export const ProfileSetupPage = () => {
    const t = useTranslations('profileSetup');
    const tCommon = useTranslations('Common');
    const router = useRouter();
    const { session, userProfile, isLoading } = useAuthStore();

    const [form, setForm] = useState({
        business_name: '',
        owner_name: '',
        phone: '',
        address: '',
        city: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isLoading) return;
        if (!session) { router.replace(ROUTES.LOGIN); return; }
        if (userProfile) { router.replace(ROUTES.DASHBOARD); return; }
    }, [isLoading, session, userProfile, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError('');
    };

    const handleSubmit = async () => {
        const { business_name, owner_name, phone, address, city } = form;
        if (!business_name.trim() || !owner_name.trim() || !phone.trim() || !address.trim() || !city.trim()) {
            setError(t('allFieldsRequired'));
            return;
        }
        if (!session?.user?.id) { setError(t('sessionExpired')); return; }

        const { addToast } = useToastStore();
        const tToast = useTranslations('Toast');

        setSubmitting(true);
        setError('');
        try {
            await AuthService.createUserProfile({
                business_name: business_name.trim(),
                owner_name: owner_name.trim(),
                phone: phone.trim(),
                address: address.trim(),
                city: city.trim(),
            });
            addToast(tToast('profileSetup'), 'success');
            router.push(ROUTES.DASHBOARD);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('setupFailed'));
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading || !session || userProfile) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0A1931 0%, #1A3D63 50%, #0A1931 100%)',
            }}>
                <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#1A3D63',
        marginBottom: 6,
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 14px',
        border: '1px solid #D0E4F2',
        borderRadius: 8,
        fontSize: '0.95rem',
        color: '#0A1931',
        background: '#fff',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s',
    };

    const fields: { name: keyof typeof form; labelKey: string; type?: string; autoComplete?: string }[] = [
        { name: 'business_name', labelKey: 'businessName', autoComplete: 'organization' },
        { name: 'owner_name', labelKey: 'ownerName', autoComplete: 'name' },
        { name: 'phone', labelKey: 'phone', type: 'tel', autoComplete: 'tel' },
        { name: 'address', labelKey: 'address', autoComplete: 'street-address' },
        { name: 'city', labelKey: 'city', autoComplete: 'address-level2' },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            background: 'linear-gradient(135deg, #0A1931 0%, #1A3D63 50%, #0A1931 100%)',
        }}>
            <div style={{ width: '100%', maxWidth: 460 }}>

                {/* Logo / App name */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                        🚰 {tCommon('appName')}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                        {t('subtitle')}
                    </div>
                </div>

                {/* Card */}
                <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #D0E4F2',
                    borderRadius: 20,
                    boxShadow: '0 12px 40px rgba(10,25,49,0.22), 0 0 0 1px rgba(10,25,49,0.07)',
                    overflow: 'hidden',
                }}>
                    {/* Top stripe */}
                    <div style={{
                        height: 4,
                        background: 'linear-gradient(90deg, #0A1931, #4A7FA7, #B3CFE5)',
                    }} />

                    <div style={{ padding: '32px 32px 36px' }}>
                        <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0A1931', margin: '0 0 6px' }}>
                            {t('title')}
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: '#4A7FA7', margin: '0 0 28px' }}>
                            {t('description')}
                        </p>

                        {/* Error banner */}
                        {error && (
                            <div style={{
                                background: '#FEF2F2',
                                border: '1px solid #FECACA',
                                color: '#C0392B',
                                borderRadius: 8,
                                padding: '10px 14px',
                                fontSize: '0.875rem',
                                marginBottom: 20,
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Fields */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {fields.map(({ name, labelKey, type = 'text', autoComplete }) => (
                                <div key={name}>
                                    <label style={labelStyle}>{t(labelKey)}</label>
                                    <input
                                        type={type}
                                        name={name}
                                        value={form[name]}
                                        onChange={handleChange}
                                        autoComplete={autoComplete}
                                        placeholder={t(`${labelKey}Placeholder`)}
                                        style={inputStyle}
                                        onFocus={e => (e.target.style.borderColor = '#4A7FA7')}
                                        onBlur={e => (e.target.style.borderColor = '#D0E4F2')}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            style={{
                                marginTop: 28,
                                width: '100%',
                                padding: '12px',
                                background: submitting ? '#93BFDF' : '#1A3D63',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                transition: 'background 0.15s',
                                letterSpacing: '0.02em',
                            }}
                            onMouseEnter={e => { if (!submitting) (e.currentTarget.style.background = '#0A1931'); }}
                            onMouseLeave={e => { if (!submitting) (e.currentTarget.style.background = '#1A3D63'); }}
                        >
                            {submitting ? t('saving') : t('saveAndContinue')}
                        </button>
                    </div>
                </div>

                {/* Step indicator */}
                <div style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>
                    {t('stepIndicator')}
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default ProfileSetupPage;