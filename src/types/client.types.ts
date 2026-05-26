// src/types/client.types.ts
// Shared Client interfaces for the ledger system.

export interface Client {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  address: string;
  default_price_per_tanker: number;
}

export interface ClientWithBalance extends Client {
  pending_balance: number; // Positive = client owes, Negative = client has advance, 0 = clean
  balance_type: 'pending' | 'advance' | 'zero';
}
