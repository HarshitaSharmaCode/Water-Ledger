'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import { useClientStore } from '@/store/client.store';
import { useOrderStore } from '@/store/order.store';
import { usePaymentStore } from '@/store/payment.store';
import { calculateDashboardStats, DashboardStats } from '@/utils/dashboard.utils';
import { Users, AlertCircle, TrendingUp, Calendar, MapPin, ChevronRight, ShoppingCart } from 'lucide-react';
import { ROUTES } from '@/constants';

export const Dashboard: React.FC = () => {
  const t = useTranslations('Dashboard');
  const tCommon = useTranslations('Common');
  const router = useRouter();

  const clients  = useClientStore((s) => s.clients);
  const orders   = useOrderStore((s) => s.orders);
  const payments = usePaymentStore((s) => s.payments);

  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    setStats(calculateDashboardStats(clients, orders, payments));
  }, [clients, orders, payments]);

  if (!stats) return null;

  return (
    <Layout>
      <div className="flex flex-col gap-5">

        {/* Page heading */}
        <div>
          <h2
            className="text-xl font-bold leading-tight"
            style={{ color: '#0A1931' }}
          >
            {t('title')}
          </h2>
          <p
            className="text-xs font-bold mt-1 uppercase tracking-widest"
            style={{ color: '#4A7FA7' }}
          >
            Operator Console
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3">

          {/* Pending Balance — hero card */}
          <div
            className="col-span-2 sm:col-span-1 p-5 flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, #0A1931 0%, #1A3D63 100%)',
              borderRadius: '16px',
              boxShadow: '0 6px 20px rgba(10,25,49,0.30)',
            }}
          >
            <div className="flex flex-col gap-1">
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: 'rgba(179,207,229,0.8)' }}
              >
                {t('totalPending')}
              </span>
              <span
                className="text-2xl font-black leading-none"
                style={{ color: '#FFFFFF' }}
              >
                ₹{stats.totalPendingAmount.toLocaleString('en-IN')}
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
            className="col-span-2 sm:col-span-1 p-5 flex items-center justify-between cursor-pointer transition-all group"
            style={{
              background: '#FFFFFF',
              border: '1px solid #D0E4F2',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(10,25,49,0.06)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#4A7FA7';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(10,25,49,0.12)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#D0E4F2';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(10,25,49,0.06)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            }}
          >
            <div className="flex flex-col gap-1">
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: '#4A7FA7' }}
              >
                {t('totalClients')}
              </span>
              <span
                className="text-2xl font-black leading-none"
                style={{ color: '#0A1931' }}
              >
                {stats.totalClientsCount}
              </span>
            </div>
            <div
              className="w-10 h-10 flex items-center justify-center shrink-0 transition-all"
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

        </div>

        {/* Recent Orders */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #D0E4F2',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(10,25,49,0.06)',
            overflow: 'hidden',
          }}
        >

          {/* Card header */}
          <div
            className="flex items-center gap-2.5 px-4 py-3.5"
            style={{ borderBottom: '1px solid #EEF5FB' }}
          >
            <div
              className="flex items-center justify-center w-7 h-7"
              style={{
                background: '#EEF5FB',
                borderRadius: '8px',
                color: '#4A7FA7',
              }}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
            <h3
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: '#1A3D63' }}
            >
              {t('recentOrders')}
            </h3>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
              <AlertCircle className="w-10 h-10 mb-3" style={{ color: '#B3CFE5' }} />
              <p className="text-sm font-medium" style={{ color: '#4A7FA7' }}>
                {t('noRecentOrders')}
              </p>
            </div>
          ) : (
            <div>
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => router.push(`${ROUTES.CLIENTS}/${order.client_id}`)}
                  className="flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors group"
                  style={{ borderBottom: '1px solid #F6FAFD' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = '#F6FAFD';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  <div className="flex flex-col gap-1 min-w-0 pr-4">
                    <span
                      className="text-sm font-semibold truncate"
                      style={{ color: '#0A1931' }}
                    >
                      {order.clientName}
                    </span>
                    <div
                      className="flex items-center gap-3 text-[10px] font-medium"
                      style={{ color: '#4A7FA7' }}
                    >
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
                      <span
                        className="text-sm font-bold leading-none"
                        style={{ color: '#0A1931' }}
                      >
                        ₹{order.order_amount.toLocaleString('en-IN')}
                      </span>
                      <span
                        className="text-[10px] mt-0.5"
                        style={{ color: '#4A7FA7' }}
                      >
                        {order.tanker_count} Tanker(s)
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
