'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import { ClientService } from '@/services/client.service';
import { PaymentService } from '@/services/payment.service';
import { Client } from '@/types/client.types';
import { ChevronLeft, Calendar, IndianRupee, Notebook } from 'lucide-react';
import { ROUTES } from '@/constants';
import { getTodayIST } from '@/utils/date.utils';
import { useToastStore } from '@/store/toast.store';

interface PaymentEntryViewProps {
  params: Promise<{ id: string }>;
}

export const PaymentEntryView: React.FC<PaymentEntryViewProps> = ({ params }) => {
  const { id: clientId } = use(params);
  const t = useTranslations('Payment');
  const tCommon = useTranslations('Common');
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      const data = await ClientService.getClientById(clientId);
      if (!data) { router.push(ROUTES.CLIENTS); return; }
      setClient(data);
      setDate(getTodayIST());
      setLoading(false);
    };
    fetchClient();
  }, [clientId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!date) return setFormError('Select a valid date');
    const paymentAmt = parseFloat(amount) || 0;
    if (paymentAmt <= 0) return setFormError(t('validationAmount'));

    const { addToast } = useToastStore();
    const tToast = useTranslations('Toast');

    setFormSaving(true);
    try {
      await PaymentService.createPayment({
        client_id: clientId,
        payment_date: date,
        amount: paymentAmt,
        note: note.trim() || null,
      });
      addToast(tToast('paymentAdded'), 'success');
      router.push(`${ROUTES.CLIENTS}/${clientId}`);
    } catch {
      addToast(tToast('paymentFailed'), 'error');
      setFormError('Could not save payment. Please try again.');
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

        {/* Amount preview strip */}
        {amount && parseFloat(amount) > 0 && (
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, #1A3D63, #4A7FA7)',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(26,61,99,0.25)',
            }}
          >
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'rgba(179,207,229,0.85)' }}
            >
              {t('paymentAmountDisplay')}
            </span>
            <span className="text-2xl font-black" style={{ color: '#FFFFFF' }}>
              ₹{parseFloat(amount).toLocaleString('en-IN')}
            </span>
          </div>
        )}

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

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: '#1A3D63' }}
              >
                <IndianRupee className="w-3.5 h-3.5" style={{ color: '#4A7FA7' }} />
                {t('amountLabel')}
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="e.g. 1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
              />
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
                placeholder="e.g. Cash received by driver, GPay, etc."
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

export default PaymentEntryView;
