// src/services/client.service.ts
// Supabase service layer for client CRUD operations.
// Per global-rules.md: ALL Supabase calls live here only.
// No store imports, no component imports.

import { supabase, getAuthUserId } from '@/lib/supabase';
import { Client, ClientWithBalance } from '@/types/client.types';
import { Order } from '@/types/order.types';
import { Payment } from '@/types/payment.types';
import { calculateLedger } from '@/utils/ledger.utils';

/**
 * Fetches all clients scoped to the current user.
 * RLS enforces this at DB level; explicit filter is belt-and-suspenders.
 */
const fetchAllClients = async (): Promise<Client[]> => {
  const userId = await getAuthUserId();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Client[];
};

export const ClientService = {
  /**
   * Fetches all clients with live-computed balances.
   * Balance is never stored in DB — always computed via ledger.utils.ts.
   */
  getAllClients: async (): Promise<ClientWithBalance[]> => {
    const clients = await fetchAllClients();

    const clientIds = clients.map((c) => c.id);

    const [ordersRes, paymentsRes] = await Promise.all([
      supabase.from('orders').select('*').in('client_id', clientIds),
      supabase.from('payments').select('*').in('client_id', clientIds),
    ]);

    if (ordersRes.error) throw new Error(ordersRes.error.message);
    if (paymentsRes.error) throw new Error(paymentsRes.error.message);

    const allOrders = (ordersRes.data ?? []) as Order[];
    const allPayments = (paymentsRes.data ?? []) as Payment[];

    return clients.map((c) => {
      const clientOrders = allOrders.filter((o) => o.client_id === c.id);
      const clientPayments = allPayments.filter((p) => p.client_id === c.id);
      const ledger = calculateLedger(clientOrders, clientPayments);
      const balance = ledger.closing_balance;

      let balance_type: 'pending' | 'advance' | 'zero' = 'zero';
      if (balance > 0) balance_type = 'pending';
      else if (balance < 0) balance_type = 'advance';

      return { ...c, pending_balance: balance, balance_type };
    });
  },

  /**
   * Fetches a single client by ID scoped to the current user.
   * RLS enforces ownership at DB level; explicit user_id filter is belt-and-suspenders.
   */
  getClientById: async (id: string): Promise<ClientWithBalance | null> => {
    const userId = await getAuthUserId();

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // not found
      throw new Error(error.message);
    }

    const client = data as Client;

    const [ordersRes, paymentsRes] = await Promise.all([
      supabase.from('orders').select('*').eq('client_id', id),
      supabase.from('payments').select('*').eq('client_id', id),
    ]);

    if (ordersRes.error) throw new Error(ordersRes.error.message);
    if (paymentsRes.error) throw new Error(paymentsRes.error.message);

    const ledger = calculateLedger(
      (ordersRes.data ?? []) as Order[],
      (paymentsRes.data ?? []) as Payment[]
    );
    const balance = ledger.closing_balance;

    let balance_type: 'pending' | 'advance' | 'zero' = 'zero';
    if (balance > 0) balance_type = 'pending';
    else if (balance < 0) balance_type = 'advance';

    return { ...client, pending_balance: balance, balance_type };
  },

  /**
   * Creates a new client in Supabase.
   */
  createClient: async (
    client: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ): Promise<Client> => {
    const userId = await getAuthUserId();

    const { data, error } = await supabase
      .from('clients')
      .insert({ ...client, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Client;
  },

  /**
   * Updates a client record in Supabase.
   * Sets updated_at to now() as a client-side timestamp.
   */
  updateClient: async (
    id: string,
    updates: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>>
  ): Promise<void> => {
    const { error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  /**
   * Deletes a client and all associated orders + payments.
   * Child records are deleted explicitly — CASCADE on FK is not assumed.
   * user_id guard is belt-and-suspenders on top of RLS.
   *
   * Throws "PENDING_BALANCE" if the client has an outstanding positive balance.
   * Callers must handle this error and surface it to the user.
   */
  deleteClient: async (id: string): Promise<void> => {
    const userId = await getAuthUserId();

    // Guard: block deletion if the client still has pending amount owed.
    const [ordersCheck, paymentsCheck] = await Promise.all([
      supabase.from('orders').select('*').eq('client_id', id),
      supabase.from('payments').select('*').eq('client_id', id),
    ]);
    if (ordersCheck.error) throw new Error(ordersCheck.error.message);
    if (paymentsCheck.error) throw new Error(paymentsCheck.error.message);

    const ledgerCheck = calculateLedger(
      (ordersCheck.data ?? []) as Order[],
      (paymentsCheck.data ?? []) as Payment[]
    );
    if (ledgerCheck.closing_balance > 0) {
      throw new Error('PENDING_BALANCE');
    }

    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .eq('client_id', id);
    if (ordersError) throw new Error(ordersError.message);

    const { error: paymentsError } = await supabase
      .from('payments')
      .delete()
      .eq('client_id', id);
    if (paymentsError) throw new Error(paymentsError.message);

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  },
};