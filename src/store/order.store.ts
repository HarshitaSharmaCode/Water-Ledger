// src/store/order.store.ts
// Zustand store for managing order records. Persisted in localStorage.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order } from '@/types/order.types';
import { LOCAL_STORAGE_KEYS } from '@/constants';

interface OrderState {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'created_at'>) => Order;
  getOrdersByClient: (clientId: string) => Order[];
  deleteOrder: (id: string) => void;
}

// Helper to calculate date string relative to current time
const getDateOffset = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const INITIAL_ORDERS: Order[] = [
  // Client 1: Rajesh Kumar (Default: 500)
  {
    id: 'order-1-1',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    client_id: 'client-1',
    order_date: getDateOffset(25),
    location_type: 'home',
    location_other: null,
    called_by: 'Rajesh',
    tanker_count: 1,
    price_per_tanker: 500.00,
    order_amount: 500.00,
    note: 'Initial summer supply',
  },
  {
    id: 'order-1-2',
    created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    client_id: 'client-1',
    order_date: getDateOffset(18),
    location_type: 'home',
    location_other: null,
    called_by: 'Rajesh\'s Wife',
    tanker_count: 2,
    price_per_tanker: 500.00,
    order_amount: 1000.00,
    note: 'Needed for overhead tank fill',
  },
  {
    id: 'order-1-3',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    client_id: 'client-1',
    order_date: getDateOffset(8),
    location_type: 'home',
    location_other: null,
    called_by: 'Rajesh',
    tanker_count: 1,
    price_per_tanker: 500.00,
    order_amount: 500.00,
    note: null,
  },
  
  // Client 2: Sharma Sweets (Default: 600)
  {
    id: 'order-2-1',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    client_id: 'client-2',
    order_date: getDateOffset(20),
    location_type: 'other',
    location_other: 'Main Kitchen Warehouse',
    called_by: 'Manager Verma',
    tanker_count: 2,
    price_per_tanker: 600.00,
    order_amount: 1200.00,
    note: 'Preparation for festival rush',
  },
  {
    id: 'order-2-2',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    client_id: 'client-2',
    order_date: getDateOffset(10),
    location_type: 'home',
    location_other: null,
    called_by: 'Sharma ji',
    tanker_count: 1,
    price_per_tanker: 600.00,
    order_amount: 600.00,
    note: 'Sweets preparation batch water',
  },

  // Client 3: Pooja Apartments (Default: 450)
  {
    id: 'order-3-1',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    client_id: 'client-3',
    order_date: getDateOffset(12),
    location_type: 'other',
    location_other: 'Block C Fire Tanker',
    called_by: 'Secretary Sunil',
    tanker_count: 3,
    price_per_tanker: 450.00,
    order_amount: 1350.00,
    note: 'Monthly emergency backup',
  },
  {
    id: 'order-3-2',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    client_id: 'client-3',
    order_date: getDateOffset(4),
    location_type: 'home',
    location_other: null,
    called_by: 'Sunil',
    tanker_count: 2,
    price_per_tanker: 450.00,
    order_amount: 900.00,
    note: 'Regular society backup',
  },
];

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: INITIAL_ORDERS,
      
      addOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: `order-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        
        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));
        
        return newOrder;
      },
      
      getOrdersByClient: (clientId) => {
        return get().orders.filter((o) => o.client_id === clientId);
      },
      
      deleteOrder: (id) => {
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
        }));
      },
    }),
    {
      name: LOCAL_STORAGE_KEYS.ORDERS,
    }
  )
);
