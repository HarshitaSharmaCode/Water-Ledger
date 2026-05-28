'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import { ClientService } from '@/services/client.service';
import { OrderService } from '@/services/order.service';
import { Client } from '@/types/client.types';
import { LocationType } from '@/types/order.types';
import { ChevronLeft, Calendar, MapPin, PhoneCall, Truck, IndianRupee, Notebook } from 'lucide-react';
import { ROUTES } from '@/constants';
import { getTodayIST } from '@/utils/date.utils';
import { useToastStore } from '@/store/toast.store';

interface OrderEntryViewProps {
  params: Promise<{ id: string }>;
}

export const OrderEntryView: React.FC<OrderEntryViewProps> = ({ params }) => {
  const { id: clientId } = use(params);
  const t = useTranslations('Order');
  const tCommon = useTranslations('Common');
  const tToast = useTranslations('Toast');
  const router = useRouter();
  const { addToast } = useToastStore();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState('');
  const [locationType, setLocationType] = useState<LocationType>('home');
  const [locationOther, setLocationOther] = useState('');
  const [calledBy, setCalledBy] = useState('');
  const [tankerCount, setTankerCount] = useState('1');
  const [pricePerTanker, setPricePerTanker] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      const data = await ClientService.getClientById(clientId);
      if (!data) { router.push(ROUTES.CLIENTS); return; }
      setClient(data);
      setPricePerTanker(data.default_price_per_tanker.toString());
      setCalledBy(data.name);
      setDate(getTodayIST());
      setLoading(false);
    };
    fetchClient();
  }, [clientId, router]);

  const tankers = parseInt(tankerCount) || 0;
  const rate = parseFloat(pricePerTanker) || 0;
  const totalAmount = tankers * rate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!date) return setFormError('Select a valid date');
    if (locationType === 'other' && !locationOther.trim()) return setFormError(t('validationOtherLocation'));
    if (!calledBy.trim()) return setFormError(t('validationCaller'));
    if (tankers <= 0) return setFormError(t('validationTankers'));
    if (rate <= 0) return setFormError(t('validationPrice'));



    setFormSaving(true);
    try {
      await OrderService.createOrder({
        client_id: clientId,
        order_date: date,
        location_type: locationType,
        location_other: locationType === 'other' ? locationOther.trim() : null,
        called_by: calledBy.trim(),
        tanker_count: tankers,
        price_per_tanker: rate,
        order_amount: totalAmount,
        note: note.trim() || null,
      });
      addToast(tToast('orderAdded'), 'success');
      router.push(`${ROUTES.CLIENTS}/${clientId}`);
    } catch {
      addToast(tToast('orderFailed'), 'error');
      setFormError('Could not save order. Please try again.');
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
              {t('title')}
            </h2>
            <p
              className="text-[10px] font-bold uppercase tracking-widest mt-0.5"
              style={{ color: '#4A7FA7' }}
            >
              {client.name}
            </p>
          </div>
        </div>

        {/* Form Card */}
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

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: '#1A3D63' }}
              >
                <Calendar className="w-3.5 h-3.5" style={{ color: '#4A7FA7' }} />
                {t('dateLabel')}
              </label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input" />
            </div>

            {/* Location type toggle */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: '#1A3D63' }}
              >
                <MapPin className="w-3.5 h-3.5" style={{ color: '#4A7FA7' }} />
                {t('locationTypeLabel')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLocationType('home')}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  style={
                    locationType === 'home'
                      ? {
                        background: 'linear-gradient(135deg, #0A1931, #1A3D63)',
                        border: '1px solid #0A1931',
                        color: '#FFFFFF',
                        boxShadow: '0 3px 10px rgba(10,25,49,0.25)',
                      }
                      : {
                        background: '#EEF5FB',
                        border: '1px solid #D0E4F2',
                        color: '#1A3D63',
                      }
                  }
                >
                  {tCommon('home')}
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType('other')}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  style={
                    locationType === 'other'
                      ? {
                        background: 'linear-gradient(135deg, #0A1931, #1A3D63)',
                        border: '1px solid #0A1931',
                        color: '#FFFFFF',
                        boxShadow: '0 3px 10px rgba(10,25,49,0.25)',
                      }
                      : {
                        background: '#EEF5FB',
                        border: '1px solid #D0E4F2',
                        color: '#1A3D63',
                      }
                  }
                >
                  {tCommon('other')}
                </button>
              </div>
            </div>

            {locationType === 'other' && (
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#1A3D63' }}
                >
                  {t('locationOtherLabel')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block D Construction site"
                  value={locationOther}
                  onChange={(e) => setLocationOther(e.target.value)}
                  className="input"
                />
              </div>
            )}

            {/* Called by */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: '#1A3D63' }}
              >
                <PhoneCall className="w-3.5 h-3.5" style={{ color: '#4A7FA7' }} />
                {t('calledByLabel')}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Kumar"
                value={calledBy}
                onChange={(e) => setCalledBy(e.target.value)}
                className="input"
              />
            </div>

            {/* Tanker count + price per tanker */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  style={{ color: '#1A3D63' }}
                >
                  <Truck className="w-3.5 h-3.5" style={{ color: '#4A7FA7' }} />
                  {t('tankerCountLabel')}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={tankerCount}
                  onChange={(e) => setTankerCount(e.target.value)}
                  className="input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  style={{ color: '#1A3D63' }}
                >
                  <IndianRupee className="w-3.5 h-3.5" style={{ color: '#4A7FA7' }} />
                  {t('pricePerTankerLabel')}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={pricePerTanker}
                  onChange={(e) => setPricePerTanker(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            {/* Calculated total — hero strip */}
            <div
              className="px-4 py-4 flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, #0A1931 0%, #1A3D63 100%)',
                borderRadius: '12px',
                boxShadow: '0 4px 14px rgba(10,25,49,0.22)',
              }}
            >
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: 'rgba(179,207,229,0.85)' }}
              >
                {t('calculatedTotal')}
              </span>
              <span className="text-xl font-black" style={{ color: '#FFFFFF' }}>
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: '#1A3D63' }}
              >
                <Notebook className="w-3.5 h-3.5" style={{ color: '#4A7FA7' }} />
                {t('noteLabel')}
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Urgently needed for drinking supply"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input resize-none"
              />
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

export default OrderEntryView;
