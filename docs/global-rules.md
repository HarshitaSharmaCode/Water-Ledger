# Global Rules — The Indian Water Tanker

## 1. No Code Duplication
- Logic used in 2+ places → /utils or /hooks
- UI used in 2+ places → /components/shared or /components/ui
- No copy-paste. No near-identical functions with minor differences.

## 2. Global Variables

### Env Vars (.env.local)
- All secrets and external config values here
- Never access process.env.* directly in components, services, or hooks
- Only /src/constants/env.ts reads process.env.*
- Export named constants from env.ts
```ts
// src/constants/env.ts
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
```

### JS Constants (/src/constants/index.ts)
- All magic strings, route paths, config values, numeric limits
- Named exports only. No default export.
```ts
// src/constants/index.ts
export const DEFAULT_TANKER_COUNT = 1
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  CLIENTS: '/clients',
  DASHBOARD: '/dashboard',
}
```

### CSS Tokens (/src/styles/tokens.css)
- All colors, spacing, font sizes, shadows, radii as CSS variables
- Format: --[category]-[name]
- No hardcoded values in component CSS
```css
/* src/styles/tokens.css */
--color-primary:  #2563EB;
--color-pending:  #F59E0B;
--color-advance:  #10B981;
```

## 3. Folder Structure
Fixed per folder-structure.md. No deviation without documenting reason in TRD.

## 4. API Calls
- All in /src/services
- One file per domain: auth.service.ts, client.service.ts, order.service.ts, payment.service.ts
- Return typed responses (types sourced from /src/types)
- No fetch / Supabase calls in components, hooks, or store files

## 5. Types
- All shared types in /src/types
- One file per domain: client.types.ts, order.types.ts, payment.types.ts
- No inline type definitions for any shared data structure
- Props types can be inline within their own component file only

## 6. State Management
- Library: Zustand
- Store files only in /src/store
- No prop drilling beyond 2 levels — use store
- No local state for data that belongs globally (client list, selected client, orders, payments, language preference)

## 7. Route Files (/app)
- Layout composition + component wiring only
- No business logic
- No direct Supabase calls
- No inline styles
- No hardcoded strings — use /constants

## 8. Balance Calculation
- Never stored in DB — always computed client-side
- Single source of truth: src/utils/ledger.utils.ts
- Formula: Σ(order_amount) − Σ(payments.amount) per client
- Positive = pending | Negative = advance

## 9. Price Per Tanker
- Stored as snapshot on each order row at time of entry
- Client's default_price_per_tanker pre-fills the form only
- Never recompute historical order_amount after save
- Price change on client record affects future orders only

## 10. Capacitor Constraints
- output: 'export' in next.config.js at all times
- No SSR | No API routes | No middleware | No server components
- All data fetching client-side via Supabase JS client

## 11. Internationalisation (i18n)
- Library: next-intl
- All UI-facing strings in /src/locales/en.json and /src/locales/hi.json only
- Zero hardcoded strings in any component, page, or form
- Language toggle rendered on every screen via shared LanguageToggle component
- Active language stored in Zustand store + persisted to localStorage under key: tiwt_language
- Never use English strings as fallback silently — missing Hindi key = visible error in dev
