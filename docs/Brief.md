# Brief — The Indian Water Tanker

PRD.md                — CRM + Khata ledger for a water tanker business; single operator manages clients, orders, payments, and running balances with WhatsApp ledger share.

TRD.md                — Next.js 15 (App Router, Turbopack), Tailwind + Custom CSS, Zustand, Supabase (DB + Auth), next-intl (EN/HI), Vercel hosting, Capacitor-ready static export.

AppFlow.md            — Auth → Dashboard → Clients List → Client Profile → Order/Payment Entry → Ledger View; language toggle on every screen; covers all error and empty states.

UIUXBrief.md          — Blue-primary professional palette, Inter font, 8px radius, subtle Framer Motion animations, mobile-first with 44px tap targets and bottom-anchored actions.

BackendSchema.md      — Three tables: clients, orders, payments; price_per_tanker snapshotted per order; balance computed client-side via ledger.utils.ts; Supabase auto-generated REST.

ImplementationPlan.md — 10 phases: Setup → Auth → Clients → Orders → Payments → Ledger → Dashboard → Polish → Deployment → Capacitor; estimated 3–4 weeks to production.

rules.json            — AntiGravity IDE config; Next.js + TypeScript strict mode; Zustand; next-intl i18n; Capacitor constraints enabled; all architectural rules enforced.

global-rules.md       — Zero duplication, env vars via env.ts only, all API calls in /services, types in /types, balance logic in ledger.utils.ts, i18n strings in /locales only.

Brief.md              — This file.
