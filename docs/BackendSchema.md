# Backend Schema — The Indian Water Tanker

## clients
| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK, auto | |
| created_at | timestamp | NOT NULL, default now() | |
| updated_at | timestamp | NOT NULL, default now() | |
| name | text | NOT NULL | |
| phone | text | NOT NULL, UNIQUE | |
| address | text | NOT NULL | |
| default_price_per_tanker | numeric(10,2) | NOT NULL | Pre-fills order form only. Changing this does not affect past orders. |

## orders
| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK, auto | |
| created_at | timestamp | NOT NULL, default now() | |
| client_id | uuid | FK → clients.id, NOT NULL | |
| order_date | date | NOT NULL | Date operator logs the order |
| location_type | text | NOT NULL | ENUM: 'home', 'other' |
| location_other | text | NULLABLE | Only populated if location_type = 'other' |
| called_by | text | NOT NULL | Who called for the order |
| tanker_count | integer | NOT NULL, default 1 | Min: 1 |
| price_per_tanker | numeric(10,2) | NOT NULL | Snapshot at time of entry — editable per order before save |
| order_amount | numeric(10,2) | NOT NULL | Stored computed value: tanker_count × price_per_tanker. Never recomputed after save. |
| note | text | NULLABLE | Optional operator remark |

## payments
| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK, auto | |
| created_at | timestamp | NOT NULL, default now() | |
| client_id | uuid | FK → clients.id, NOT NULL | |
| payment_date | date | NOT NULL | |
| amount | numeric(10,2) | NOT NULL | Lump-sum — not tied to a single order |
| note | text | NULLABLE | Optional operator remark |

## Relationships
- clients 1→N orders: via orders.client_id
- clients 1→N payments: via payments.client_id

## Indexes
| Table | Field | Reason |
|-------|-------|--------|
| orders | client_id | Fast client ledger fetch |
| orders | order_date | Date range filtering |
| payments | client_id | Fast client ledger fetch |
| payments | payment_date | Date range filtering |

## Balance Calculation Logic
- Computed client-side, never stored in DB
- Running balance per client = Σ(order_amount) − Σ(payments.amount)
- Positive = pending (client owes) | Negative = advance (client overpaid)
- Ledger view merges orders + payments sorted by date → calculates balance after each entry chronologically
- Single source of truth: src/utils/ledger.utils.ts

## API Endpoints (Supabase Auto-generated REST)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /rest/v1/clients | Required | Fetch all clients |
| POST | /rest/v1/clients | Required | Add new client |
| PATCH | /rest/v1/clients?id=eq.{id} | Required | Edit client |
| GET | /rest/v1/orders?client_id=eq.{id} | Required | Fetch orders for a client |
| POST | /rest/v1/orders | Required | Log new order |
| PATCH | /rest/v1/orders?id=eq.{id} | Required | Edit order |
| GET | /rest/v1/payments?client_id=eq.{id} | Required | Fetch payments for a client |
| POST | /rest/v1/payments | Required | Log new payment |
