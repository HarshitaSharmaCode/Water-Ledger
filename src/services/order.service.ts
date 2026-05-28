// src/services/order.service.ts
// Supabase service layer for order operations.
// Per global-rules.md: ALL Supabase calls live here only. No store imports.

import { supabase, getAuthUserId } from '@/lib/supabase';
import { Order } from '@/types/order.types';
// Add this type export at the top of the file, after the imports
export type OrderFilter = 'today' | 'last5' | 'last7days' | 'thisMonth' | 'custom';

export const OrderService = {
  /**
   * Fetches all orders for a specific client, sorted by order_date descending.
   */
  getOrdersByClient: async (clientId: string): Promise<Order[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('client_id', clientId)
      .order('order_date', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Order[];
  },

  /**
   * Fetches the most recent N orders across ALL clients scoped to the current user.
   * Used by the dashboard. Two-step fetch: get user's client IDs, then query orders.
   * RLS enforces scoping at DB level; explicit client_id filter is belt-and-suspenders.
   */
  getRecentOrders: async (limit: number = 5): Promise<Order[]> => {
    const userId = await getAuthUserId();

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId);

    if (clientError) throw new Error(clientError.message);
    const clientIds = (clientData ?? []).map((c: { id: string }) => c.id);

    if (clientIds.length === 0) return [];

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('client_id', clientIds)
      .order('order_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []) as Order[];
  },

  /**
   * Fetches orders for the dashboard orders list based on the selected filter.
   * Stats cards are NOT affected — they pull from getAllClients separately.
   */
  getOrdersByFilter: async (
    filter: OrderFilter,
    fromDate?: string,
    toDate?: string
  ): Promise<Order[]> => {
    const userId = await getAuthUserId();

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId);

    if (clientError) throw new Error(clientError.message);
    const clientIds = (clientData ?? []).map((c: { id: string }) => c.id);
    if (clientIds.length === 0) return [];

    const IST_TZ = 'Asia/Kolkata';
    const IST_LOCALE = 'en-CA';
    const todayIST = new Date().toLocaleDateString(IST_LOCALE, { timeZone: IST_TZ });

    let query = supabase
      .from('orders')
      .select('*')
      .in('client_id', clientIds)
      .order('order_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filter === 'today') {
      query = query.eq('order_date', todayIST);
    } else if (filter === 'last5') {
      query = query.limit(5);
    } else if (filter === 'last7days') {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      const from7 = d.toLocaleDateString(IST_LOCALE, { timeZone: IST_TZ });
      query = query.gte('order_date', from7);
    } else if (filter === 'thisMonth') {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        .toLocaleDateString(IST_LOCALE, { timeZone: IST_TZ });
      query = query.gte('order_date', firstDay);
    } else if (filter === 'custom' && fromDate && toDate) {
      query = query.gte('order_date', fromDate).lte('order_date', toDate);
    } else {
      query = query.limit(5); // fallback to last5
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as Order[];
  },

  /**
   * Creates a new order in Supabase.
   * order_amount is computed by the caller (tanker_count × price_per_tanker)
   * and passed as a stored snapshot — never recomputed after save.
   */
  createOrder: async (
    order: Omit<Order, 'id' | 'created_at'>
  ): Promise<Order> => {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Order;
  },

  /**
   * Updates an existing order record.
   */
  updateOrder: async (
    id: string,
    updates: Partial<Omit<Order, 'id' | 'created_at' | 'client_id'>>
  ): Promise<void> => {
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(error.message);
  },
};