'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import { ClientService } from '@/services/client.service';
import { OrderService, OrderFilter } from '@/services/order.service';
import { PaymentService } from '@/services/payment.service';
import { ClientWithBalance } from '@/types/client.types';
import { Order } from '@/types/order.types';
import { getTodayIST } from '@/utils/date.utils';
import { Users, AlertCircle, TrendingUp, Calendar, MapPin, ChevronRight, ShoppingCart, ChevronDown } from 'lucide-react';
import { ROUTES } from '@/constants';

interface OrderWithClientName extends Order {
  clientName: string;
}

export const Dashboard: React.FC = () => {
  const t = useTranslations('Dashboard');
  const tCommon = useTranslations('Common');
  const router = useRouter();

  // Stats state — loaded once, not re-filtered
  const [clients, setClients] = useState<ClientWithBalance[]>([]);
  const [receivedToday, setReceivedToday] = useState<number>(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Orders list state — re-fetched on filter change
  const [orders, setOrders] = useState<OrderWithClientName[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Filter state
  const [filter, setFilter] = useState<OrderFilter>('last5');
  const [customFrom, setCustomFrom] = useState(getTodayIST());
  const [customTo, setCustomTo] = useState(getTodayIST());
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Derived stats
  const totalClientsCount = clients.length;
  const totalPendingAmount = clients
    .filter((c) => c.balance_type === 'pending')
    .reduce((sum, c) => sum + c.pending_balance, 0);

  // Load clients + today's payments once on mount
  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const [fetchedClients, todayTotal] = await Promise.all([
          ClientService.getAllClients(),
          PaymentService.getTodayTotal(),
        ]);
        setClients(fetchedClients);
        setReceivedToday(todayTotal);
      } catch {
        setStatsError('Failed to load dashboard data.');
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  // Load orders whenever filter or clients change
  const loadOrders = useCallback(async (
    activeFilter: OrderFilter,
    from?: string,
    to?: string
  ) => {
    setOrdersLoading(true);
    try {
      const fetched = await OrderService.getOrdersByFilter(activeFilter, from, to);
      const withNames: OrderWithClientName[] = fetched.map((o) => {
        const client = clients.find((c) => c.id === o.client_id);
        return { ...o, clientName: client?.name ?? '...' };
      });
      setOrders(withNames);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [clients]);

  useEffect(() => {
    if (filter === 'custom') {
      if (customFrom && customTo) loadOrders('custom', customFrom, customTo);
    } else {
      loadOrders(filter);
    }
  }, [filter, clients, loadOrders]);

  const applyCustomRange = () => {
    if (customFrom && customTo) loadOrders('custom', customFrom, customTo);
  };

  const filterOptions: { value: OrderFilter; label: string }[] = [
    { value: 'today', label: t('filterToday') },
    { value: 'last5', label: t('filterLast5') },
    { value: 'last7days', label: t('filterLast7Days') },
    { value: 'thisMonth', label: t('filterThisMonth') },
    { value: 'custom', label: t('filterCustom') },
  ];

  if (statsLoading) {
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

  if (statsError) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <AlertCircle className="w-10 h-10" style={{ color: '#B3CFE5' }} />
          <p className="text-sm font-medium" style={{ color: '#4A7FA7' }}>{statsError}</p>
          <button type="button" onClick={() => window.location.reload()} className="btn btn-secondary text-xs py-2 px-4">
            {tCommon('retry')}
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-5">

        {/* Page heading */}
        <div>
          <h2 className="text-xl font-bold leading-tight" style={{ color: '#0A1931' }}>
            {t('title')}
          </h2>
          <p className="text-xs font-bold mt-1 uppercase tracking-widest" style={{ color: '#4A7FA7' }}>
            {t('operatorConsole')}
          </p>
        </div>

        {/* KPI Grid — 2 col mobile, 3 col desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

          {/* Total Pending — hero card */}
          <div
            className="col-span-2 sm:col-span-1 p-5 flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, #0A1931 0%, #1A3D63 100%)',
              borderRadius: '16px',
              boxShadow: '0 6px 20px rgba(10,25,49,0.30)',
            }}
          >
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(179,207,229,0.8)' }}>
                {t('totalPending')}
              </span>
              <span className="text-2xl font-black leading-none" style={{ color: '#FFFFFF' }}>
                ₹{totalPendingAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div
              className="w-10 h-10 flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(74,127,167,0.25)',
                border: '1px solid rgba(179,207,229,0.3)',
                borderRadius: '12px',
                color: '#B3CFE5',
              }}
            >
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Total Clients */}
          <div
            onClick={() => router.push(ROUTES.CLIENTS)}
            className="col-span-2 sm:col-span-1 p-5 flex items-center justify-between cursor-pointer transition-all"
            style={{
              background: '#FFFFFF',
              border: '1px solid #D0E4F2',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(10,25,49,0.06)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#4A7FA7';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#D0E4F2';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            }}
          >
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#4A7FA7' }}>
                {t('totalClients')}
              </span>
              <span className="text-2xl font-black leading-none" style={{ color: '#0A1931' }}>
                {totalClientsCount}
              </span>
            </div>
            <div
              className="w-10 h-10 flex items-center justify-center shrink-0"
              style={{
                background: '#EEF5FB',
                border: '1px solid #D0E4F2',
                borderRadius: '12px',
                color: '#4A7FA7',
              }}
            >
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Received Today */}
          <div
            className="col-span-2 sm:col-span-1 p-5 flex items-center justify-between"
            style={{
              background: '#FFFFFF',
              border: `1px solid ${receivedToday > 0 ? 'rgba(16,185,129,0.25)' : '#D0E4F2'}`,
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(10,25,49,0.06)',
            }}
          >
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#4A7FA7' }}>
                {t('receivedToday')}
              </span>
              <span
                className="text-2xl font-black leading-none"
                style={{ color: receivedToday > 0 ? '#10B981' : '#0A1931' }}
              >
                ₹{receivedToday.toLocaleString('en-IN')}
              </span>
            </div>
            <div
              className="w-10 h-10 flex items-center justify-center shrink-0"
              style={{
                background: receivedToday > 0 ? 'rgba(16,185,129,0.08)' : '#EEF5FB',
                border: `1px solid ${receivedToday > 0 ? 'rgba(16,185,129,0.2)' : '#D0E4F2'}`,
                borderRadius: '12px',
                color: receivedToday > 0 ? '#10B981' : '#4A7FA7',
              }}
            >
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* Orders List with Filter */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #D0E4F2',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(10,25,49,0.06)',
            overflow: 'hidden',
          }}
        >
          {/* Header: title + filter dropdown */}
          <div
            className="flex items-center justify-between px-4 py-3.5"
            style={{ borderBottom: '1px solid #EEF5FB' }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center w-7 h-7"
                style={{ background: '#EEF5FB', borderRadius: '8px', color: '#4A7FA7' }}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#1A3D63' }}>
                {t('recentOrders')}
              </h3>
            </div>

            {/* Filter dropdown */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => {
                  const val = e.target.value as OrderFilter;
                  setFilter(val);
                  setShowCustomPicker(val === 'custom');
                }}
                className="appearance-none text-xs font-semibold pl-3 pr-7 py-1.5 rounded-lg cursor-pointer"
                style={{
                  background: '#EEF5FB',
                  border: '1px solid #D0E4F2',
                  color: '#1A3D63',
                  outline: 'none',
                }}
              >
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown
                className="w-3 h-3 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                style={{ color: '#4A7FA7' }}
              />
            </div>
          </div>

          {/* Custom date pickers */}
          {showCustomPicker && (
            <div
              className="flex flex-wrap items-end gap-3 px-4 py-3"
              style={{ borderBottom: '1px solid #EEF5FB', background: '#F6FAFD' }}
            >
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#4A7FA7' }}>
                  {t('filterFrom')}
                </label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="input text-xs py-1.5 px-2"
                  style={{ minWidth: '130px' }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#4A7FA7' }}>
                  {t('filterTo')}
                </label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="input text-xs py-1.5 px-2"
                  style={{ minWidth: '130px' }}
                />
              </div>
              <button
                type="button"
                onClick={applyCustomRange}
                className="btn btn-primary text-xs py-1.5 px-4"
              >
                Apply
              </button>
            </div>
          )}

          {/* Orders body */}
          {ordersLoading ? (
            <div className="flex items-center justify-center py-10">
              <div
                className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#1A3D63', borderTopColor: 'transparent' }}
              />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
              <AlertCircle className="w-10 h-10 mb-3" style={{ color: '#B3CFE5' }} />
              <p className="text-sm font-medium" style={{ color: '#4A7FA7' }}>
                {t('noOrdersInRange')}
              </p>
            </div>
          ) : (
            <div>
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => router.push(`${ROUTES.CLIENTS}/${order.client_id}`)}
                  className="flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid #F6FAFD' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#F6FAFD'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <div className="flex flex-col gap-1 min-w-0 pr-4">
                    <span className="text-sm font-semibold truncate" style={{ color: '#0A1931' }}>
                      {order.clientName}
                    </span>
                    <div className="flex items-center gap-3 text-[10px] font-medium" style={{ color: '#4A7FA7' }}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {order.order_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {order.location_type === 'home' ? tCommon('home') : order.location_other || tCommon('other')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold leading-none" style={{ color: '#0A1931' }}>
                        ₹{order.order_amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] mt-0.5" style={{ color: '#4A7FA7' }}>
                        {order.tanker_count} {t('tankerUnit')}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: '#B3CFE5' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default Dashboard;