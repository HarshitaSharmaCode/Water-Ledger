// src/services/payment.service.ts
// Supabase service layer for payment operations.
// Per global-rules.md: ALL Supabase calls live here only. No store imports.

import { supabase, getAuthUserId } from '@/lib/supabase';
import { Payment } from '@/types/payment.types';

export const PaymentService = {
  /**
   * Fetches all payments for a specific client, sorted by payment_date descending.
   */
  getPaymentsByClient: async (clientId: string): Promise<Payment[]> => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('client_id', clientId)
      .order('payment_date', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Payment[];
  },


  /*
   * Returns total payments received today (IST) across all user-scoped clients.
   * Used by the dashboard "Received Today" stat card.
   */
  getTodayTotal: async (): Promise<number> => {
    const userId = await getAuthUserId();

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId);

    if (clientError) throw new Error(clientError.message);
    const clientIds = (clientData ?? []).map((c: { id: string }) => c.id);
    if (clientIds.length === 0) return 0;

    const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    const { data, error } = await supabase
      .from('payments')
      .select('amount')
      .in('client_id', clientIds)
      .eq('payment_date', todayIST);

    if (error) throw new Error(error.message);
    return (data ?? []).reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
  },

  /**
   * Logs a new lump-sum payment in Supabase.
   */
  createPayment: async (
    payment: Omit<Payment, 'id' | 'created_at'>
  ): Promise<Payment> => {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Payment;
  },
};
