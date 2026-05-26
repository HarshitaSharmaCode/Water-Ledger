// src/utils/dashboard.utils.ts
// Dashboard metrics calculation utility.

import { Client } from '@/types/client.types';
import { Order } from '@/types/order.types';
import { Payment } from '@/types/payment.types';
import { calculateLedger } from './ledger.utils';

export interface DashboardStats {
  totalClientsCount: number;
  totalPendingAmount: number; // Sum of positive pending balances across all clients
  recentOrders: (Order & { clientName: string })[];
}

/**
 * Calculates dashboard statistics from active client list, orders, and payments.
 */
export const calculateDashboardStats = (
  clients: Client[],
  allOrders: Order[],
  allPayments: Payment[]
): DashboardStats => {
  let totalPendingAmount = 0;

  clients.forEach((c) => {
    const clientOrders = allOrders.filter((o) => o.client_id === c.id);
    const clientPayments = allPayments.filter((p) => p.client_id === c.id);
    
    // Running balance per client = orders - payments
    const ledger = calculateLedger(clientOrders, clientPayments);
    const balance = ledger.closing_balance;

    if (balance > 0) {
      totalPendingAmount += balance;
    }
  });

  // Sort orders by date & created_at descending to get the most recent ones
  const sortedOrders = [...allOrders].sort((a, b) => {
    if (a.order_date !== b.order_date) {
      return b.order_date.localeCompare(a.order_date);
    }
    return b.created_at.localeCompare(a.created_at);
  });

  const recentOrdersWithClients = sortedOrders.slice(0, 5).map((order) => {
    const client = clients.find((c) => c.id === order.client_id);
    return {
      ...order,
      clientName: client ? client.name : 'Unknown Client',
    };
  });

  return {
    totalClientsCount: clients.length,
    totalPendingAmount,
    recentOrders: recentOrdersWithClients,
  };
};
