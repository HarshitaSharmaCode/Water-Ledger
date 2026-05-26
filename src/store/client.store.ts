// src/store/client.store.ts
// Zustand store for managing local client database. Persisted to localStorage.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client } from '@/types/client.types';
import { LOCAL_STORAGE_KEYS } from '@/constants';

interface ClientState {
  clients: Client[];
  searchQuery: string;
  selectedClientId: string | null;
  setSearchQuery: (query: string) => void;
  setSelectedClientId: (id: string | null) => void;
  addClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Client;
  updateClient: (id: string, updates: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>) => void;
  deleteClient: (id: string) => void;
}

// Pre-seeded Indian clients for immediate CRM utility
const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    name: 'Rajesh Kumar',
    phone: '9876543210',
    address: 'A-45, Vikas Nagar, New Delhi',
    default_price_per_tanker: 500.00,
  },
  {
    id: 'client-2',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
    updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    name: 'Sharma Sweets',
    phone: '8765432109',
    address: '12, Main Market, Sector 15, Rohini',
    default_price_per_tanker: 600.00,
  },
  {
    id: 'client-3',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    name: 'Pooja Apartments',
    phone: '7654321098',
    address: 'Pocket C, Block 3, Mayur Vihar Phase 1',
    default_price_per_tanker: 450.00,
  },
];

export const useClientStore = create<ClientState>()(
  persist(
    (set) => ({
      clients: INITIAL_CLIENTS,
      searchQuery: '',
      selectedClientId: null,
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedClientId: (id) => set({ selectedClientId: id }),
      
      addClient: (clientData) => {
        const newClient: Client = {
          ...clientData,
          id: `client-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        set((state) => ({
          clients: [newClient, ...state.clients],
        }));
        
        return newClient;
      },
      
      updateClient: (id, updates) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...updates,
                  updated_at: new Date().toISOString(),
                }
              : c
          ),
        }));
      },
      
      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
          selectedClientId: state.selectedClientId === id ? null : state.selectedClientId,
        }));
      },
    }),
    {
      name: LOCAL_STORAGE_KEYS.CLIENTS,
    }
  )
);
