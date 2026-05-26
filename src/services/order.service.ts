// src/services/order.service.ts
// Service layer for order tracking and storage.

import { Order } from '@/types/order.types';
import { useOrderStore } from '@/store/order.store';

export const OrderService = {
  /**
   * Fetches orders associated with a specific client.
   */
  getOrdersByClient: async (clientId: string): Promise<Order[]> => {
    return new Promise((resolve) => {
      const orders = useOrderStore.getState().getOrdersByClient(clientId);
      resolve(orders);
    });
  },

  /**
   * Logs a new order to the database.
   */
  createOrder: async (
    order: Omit<Order, 'id' | 'created_at'>
  ): Promise<Order> => {
    return new Promise((resolve) => {
      const newOrder = useOrderStore.getState().addOrder(order);
      resolve(newOrder);
    });
  },

  /**
   * Deletes a recorded order.
   */
  deleteOrder: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      useOrderStore.getState().deleteOrder(id);
      resolve();
    });
  },
};
