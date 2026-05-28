'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import { ClientService } from '@/services/client.service';
import { Client } from '@/types/client.types';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import { ROUTES } from '@/constants';
import { useToastStore } from '@/store/toast.store';

interface EditClientViewProps {
  params: Promise<{ id: string }>;
}

export const EditClientView: React.FC<EditClientViewProps> = ({ params }) => {
  const { id: clientId } = use(params);
  const t = useTranslations('Clients');
  const tCommon = useTranslations('Common');
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      const data = await ClientService.getClientById(clientId);
      if (!data) { router.push(ROUTES.CLIENTS); return; }
      setClient(data);
      setName(data.name);
      setPhone(data.phone);
      setAddress(data.address);
      setDefaultPrice(data.default_price_per_tanker.toString());
      setLoading(false);
    };
    fetchClient();
  }, [clientId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) return setFormError(t('validationName'));
    if (!phone.trim() || phone.length < 10) return setFormError(t('validationPhone'));
    if (!address.trim()) return setFormError(t('validationAddress'));

    const priceNum = parseFloat(defaultPrice);
    if (isNaN(priceNum) || priceNum <= 0) return setFormError(t('validationPrice'));

    const { addToast } = useToastStore();
    const tToast = useTranslations('Toast');

    setFormSaving(true);
    try {
      await ClientService.updateClient(clientId, {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        default_price_per_tanker: priceNum,
      });
      addToast(tToast('clientUpdated'), 'success');
      router.push(`${ROUTES.CLIENTS}/${clientId}`);
    } catch {
      setFormError(t('saveError'));
    } finally {
      setFormSaving(false);
    }
  };

  if (loading || !client) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div
            className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#1A3D63', borderTopColor: 'transparent' }}
          />
          <span className="text-xs font-medium" style={{ color: '#4A7FA7' }}>
            {tCommon('loading')}
          </span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-5 max-w-xl mx-auto w-full">

        {/* Page header */}
        <div
          className="flex items-center gap-3 pb-4"
          style={{ borderBottom: '1px solid #EEF5FB' }}
        >
          <button
            type="button"
            onClick={() => router.push(`${ROUTES.CLIENTS}/${clientId}`)}
            className="flex items-center justify-center w-8 h-8 rounded-xl cursor-pointer transition-all shrink-0"
            style={{ background: '#EEF5FB', color: '#1A3D63' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#D0E4F2';
              (e.currentTarget as HTMLButtonElement).style.color = '#0A1931';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#EEF5FB';
              (e.currentTarget as HTMLButtonElement).style.color = '#1A3D63';
            }}
            aria-label={tCommon('back')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h2
              className="text-lg font-bold leading-tight"
              style={{ color: '#0A1931' }}
            >
              {t('editClientTitle')}
            </h2>
            <p
              className="text-[10px] font-bold uppercase tracking-widest mt-0.5"
              style={{ color: '#4A7FA7' }}
            >
              {client.name}
            </p>
          </div>
        </div>

        {/* Form card */}
        <div
          className="p-5 sm:p-6"
          style={{
            background: '#FFFFFF',
            border: '1px solid #D0E4F2',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(10,25,49,0.06)',
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {formError && (
              <div
                className="px-4 py-3 rounded-xl text-xs font-semibold"
                style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#C0392B' }}
              >
                {formError}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: '#1A3D63' }}
              >
                {t('nameLabel')}
              </label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: '#1A3D63' }}
              >
                {t('phoneLabel')}
              </label>
              <input type="tel" required maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} className="input" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: '#1A3D63' }}
              >
                {t('addressLabel')}
              </label>
              <textarea required rows={2} value={address} onChange={(e) => setAddress(e.target.value)} className="input resize-none" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: '#1A3D63' }}
              >
                {t('defaultPriceLabel')}
              </label>
              <input type="number" required min={1} value={defaultPrice} onChange={(e) => setDefaultPrice(e.target.value)} className="input" />
            </div>

            {/* Warning banner */}
            <div
              className="px-4 py-3 flex gap-3 rounded-xl"
              style={{
                background: '#EEF5FB',
                border: '1px solid #D0E4F2',
                color: '#1A3D63',
              }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#4A7FA7' }} />
              <p className="text-xs font-medium leading-relaxed">{t('priceWarning')}</p>
            </div>

            {/* CTAs */}
            <div
              className="flex gap-3 pt-2"
              style={{ borderTop: '1px solid #EEF5FB' }}
            >
              <button
                type="button"
                onClick={() => router.push(`${ROUTES.CLIENTS}/${clientId}`)}
                className="btn btn-secondary flex-1"
              >
                {tCommon('cancel')}
              </button>
              <button
                type="submit"
                disabled={formSaving}
                className="btn btn-primary flex-1"
              >
                {formSaving ? tCommon('saving') : tCommon('save')}
              </button>
            </div>

          </form>
        </div>

      </div>
    </Layout>
  );
};

export default EditClientView;
