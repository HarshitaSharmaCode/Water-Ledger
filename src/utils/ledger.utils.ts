// src/utils/ledger.utils.ts
// Single source of truth for all ledger balance calculations as per global-rules.md.

import { Order } from '@/types/order.types';
import { Payment } from '@/types/payment.types';

export interface LedgerEntry {
  id: string;
  date: string;
  created_at: string;
  type: 'order' | 'payment';
  amount: number; // For the row itself (always positive display)
  change: number; // Positive for order (+amount), Negative for payment (-amount)
  running_balance: number;
  details: string;
  note: string | null;
  rawItem: Order | Payment;
}

export interface LedgerResult {
  entries: LedgerEntry[];
  opening_balance: number;
  closing_balance: number;
  total_order_amount: number;
  total_payment_amount: number;
}

/**
 * Merges and sorts orders and payments chronologically to compute a running balance statement.
 */
export const calculateLedger = (
  orders: Order[],
  payments: Payment[],
  fromDate?: string,
  toDate?: string
): LedgerResult => {
  // 1. Combine all transactions into a single list
  const rawEntries: {
    id: string;
    date: string;
    created_at: string;
    type: 'order' | 'payment';
    amount: number;
    change: number;
    details: string;
    note: string | null;
    rawItem: Order | Payment;
  }[] = [];

  orders.forEach((o) => {
    rawEntries.push({
      id: o.id,
      date: o.order_date,
      created_at: o.created_at,
      type: 'order',
      amount: o.order_amount,
      change: o.order_amount,
      details: `${o.tanker_count} Tanker(s) @ ₹${o.price_per_tanker} (Called by: ${o.called_by})`,
      note: o.note,
      rawItem: o,
    });
  });

  payments.forEach((p) => {
    rawEntries.push({
      id: p.id,
      date: p.payment_date,
      created_at: p.created_at,
      type: 'payment',
      amount: p.amount,
      change: -p.amount,
      details: `Lump-sum Payment`,
      note: p.note,
      rawItem: p,
    });
  });

  // 2. Sort chronologically by date
  // If dates are identical, sort by created_at timestamp.
  // If created_at is identical, orders precede payments so that invoices are logged before payment entries.
  rawEntries.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    if (a.created_at !== b.created_at) {
      return a.created_at.localeCompare(b.created_at);
    }
    if (a.type !== b.type) {
      return a.type === 'order' ? -1 : 1; // Order first
    }
    return 0;
  });

  // 3. Compute running balance for all transactions
  let currentBalance = 0;
  const computedEntries: LedgerEntry[] = rawEntries.map((entry) => {
    currentBalance += entry.change;
    return {
      ...entry,
      running_balance: currentBalance,
    };
  });

  // 4. Apply date filters if provided
  let filteredEntries = computedEntries;
  let openingBalance = 0;
  let closingBalance = currentBalance;

  if (fromDate || toDate) {
    const start = fromDate ? fromDate : '0000-00-00';
    const end = toDate ? toDate : '9999-99-99';

    // Prior transactions for opening balance
    const priorTransactions = computedEntries.filter((e) => e.date < start);
    openingBalance = priorTransactions.length > 0 
      ? priorTransactions[priorTransactions.length - 1].running_balance 
      : 0;

    // Filtered range entries
    filteredEntries = computedEntries.filter((e) => e.date >= start && e.date <= end);
    
    // Adjust running balance in filtered view to reflect sequential accumulation from opening balance
    let rolling = openingBalance;
    filteredEntries = filteredEntries.map((e) => {
      rolling += e.change;
      return {
        ...e,
        running_balance: rolling,
      };
    });

    closingBalance = filteredEntries.length > 0 
      ? filteredEntries[filteredEntries.length - 1].running_balance 
      : openingBalance;
  }

  // Calculate aggregations within the filtered set
  let totalOrderAmount = 0;
  let totalPaymentAmount = 0;
  filteredEntries.forEach((e) => {
    if (e.type === 'order') {
      totalOrderAmount += e.amount;
    } else {
      totalPaymentAmount += e.amount;
    }
  });

  return {
    entries: filteredEntries,
    opening_balance: openingBalance,
    closing_balance: closingBalance,
    total_order_amount: totalOrderAmount,
    total_payment_amount: totalPaymentAmount,
  };
};

/**
 * Format ledger for sharing on WhatsApp as formatted text.
 */
export const formatLedgerForWhatsApp = (
  clientName: string,
  result: LedgerResult,
  fromDate?: string,
  toDate?: string,
  t?: (key: string, values?: any) => string
): string => {
  const formatText = (key: string, defaultText: string, values?: any) => {
    if (t) {
      try {
        return t(key, values);
      } catch (e) {
        // fallback
      }
    }
    return defaultText;
  };

  const startStr = fromDate || 'Beginning';
  const endStr = toDate || 'Today';

  const rows = result.entries.map((e) => {
    const prefix = e.type === 'order' ? '📝 Order' : '💰 Pay';
    const sign = e.type === 'order' ? '+' : '-';
    const balanceSign = e.running_balance >= 0 ? 'Due' : 'Adv';
    const cleanBalance = Math.abs(e.running_balance);

    return `• [${e.date}] ${prefix}: ₹${e.amount}\n   Bal: ₹${cleanBalance} ${balanceSign}`;
  }).join('\n\n');

  const finalBalStr = result.closing_balance >= 0 
    ? `₹${result.closing_balance} Pending` 
    : `₹${Math.abs(result.closing_balance)} Advance`;

  return `*Water Tanker Ledger Statement*\n` +
         `*Client:* ${clientName}\n` +
         `*Period:* ${startStr} to ${endStr}\n` +
         `-----------------------------\n` +
         `*Opening Bal:* ₹${Math.abs(result.opening_balance)} ${result.opening_balance >= 0 ? 'Pending' : 'Advance'}\n\n` +
         `${rows || 'No entries in range'}\n\n` +
         `-----------------------------\n` +
         `*Total Bills:* ₹${result.total_order_amount}\n` +
         `*Total Payments:* ₹${result.total_payment_amount}\n` +
         `*Final Balance:* *${finalBalStr}*\n\n` +
         `Thank you!\n` +
         `_Generated by Water Tanker Khata_`;
};
