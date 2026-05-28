// src/store/order.store.ts
// Zustand store for order list state.
// Pure state container — NO Supabase calls, NO seeded data, NO local ID generation.
// All writes go through src/services/order.service.ts.

import { create } from 'zustand';
import { Order } from '@/types/order.types';

interface OrderState {
  /** Orders for the currently viewed client, fetched from Supabase. */
  orders: Order[];
  /** Whether an order fetch is in progress. */
  isLoading: boolean;
  /** Error message from the last failed fetch, or null. */
  error: string | null;

  setOrders: (orders: Order[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  /** Optimistically prepend a newly-created order after a successful Supabase insert. */
  addOrderToCache: (order: Order) => void;
  /** Optimistically update an order after a successful Supabase update. */
  updateOrderInCache: (id: string, updates: Partial<Order>) => void;
  /** Returns orders filtered by client ID from the in-memory list. */
  getOrdersByClient: (clientId: string) => Order[];
}

export const useOrderStore = create<OrderState>()((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  setOrders: (orders) => set({ orders, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  addOrderToCache: (order) =>
    set((state) => ({ orders: [order, ...state.orders] })),

  updateOrderInCache: (id, updates) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, ...updates } : o
      ),
    })),

  getOrdersByClient: (clientId) =>
    get().orders.filter((o) => o.client_id === clientId),
}));
