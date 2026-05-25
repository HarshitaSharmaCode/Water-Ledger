# PRD — The Indian Water Tanker

## Overview
Internal CRM + Khata ledger for a water tanker supply business. Used by a single operator to manage a fixed client base, log orders, record lump-sum payments, and track running pending/advance balances per client.

## Goals
- Eliminate manual register/paper khata
- Instant visibility into what each client owes
- Fast order entry during a phone call
- Accurate per-client balance at all times

## MVP Features
| Feature | Priority | Notes |
|---------|----------|-------|
| Client management (add/view/edit) | Must-have | Name, phone, address, price-per-tanker |
| Order logging | Must-have | Date, location (home/other), who called, tanker count (default 1), optional note |
| Payment logging | Must-have | Lump-sum payment on any date, not tied to a single order |
| Running balance per client | Must-have | Auto-calculated: cumulative order value minus cumulative payments |
| Client ledger view | Must-have | Chronological list of orders + payments with balance after each entry |
| Client ledger share via WhatsApp | Must-have | Date range filter → formatted text → wa.me pre-fill to client's saved number (free, no API cost) |

## Non-Functional Requirements
- Performance: Ledger and balance must recalculate instantly on entry
- Security: Single-user login, no data exposed without auth
- Accessibility: Usable on mobile browser before Capacitor conversion

## Out of Scope (MVP)
- Multi-user / staff roles
- Notifications or reminders
- Invoice/receipt generation
- Analytics or reports
- SMS/WhatsApp Business API integration

## Success Metrics
| Metric | Target |
|--------|--------|
| Order entry time | < 30 seconds per order |
| Balance accuracy | 100% — zero manual calculation |
| Client lookup time | < 5 seconds |
