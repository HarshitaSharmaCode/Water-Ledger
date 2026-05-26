// src/types/order.types.ts
// Shared Order interface matching schema requirements.

export type LocationType = 'home' | 'other';

export interface Order {
  id: string;
  created_at: string;
  client_id: string;
  order_date: string; // YYYY-MM-DD
  location_type: LocationType;
  location_other: string | null;
  called_by: string;
  tanker_count: number;
  price_per_tanker: number;
  order_amount: number; // Stored computed count * price_per_tanker
  note: string | null;
}
