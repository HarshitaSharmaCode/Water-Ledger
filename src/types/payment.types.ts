// src/types/payment.types.ts
// Shared Payment interfaces for the ledger.

export interface Payment {
  id: string;
  created_at: string;
  client_id: string;
  payment_date: string; // YYYY-MM-DD
  amount: number;
  note: string | null;
}
