// src/store/payment.store.ts
// Zustand store for payment list state.
// Pure state container — NO Supabase calls, NO seeded data, NO local ID generation.
// All writes go through src/services/payment.service.ts.

import { create } from 'zustand';
import { Payment } from '@/types/payment.types';

interface PaymentState {
  /** Payments for the currently viewed client, fetched from Supabase. */
  payments: Payment[];
  /** Whether a payment fetch is in progress. */
  isLoading: boolean;
  /** Error message from the last failed fetch, or null. */
  error: string | null;

  setPayments: (payments: Payment[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  /** Optimistically prepend a newly-created payment after a successful Supabase insert. */
  addPaymentToCache: (payment: Payment) => void;
  /** Returns payments filtered by client ID from the in-memory list. */
  getPaymentsByClient: (clientId: string) => Payment[];
}

export const usePaymentStore = create<PaymentState>()((set, get) => ({
  payments: [],
  isLoading: false,
  error: null,

  setPayments: (payments) => set({ payments, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  addPaymentToCache: (payment) =>
    set((state) => ({ payments: [payment, ...state.payments] })),

  getPaymentsByClient: (clientId) =>
    get().payments.filter((p) => p.client_id === clientId),
}));
