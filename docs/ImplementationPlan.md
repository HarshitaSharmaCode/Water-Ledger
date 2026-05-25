# Implementation Plan — The Indian Water Tanker

## Phase 1 — Setup [3–4 days]
- [ ] Init Next.js 15 project (App Router, TypeScript, Turbopack)
- [ ] Configure folder structure per folder-structure.md
- [ ] Set up `.env.local` with Supabase URL + anon key
- [ ] Create `src/constants/env.ts` — only file reading process.env.*
- [ ] Create `src/constants/index.ts` — routes, magic strings, numeric defaults (DEFAULT_TANKER_COUNT = 1)
- [ ] Set up `src/styles/tokens.css` — all color, typography, spacing tokens
- [ ] Set up `src/styles/globals.css` — resets, base styles, token imports
- [ ] Configure `next.config.js` — `output: 'export'` for Capacitor compatibility
- [ ] Install + configure Tailwind CSS
- [ ] Install Framer Motion, Zustand, Supabase JS client
- [ ] Install + configure next-intl
- [ ] Create `/src/locales/en.json` + `/src/locales/hi.json` — all UI strings
- [ ] Language toggle component → `src/components/ui/LanguageToggle.tsx`
- [ ] Persist language choice in localStorage via Zustand store
- [ ] Configure `rules.json` in AntiGravity IDE
- [ ] Create Supabase project — set up `clients`, `orders`, `payments` tables per BackendSchema.md
- [ ] Enable Row Level Security (RLS) on all tables — single operator policy

## Phase 2 — Auth [2–3 days]
- [ ] Create Supabase auth user (single operator email+password)
- [ ] `src/services/auth.service.ts` — login, logout, session check
- [ ] Login page (`/app/login`) — email + password form, error state
- [ ] Auth guard — redirect unauthenticated users to `/login`
- [ ] Persist session client-side via Supabase client
- [ ] Logout button in app header

## Phase 3 — Client Management [3–4 days]
- [ ] `src/types/client.types.ts` — Client interface
- [ ] `src/services/client.service.ts` — fetch all, fetch by id, create, update
- [ ] `src/store/client.store.ts` — Zustand store for client list + selected client
- [ ] Clients List page — search by name/phone, client cards, add client button
- [ ] Add Client form — name, phone, address, default_price_per_tanker
- [ ] Client Profile page — summary card, current balance, action buttons
- [ ] Edit Client form — all fields editable, price change warning displayed

## Phase 4 — Orders [3–4 days]
- [ ] `src/types/order.types.ts` — Order interface
- [ ] `src/services/order.service.ts` — fetch by client, create, update
- [ ] `src/store/order.store.ts` — Zustand store for orders per client
- [ ] Order Entry form — date, location type, location other, called by, tanker count, price_per_tanker (pre-filled + editable), note
- [ ] Auto-compute `order_amount` on form (tanker_count × price_per_tanker) — display before save
- [ ] Save order → refresh client balance → return to Client Profile

## Phase 5 — Payments [2–3 days]
- [ ] `src/types/payment.types.ts` — Payment interface
- [ ] `src/services/payment.service.ts` — fetch by client, create
- [ ] `src/store/payment.store.ts` — Zustand store for payments per client
- [ ] Payment Entry form — date, amount, note (optional)
- [ ] Save payment → refresh client balance → return to Client Profile

## Phase 6 — Ledger View [3–4 days]
- [ ] `src/utils/ledger.utils.ts` — merge orders + payments, sort by date, compute running balance
- [ ] Client Ledger page — chronological entries, balance after each row, color-coded pending/advance
- [ ] Date range filter (from → to) — filters displayed entries + recalculates
- [ ] Ledger share — generate formatted text summary for selected date range → wa.me pre-filled link to client phone (free, no API)
- [ ] Empty state — no entries in range

## Phase 7 — Dashboard [2 days]
- [ ] `src/utils/dashboard.utils.ts` — aggregate total pending across all clients
- [ ] Dashboard page — total clients count, total pending amount, last 5 orders across all clients
- [ ] Quick-navigate from recent order row → Client Profile

## Phase 8 — Polish & QA [3–4 days]
- [ ] Framer Motion — modal open/close, list entry animations, page transitions
- [ ] Responsive QA — mobile, tablet, desktop for every screen
- [ ] Error state coverage — network failure banners, form error messages
- [ ] Empty state coverage — all screens
- [ ] Mobile tap target audit (min 44px)
- [ ] Bottom-anchored action buttons on mobile
- [ ] Accessibility pass — labels, contrast, focus states
- [ ] Hindi translation QA — verify all keys present in hi.json, Devanagari renders correctly

## Phase 9 — Deployment [1–2 days]
- [ ] Push to GitHub
- [ ] Connect repo to Vercel
- [ ] Set env vars in Vercel dashboard (Supabase URL + anon key)
- [ ] Test production build
- [ ] Verify `output: 'export'` static build works end-to-end

## Phase 10 — Capacitor (Post-MVP)
- [ ] Install Capacitor CLI
- [ ] `capacitor.config.json` at root
- [ ] `npx cap add android` + `npx cap add ios`
- [ ] Test on device
- [ ] Replace any browser-only APIs if flagged
