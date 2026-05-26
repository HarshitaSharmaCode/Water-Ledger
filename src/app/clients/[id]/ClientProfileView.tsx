'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import { ClientService } from '@/services/client.service';
import { ClientWithBalance } from '@/types/client.types';
import { Order } from '@/types/order.types';
import { Payment } from '@/types/payment.types';
import { OrderService } from '@/services/order.service';
import { PaymentService } from '@/services/payment.service';
import { calculateLedger, LedgerEntry } from '@/utils/ledger.utils';
import {
  Phone, MapPin, ChevronLeft, Edit3,
  ShoppingCart, Landmark, FileSpreadsheet, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { ROUTES } from '@/constants';

interface ClientProfileViewProps {
  params: Promise<{ id: string }>;
}

export const ClientProfileView: React.FC<ClientProfileViewProps> = ({ params }) => {
  const { id: clientId } = use(params);
  const t = useTranslations('Profile');
  const tCommon = useTranslations('Common');
  const tClients = useTranslations('Clients');
  const router = useRouter();

  const [client, setClient] = useState<ClientWithBalance | null>(null);
  const [recentEntries, setRecentEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfileData = async () => {
    setLoading(true);
    const profile = await ClientService.getClientById(clientId);
    if (!profile) { router.push(ROUTES.CLIENTS); return; }
    setClient(profile);

    const orders   = await OrderService.getOrdersByClient(clientId);
    const payments = await PaymentService.getPaymentsByClient(clientId);
    const ledger   = calculateLedger(orders, payments);
    setRecentEntries(ledger.entries.reverse().slice(0, 3));
    setLoading(false);
  };

  useEffect(() => { loadProfileData(); }, [clientId]);

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

  const absBalance = Math.abs(client.pending_balance).toLocaleString('en-IN');

  /* Balance card background based on state */
  const balanceBg =
    client.balance_type === 'pending'
      ? 'linear-gradient(135deg, #0A1931 0%, #1A3D63 100%)'
      : client.balance_type === 'advance'
      ? 'linear-gradient(135deg, #1A3D63 0%, #4A7FA7 100%)'
      : '#FFFFFF';
  const balanceBorder =
    client.balance_type === 'zero' ? '#D0E4F2' : 'transparent';

  return (
    <Layout>
      <div className="flex flex-col gap-5">

        {/* Back / Edit nav */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push(ROUTES.CLIENTS)}
            className="btn btn-secondary text-xs py-2 px-3.5 gap-1.5 min-h-[36px]"
          >
            <ChevronLeft className="w-4 h-4" />
            {tCommon('back')}
          </button>
          <button
            type="button"
            onClick={() => router.push(`${ROUTES.CLIENTS}/${client.id}/edit`)}
            className="flex items-center gap-1.5 py-2 px-3.5 text-xs font-semibold rounded-xl cursor-pointer transition-colors min-h-[36px]"
            style={{
              color: '#1A3D63',
              border: '1px solid #D0E4F2',
              background: '#FFFFFF',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#EEF5FB';
              (e.currentTarget as HTMLButtonElement).style.color = '#0A1931';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
              (e.currentTarget as HTMLButtonElement).style.color = '#1A3D63';
            }}
          >
            <Edit3 className="w-3.5 h-3.5" />
            {t('actionEditClient')}
          </button>
        </div>

        {/* Client info card */}
        <div
          className="flex flex-col gap-3 p-5 sm:p-6"
          style={{
            background: '#FFFFFF',
            border: '1px solid #D0E4F2',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(10,25,49,0.06)',
          }}
        >
          <div>
            <h2
              className="text-lg font-bold leading-snug"
              style={{ color: '#0A1931' }}
            >
              {client.name}
            </h2>
            <div
              className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs font-medium mt-2"
              style={{ color: '#4A7FA7' }}
            >
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {client.phone}
              </span>
              <span className="hidden sm:inline" style={{ color: '#B3CFE5' }}>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {client.address}
              </span>
            </div>
          </div>
          <div
            className="pt-3 flex items-center justify-between"
            style={{ borderTop: '1px solid #EEF5FB' }}
          >
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: '#4A7FA7' }}
            >
              {tClients('pricePerTanker')}
            </span>
            <span
              className="text-sm font-bold px-3 py-1"
              style={{
                color: '#0A1931',
                background: '#EEF5FB',
                border: '1px solid #D0E4F2',
                borderRadius: '9999px',
              }}
            >
              ₹{client.default_price_per_tanker} / Tanker
            </span>
          </div>
        </div>

        {/* Balance card */}
        <div
          className="p-5 sm:p-6 flex flex-col gap-2"
          style={{
            background: balanceBg,
            border: `1px solid ${balanceBorder}`,
            borderRadius: '16px',
            boxShadow:
              client.balance_type !== 'zero'
                ? '0 6px 20px rgba(10,25,49,0.25)'
                : '0 2px 8px rgba(10,25,49,0.06)',
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{
              color: client.balance_type === 'zero' ? '#4A7FA7' : 'rgba(179,207,229,0.8)',
            }}
          >
            {t('balanceCardTitle')}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className="text-3xl font-black tracking-tight"
              style={{
                color: client.balance_type === 'zero' ? '#0A1931' : '#FFFFFF',
              }}
            >
              ₹{absBalance}
            </span>
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{
                color: client.balance_type === 'zero' ? '#4A7FA7' : 'rgba(179,207,229,0.75)',
              }}
            >
              {client.balance_type === 'pending'
                ? t('pendingLabel')
                : client.balance_type === 'advance'
                ? t('advanceLabel')
                : t('zeroLabel')}
            </span>
          </div>
        </div>

        {/* Action shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => router.push(`${ROUTES.CLIENTS}/${client.id}/order`)}
            className="btn btn-primary justify-center gap-2 py-3.5 min-h-[52px]"
          >
            <ShoppingCart className="w-5 h-5 shrink-0" />
            {t('actionAddOrder')}
          </button>

          <button
            type="button"
            onClick={() => router.push(`${ROUTES.CLIENTS}/${client.id}/payment`)}
            className="flex items-center justify-center gap-2 py-3.5 px-4 font-semibold text-sm rounded-xl cursor-pointer transition-all active:scale-[0.98] min-h-[52px]"
            style={{
              background: 'linear-gradient(135deg, #1A3D63, #4A7FA7)',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(26,61,99,0.3)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(26,61,99,0.4)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(26,61,99,0.3)';
            }}
          >
            <Landmark className="w-5 h-5 shrink-0" />
            {t('actionAddPayment')}
          </button>

          <button
            type="button"
            onClick={() => router.push(`${ROUTES.CLIENTS}/${client.id}/ledger`)}
            className="btn btn-secondary justify-center gap-2 py-3.5 min-h-[52px]"
          >
            <FileSpreadsheet className="w-5 h-5 shrink-0" />
            {t('actionViewLedger')}
          </button>
        </div>

        {/* Recent activity */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #D0E4F2',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(10,25,49,0.06)',
          }}
        >
          <div
            className="px-4 py-3.5"
            style={{ borderBottom: '1px solid #EEF5FB' }}
          >
            <h3
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: '#1A3D63' }}
            >
              {t('recentActivity')}
            </h3>
          </div>

          {recentEntries.length === 0 ? (
            <p
              className="text-sm font-medium py-10 text-center"
              style={{ color: '#4A7FA7' }}
            >
              {t('noActivity')}
            </p>
          ) : (
            <div>
              {recentEntries.map((entry, idx) => {
                const isOrder = entry.type === 'order';
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between px-4 py-3.5"
                    style={{
                      borderBottom: idx < recentEntries.length - 1 ? '1px solid #F6FAFD' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={
                          isOrder
                            ? { background: '#EEF5FB', color: '#4A7FA7' }
                            : {
                                background: 'linear-gradient(135deg, #0A1931, #1A3D63)',
                                color: '#FFFFFF',
                              }
                        }
                      >
                        {isOrder
                          ? <ArrowUpRight className="w-4 h-4" />
                          : <ArrowDownRight className="w-4 h-4" />
                        }
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          className="text-xs font-semibold leading-tight"
                          style={{ color: '#0A1931' }}
                        >
                          {isOrder ? tCommon('other') : tCommon('rupee') + ' Received'}
                        </span>
                        <span
                          className="text-[10px] font-medium mt-0.5 truncate"
                          style={{ color: '#4A7FA7' }}
                        >
                          {entry.date} · {entry.details}
                        </span>
                      </div>
                    </div>

                    <span
                      className="text-sm font-bold shrink-0"
                      style={{ color: isOrder ? '#1A3D63' : '#0A1931' }}
                    >
                      {isOrder ? '+' : '-'}₹{entry.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};
