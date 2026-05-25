# TRD — The Indian Water Tanker

## Stack
| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 15 (App Router) | Routing, SSR-optional, Capacitor-compatible with static export |
| Bundler | Turbopack | Built into Next.js 15, no config needed |
| Styling | Tailwind CSS + Custom CSS tokens | Utility-first speed + full design control via tokens.css |
| Animation | Framer Motion | Subtle transitions only — list entries, modals |
| State | Zustand | Lightweight, minimal boilerplate, no overkill for single-user app |
| Backend | Supabase | Postgres DB + REST API + Auth + Realtime — all in one, free tier |
| Database | Supabase Postgres | Relational — required for ledger calculations and joins |
| Auth | Supabase Auth (Email + Password) | Built-in, single operator account |
| i18n | next-intl | Best-in-class for Next.js App Router, supports Hindi (Devanagari) natively |
| Hosting | Vercel | Zero-config Next.js deploy, free tier |

## External APIs
None

## Architecture Notes
- Supabase client runs client-side only (required for Capacitor later)
- All balance calculations done client-side after fetching raw orders + payments — no stored computed fields
- Running balance = Σ(orders × price_per_tanker) − Σ(payments) up to each ledger entry date
- Orders have an optional `note` field for free-text operator remarks
- Payments have an optional `note` field for free-text operator remarks
- price_per_tanker stored as snapshot on each order row at time of entry — never recomputed from client record
- Client record holds default_price_per_tanker as pre-fill only — updating it affects future orders only
- Language preference stored in localStorage — persists across sessions, no page reload on toggle
- All UI strings sourced from /src/locales/en.json + /src/locales/hi.json — zero hardcoded strings in components
- Static export enabled from day one (output: 'export' in next.config.js) — Capacitor-ready
- WhatsApp share via free wa.me URL scheme — no API cost

## Constraints
- No SSR data fetching — all Supabase calls via client-side hooks
- No Next.js API routes — Supabase is the backend
- No middleware — auth handled via Supabase client session check
- No server components that fetch data — use client components only
- Single operator — no role/permission system needed

## Capacitor Config (web→mobile)
- output: `export` (static)
- webDir: `out`
- No SSR | No API routes | No middleware | No server components
- Data fetching: client-side only → Supabase project URL via env.ts
