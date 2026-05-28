// src/utils/dashboard.utils.ts
// Dashboard metrics calculation utility.

import { ClientWithBalance } from '@/types/client.types';
import { Order } from '@/types/order.types';

export interface DashboardStats {
  totalClientsCount: number;
  totalPendingAmount: number;
  recentOrders: (Order & { clientName: string })[];
}

/**
 * Calculates dashboard statistics from clients-with-balances and pre-fetched recent orders.
 * Balances are already computed in ClientWithBalance — no re-calculation needed here.
 */
export const calculateDashboardStats = (
  clients: ClientWithBalance[],
  recentOrders: Order[],
): DashboardStats => {
  const totalPendingAmount = clients
    .filter((c) => c.balance_type === 'pending')
    .reduce((sum, c) => sum + c.pending_balance, 0);

  const recentOrdersWithClients = recentOrders.map((order) => {
    const client = clients.find((c) => c.id === order.client_id);
    return {
      ...order,
      clientName: client?.name ?? 'Unknown Client',
    };
  });

  return {
    totalClientsCount: clients.length,
    totalPendingAmount,
    recentOrders: recentOrdersWithClients,
  };
};