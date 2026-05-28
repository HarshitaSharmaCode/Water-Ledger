// src/store/client.store.ts
// Zustand store for client list state.
// Pure state container — NO Supabase calls, NO local mutations that generate IDs.
// All writes go through src/services/client.service.ts.

import { create } from 'zustand';
import { Client, ClientWithBalance } from '@/types/client.types';

interface ClientState {
  /** Full client list with computed balances, fetched from Supabase. */
  clients: ClientWithBalance[];
  /** Whether a client list fetch is in progress. */
  isLoading: boolean;
  /** Error message from the last failed fetch, or null. */
  error: string | null;
  /** Search query for filtering client list in UI. */
  searchQuery: string;
  /** Currently selected client ID for profile/ledger views. */
  selectedClientId: string | null;

  setClients: (clients: ClientWithBalance[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedClientId: (id: string | null) => void;
  /** Optimistically update a single client in the list after an edit. */
  updateClientInCache: (id: string, updates: Partial<Client>) => void;
  /** Optimistically add a new client to the top of the list. */
  addClientToCache: (client: ClientWithBalance) => void;
}

export const useClientStore = create<ClientState>()((set) => ({
  clients: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedClientId: null,

  setClients: (clients) => set({ clients, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedClientId: (selectedClientId) => set({ selectedClientId }),

  updateClientInCache: (id, updates) =>
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === id
          ? { ...c, ...updates, updated_at: new Date().toISOString() }
          : c
      ),
    })),

  addClientToCache: (client) =>
    set((state) => ({ clients: [client, ...state.clients] })),
}));
