// src/constants/index.ts
// Named exports for centralizing all magic numbers, routes, and defaults.

export const DEFAULT_TANKER_COUNT = 1;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CLIENTS: '/clients',
};

export const LOCAL_STORAGE_KEYS = {
  LANGUAGE: 'tiwt_language',
  CLIENTS: 'tiwt_clients',
  ORDERS: 'tiwt_orders',
  PAYMENTS: 'tiwt_payments',
  AUTH: 'tiwt_auth_operator',
};

export const DATE_FORMAT_LOCALE = 'en-IN';
