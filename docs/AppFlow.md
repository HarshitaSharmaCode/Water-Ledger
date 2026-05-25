# App Flow — The Indian Water Tanker

## Auth States
- Unauthenticated → Login Page
- Authenticated → Dashboard
- Invalid credentials → Login Page (inline error: "Invalid email or password")
- Session expired → Login Page

## Screen Flow

### Auth
Login Page → enter email + password → submit → Dashboard

### Dashboard
Dashboard → displays: total clients, total pending amount across all clients, recent orders (last 5) → navigate to any section

### Clients
Dashboard → Clients List →
- Search/filter by name or phone
- Tap client → Client Profile

Client Profile →
- View: name, phone, address, price-per-tanker, current balance (pending/advance)
- Add New Order button → Order Entry Form
- Add Payment button → Payment Entry Form
- View Full Ledger button → Client Ledger View
- Edit Client button → Edit Client Form

Clients List → Add New Client button → Add Client Form → save → Client Profile

### Order Entry
Client Profile → Add New Order →
- Date (default: today)
- Location: Home / Other (if Other → text input for place)
- Who called (free text)
- Number of tankers (default: 1)
- Price per tanker (pre-filled from client default — editable per order)
- Order amount auto-computed and displayed: tanker_count × price_per_tanker
- Note (optional)
- Save → recalculate balance → Client Profile

### Payment Entry
Client Profile → Add Payment →
- Date (default: today)
- Amount paid
- Note (optional)
- Save → recalculate balance → Client Profile

### Client Ledger View
Client Profile → View Full Ledger →
- Chronological list: each row is an order or payment entry
- Each row shows: date, type (Order/Payment), details, balance after entry
- Pending balance → amber | Advance balance → green | Zero → muted
- Date range filter (from → to)
- Share button → generates formatted text summary for selected date range → opens wa.me pre-filled to client's phone (free, no API cost)
- Back → Client Profile

### Edit Client
Client Profile → Edit Client →
- Editable: name, phone, address, default_price_per_tanker
- Note displayed: "Changing price affects future orders only. Past orders are unchanged."
- Save → Client Profile

### Language Toggle
- Visible on every screen (header)
- Switches between English and Hindi instantly — no page reload
- Preference persisted in localStorage

## Error States
- Supabase fetch failure → inline error banner "Failed to load data. Retry." / "डेटा लोड नहीं हो सका। पुनः प्रयास करें।"
- Save failure → inline error on form "Could not save. Check connection and retry."
- Login failure → inline error on Login Page

## Empty States
- Clients List: no clients → "No clients yet. Add your first client." / "अभी कोई क्लाइंट नहीं। पहला क्लाइंट जोड़ें।"
- Client Ledger: no entries → "No orders or payments recorded yet."
- Dashboard recent orders: no orders → "No recent orders."
