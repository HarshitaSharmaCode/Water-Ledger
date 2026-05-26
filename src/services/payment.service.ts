// src/services/payment.service.ts
// Service layer managing client payment logs.

import { Payment } from '@/types/payment.types';
import { usePaymentStore } from '@/store/payment.store';

export const PaymentService = {
  /**
   * Fetches payments associated with a specific client.
   */
  getPaymentsByClient: async (clientId: string): Promise<Payment[]> => {
    return new Promise((resolve) => {
      const payments = usePaymentStore.getState().getPaymentsByClient(clientId);
      resolve(payments);
    });
  },

  /**
   * Logs a new payment from a client.
   */
  createPayment: async (
    payment: Omit<Payment, 'id' | 'created_at'>
  ): Promise<Payment> => {
    return new Promise((resolve) => {
      const newPayment = usePaymentStore.getState().addPayment(payment);
      resolve(newPayment);
    });
  },

  /**
   * Deletes a recorded payment transaction.
   */
  deletePayment: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      usePaymentStore.getState().deletePayment(id);
      resolve();
    });
  },
};
