// src/store/payment.store.ts
// Zustand store for managing payment records. Persisted in localStorage.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Payment } from '@/types/payment.types';
import { LOCAL_STORAGE_KEYS } from '@/constants';

interface PaymentState {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'created_at'>) => Payment;
  getPaymentsByClient: (clientId: string) => Payment[];
  deletePayment: (id: string) => void;
}

// Helper to calculate date string relative to current time
const getDateOffset = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const INITIAL_PAYMENTS: Payment[] = [
  // Client 1: Rajesh Kumar (Total orders: ₹2,000, Total payments: ₹2,200. Wait, let's make it outstanding ₹300)
  // Rajesh total bills: order-1 (500) + order-2 (1000) + order-3 (500) = ₹2,000.
  // Rajesh payments: pay-1 (1000) + pay-2 (700) = ₹1,700. Net pending: ₹300.
  {
    id: 'pay-1-1',
    created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    client_id: 'client-1',
    payment_date: getDateOffset(22),
    amount: 1000.00,
    note: 'Paid cash to delivery driver',
  },
  {
    id: 'pay-1-2',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    client_id: 'client-1',
    payment_date: getDateOffset(6),
    amount: 700.00,
    note: 'GPay payment',
  },

  // Client 2: Sharma Sweets (Total bills: ₹1,800. Let's overpay them to show Advance)
  // Sharma Sweet bills: order-1 (1200) + order-2 (600) = ₹1,800.
  // Sharma Sweet payments: pay-1 (2000). Net balance: -₹200 (Advance!).
  {
    id: 'pay-2-1',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    client_id: 'client-2',
    payment_date: getDateOffset(12),
    amount: 2000.00,
    note: 'Lump-sum advance via Bank Transfer',
  },

  // Client 3: Pooja Apartments (Total bills: ₹2,250. Let's make it exactly zero outstanding)
  // Pooja bills: order-1 (1350) + order-2 (900) = ₹2,250.
  // Pooja payments: pay-1 (2250). Net balance: 0 (Zero balance).
  {
    id: 'pay-3-1',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    client_id: 'client-3',
    payment_date: getDateOffset(2),
    amount: 2250.00,
    note: 'Society check cleared',
  },
];

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      payments: INITIAL_PAYMENTS,
      
      addPayment: (paymentData) => {
        const newPayment: Payment = {
          ...paymentData,
          id: `pay-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        
        set((state) => ({
          payments: [newPayment, ...state.payments],
        }));
        
        return newPayment;
      },
      
      getPaymentsByClient: (clientId) => {
        return get().payments.filter((p) => p.client_id === clientId);
      },
      
      deletePayment: (id) => {
        set((state) => ({
          payments: state.payments.filter((p) => p.id !== id),
        }));
      },
    }),
    {
      name: LOCAL_STORAGE_KEYS.PAYMENTS,
    }
  )
);
