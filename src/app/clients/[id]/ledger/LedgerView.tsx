'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import { ClientService } from '@/services/client.service';
import { OrderService } from '@/services/order.service';
import { PaymentService } from '@/services/payment.service';
import { Client } from '@/types/client.types';
import { Order } from '@/types/order.types';
import { Payment } from '@/types/payment.types';
import { calculateLedger, formatLedgerForWhatsApp, LedgerResult } from '@/utils/ledger.utils';
import {
  ChevronLeft, FileSpreadsheet, Share2, ArrowUpRight, ArrowDownRight, X, SlidersHorizontal
} from 'lucide-react';
import { ROUTES } from '@/constants';

interface LedgerViewProps {
  params: Promise<{ id: string }>;
}

export const LedgerView: React.FC<LedgerViewProps> = ({ params }) => {
  const { id: clientId } = use(params);
  const t = useTranslations('Ledger');
  const tCommon = useTranslations('Common');
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [ledgerResult, setLedgerResult] = useState<LedgerResult | null>(null);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLedgerData = async () => {
    setLoading(true);
    const clientData = await ClientService.getClientById(clientId);
    if (!clientData) { router.push(ROUTES.CLIENTS); return; }
    setClient(clientData);

    const orderData = await OrderService.getOrdersByClient(clientId);
    const paymentData = await PaymentService.getPaymentsByClient(clientId);
    setOrders(orderData);
    setPayments(paymentData);
    setLoading(false);
  };

  useEffect(() => { fetchLedgerData(); }, [clientId]);

  useEffect(() => {
    if (orders.length > 0 || payments.length > 0) {
      setLedgerResult(calculateLedger(orders, payments, fromDate || undefined, toDate || undefined));
    } else {
      setLedgerResult({ entries: [], opening_balance: 0, closing_balance: 0, total_order_amount: 0, total_payment_amount: 0 });
    }
  }, [orders, payments, fromDate, toDate]);

  const handleWhatsAppShare = () => {
    if (!client || !ledgerResult) return;
    const msg = formatLedgerForWhatsApp(client.name, ledgerResult, fromDate || undefined, toDate || undefined, t);
    let phone = client.phone.replace(/\D/g, '');
    if (phone.length === 10) phone = `91${phone}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading || !client || !ledgerResult) {
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

  const absClosing = Math.abs(ledgerResult.closing_balance).toLocaleString('en-IN');
  const absOpening = Math.abs(ledgerResult.opening_balance).toLocaleString('en-IN');
  const hasFilters = !!(fromDate || toDate);
  const filtersOpen = showFilters || hasFilters;

  /* Closing balance colour */
  const closingColor =
    ledgerResult.closing_balance > 0
      ? '#B45309'
      : ledgerResult.closing_balance < 0
        ? '#059669'
        : '#6B7280';

  return (
    <Layout>
      <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">

        {/* Header */}
        <div
          className="flex items-center justify-between pb-4"
          style={{ borderBottom: '1px solid #EEF5FB' }}
        >
          <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center w-8 h-8 rounded-xl cursor-pointer transition-all"
              style={
                filtersOpen
                  ? {
                    background: 'linear-gradient(135deg, #0A1931, #1A3D63)',
                    border: '1px solid #0A1931',
                    color: '#FFFFFF',
                    boxShadow: '0 3px 10px rgba(10,25,49,0.25)',
                  }
                  : {
                    background: '#FFFFFF',
                    border: '1px solid #D0E4F2',
                    color: '#4A7FA7',
                  }
              }
              title="Toggle Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              disabled={ledgerResult.entries.length === 0 && ledgerResult.opening_balance === 0}
              className="btn btn-primary text-xs py-2 px-3.5 min-h-[36px] gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('whatsappShare')}</span>
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {filtersOpen && (
          <div
            className="p-4 flex flex-col gap-3"
            style={{
              background: '#FFFFFF',
              border: '1px solid #D0E4F2',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(10,25,49,0.05)',
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#4A7FA7' }}
              >
                {t('dateRangeTitle')}
              </span>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => { setFromDate(''); setToDate(''); }}
                  className="flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors"
                  style={{ color: '#4A7FA7' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#0A1931'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#4A7FA7'; }}
                >
                  <X className="w-3 h-3" />
                  {t('allTime')}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: '#4A7FA7' }}
                >
                  {t('fromDate')}
                </label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input text-xs py-2" />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: '#4A7FA7' }}
                >
                  {t('toDate')}
                </label>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input text-xs py-2" />
              </div>
            </div>
          </div>
        )}

        {/* Summary strip — 3-column KPI card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #D0E4F2',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(10,25,49,0.06)',
          }}
        >
          <div className="grid grid-cols-3" style={{ borderBottom: 'none' }}>

            <div
              className="flex flex-col items-center gap-0.5 py-4 px-3 text-center"
              style={{ borderRight: '1px solid #EEF5FB' }}
            >
              <span
                className="text-[9px] font-bold uppercase tracking-widest"
                style={{ color: '#4A7FA7' }}
              >
                {t('totalBills')}
              </span>
              <span
                className="text-sm font-black mt-1"
                style={{ color: '#0A1931' }}
              >
                ₹{ledgerResult.total_order_amount.toLocaleString('en-IN')}
              </span>
            </div>

            <div
              className="flex flex-col items-center gap-0.5 py-4 px-3 text-center"
              style={{ borderRight: '1px solid #EEF5FB' }}
            >
              <span
                className="text-[9px] font-bold uppercase tracking-widest"
                style={{ color: '#4A7FA7' }}
              >
                {t('totalPayments')}
              </span>
              <span
                className="text-sm font-black mt-1"
                style={{ color: '#0A1931' }}
              >
                ₹{ledgerResult.total_payment_amount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex flex-col items-center gap-0.5 py-4 px-3 text-center">
              <span
                className="text-[9px] font-bold uppercase tracking-widest"
                style={{ color: '#4A7FA7' }}
              >
                {t('closingBal')}
              </span>
              <span
                className="text-sm font-black mt-1"
                style={{ color: closingColor }}
              >
                ₹{absClosing}
              </span>
            </div>

          </div>
        </div>

        {/* Entries table */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #D0E4F2',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(10,25,49,0.06)',
          }}
        >

          {ledgerResult.entries.length === 0 && ledgerResult.opening_balance === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div
                className="flex items-center justify-center w-16 h-16 mb-4"
                style={{ background: '#EEF5FB', borderRadius: '16px', color: '#B3CFE5' }}
              >
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium" style={{ color: '#4A7FA7' }}>
                {t('noEntries')}
              </p>
            </div>
          ) : (
            <div>

              {/* Opening balance row (when date range active) */}
              {hasFilters && (
                <div
                  className="flex items-center justify-between px-4 py-3.5"
                  style={{ background: '#F6FAFD', borderBottom: '1px solid #EEF5FB' }}
                >
                  <div className="flex flex-col">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: '#0A1931' }}
                    >
                      {t('openingBalance')}
                    </span>
                    <span
                      className="text-[10px] font-medium mt-0.5"
                      style={{ color: '#4A7FA7' }}
                    >
                      C{t('cumulativePrior')}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={
                      ledgerResult.opening_balance > 0
                        ? { background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E' }
                        : ledgerResult.opening_balance < 0
                          ? { background: '#D1FAE5', border: '1px solid #6EE7B7', color: '#065F46' }
                          : { background: '#F3F4F6', border: '1px solid #E5E7EB', color: '#6B7280' }
                    }
                  >
                    ₹{absOpening} {ledgerResult.opening_balance > 0 ? 'Due' : ledgerResult.opening_balance < 0 ? 'Adv' : 'Clean'}
                  </span>
                </div>
              )}

              {/* Entry rows */}
              {ledgerResult.entries.map((entry, idx) => {
                const isOrder = entry.type === 'order';
                const rowAbsRunning = Math.abs(entry.running_balance).toLocaleString('en-IN');

                return (
                  <div
                    key={entry.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-4 gap-3 transition-colors"
                    style={{
                      borderBottom: idx < ledgerResult.entries.length - 1 ? '1px solid #F6FAFD' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = '#F6FAFD';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                    }}
                  >

                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={
                          isOrder
                            ? { background: '#EEF5FB', color: '#4A7FA7' }
                            : { background: 'linear-gradient(135deg, #0A1931, #1A3D63)', color: '#FFFFFF' }
                        }
                      >
                        {isOrder
                          ? <ArrowUpRight className="w-4 h-4" />
                          : <ArrowDownRight className="w-4 h-4" />
                        }
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-xs font-semibold"
                            style={{ color: '#0A1931' }}
                          >
                            {isOrder ? t('orderType') : t('paymentType')}
                          </span>
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: '#EEF5FB',
                              border: '1px solid #D0E4F2',
                              color: '#4A7FA7',
                            }}
                          >
                            {entry.date}
                          </span>
                        </div>
                        <span
                          className="text-[10px] font-medium mt-0.5 leading-relaxed"
                          style={{ color: '#4A7FA7' }}
                        >
                          {entry.details}
                        </span>
                        {entry.note && (
                          <span
                            className="text-[9px] font-medium italic mt-0.5"
                            style={{ color: '#1A3D63' }}
                          >
                            Note: &quot;{entry.note}&quot;
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0"
                      style={{ borderTop: undefined }}
                    >
                      {/* Mobile only: top divider */}
                      <div className="sm:hidden absolute left-4 right-4" />

                      <div className="flex flex-col items-start sm:items-end">
                        <span
                          className="text-[8px] font-bold uppercase tracking-widest"
                          style={{ color: '#4A7FA7' }}
                        >
                          Amount
                        </span>
                        <span
                          className="text-sm font-bold mt-0.5"
                          style={{ color: isOrder ? '#1A3D63' : '#0A1931' }}
                        >
                          {isOrder ? '+' : '-'}₹{entry.amount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex flex-col items-end">
                        <span
                          className="text-[8px] font-bold uppercase tracking-widest"
                          style={{ color: '#4A7FA7' }}
                        >
                          {t('balanceHeader')}
                        </span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full mt-0.5"
                          style={
                            entry.running_balance > 0
                              ? { background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E' }
                              : entry.running_balance < 0
                                ? { background: '#D1FAE5', border: '1px solid #6EE7B7', color: '#065F46' }
                                : { background: '#F3F4F6', border: '1px solid #E5E7EB', color: '#6B7280' }
                          }
                        >
                          ₹{rowAbsRunning} {entry.running_balance > 0 ? 'Due' : entry.running_balance < 0 ? 'Adv' : ''}
                        </span>
                      </div>
                    </div>

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

export default LedgerView;
