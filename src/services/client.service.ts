// src/services/client.service.ts
// Service layer for client management, bridging with the Zustand store.

import { Client, ClientWithBalance } from '@/types/client.types';
import { useClientStore } from '@/store/client.store';
import { useOrderStore } from '@/store/order.store';
import { usePaymentStore } from '@/store/payment.store';
import { calculateLedger } from '@/utils/ledger.utils';

export const ClientService = {
  /**
   * Fetches all clients and calculates their current outstanding balances.
   */
  getAllClients: async (): Promise<ClientWithBalance[]> => {
    return new Promise((resolve) => {
      const clients = useClientStore.getState().clients;
      const allOrders = useOrderStore.getState().orders;
      const allPayments = usePaymentStore.getState().payments;

      const clientsWithBalances = clients.map((c) => {
        const clientOrders = allOrders.filter((o) => o.client_id === c.id);
        const clientPayments = allPayments.filter((p) => p.client_id === c.id);
        
        const ledger = calculateLedger(clientOrders, clientPayments);
        const balance = ledger.closing_balance;
        
        let balance_type: 'pending' | 'advance' | 'zero' = 'zero';
        if (balance > 0) {
          balance_type = 'pending';
        } else if (balance < 0) {
          balance_type = 'advance';
        }

        return {
          ...c,
          pending_balance: balance,
          balance_type,
        };
      });

      resolve(clientsWithBalances);
    });
  },

  /**
   * Fetches a single client by ID, including balance calculation.
   */
  getClientById: async (id: string): Promise<ClientWithBalance | null> => {
    return new Promise((resolve) => {
      const client = useClientStore.getState().clients.find((c) => c.id === id);
      if (!client) {
        resolve(null);
        return;
      }

      const clientOrders = useOrderStore.getState().orders.filter((o) => o.client_id === id);
      const clientPayments = usePaymentStore.getState().payments.filter((p) => p.client_id === id);
      
      const ledger = calculateLedger(clientOrders, clientPayments);
      const balance = ledger.closing_balance;
      
      let balance_type: 'pending' | 'advance' | 'zero' = 'zero';
      if (balance > 0) {
        balance_type = 'pending';
      } else if (balance < 0) {
        balance_type = 'advance';
      }

      resolve({
        ...client,
        pending_balance: balance,
        balance_type,
      });
    });
  },

  /**
   * Adds a new client to the local database.
   */
  createClient: async (
    client: Omit<Client, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Client> => {
    return new Promise((resolve) => {
      const newClient = useClientStore.getState().addClient(client);
      resolve(newClient);
    });
  },

  /**
   * Updates an existing client details.
   */
  updateClient: async (
    id: string,
    updates: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<void> => {
    return new Promise((resolve) => {
      useClientStore.getState().updateClient(id, updates);
      resolve();
    });
  },

  /**
   * Deletes a client.
   */
  deleteClient: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      useClientStore.getState().deleteClient(id);
      resolve();
    });
  },
};
