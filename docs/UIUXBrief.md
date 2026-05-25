# UI/UX Brief — The Indian Water Tanker

## Color Tokens
```css
--color-primary:       #2563EB;
--color-primary-hover: #1D4ED8;
--color-secondary:     #0EA5E9;
--color-bg:            #F8FAFC;
--color-surface:       #FFFFFF;
--color-border:        #E2E8F0;
--color-text:          #0F172A;
--color-text-muted:    #64748B;
--color-error:         #DC2626;
--color-success:       #16A34A;
--color-warning:       #D97706;
--color-pending:       #F59E0B;
--color-advance:       #10B981;
```

## Typography
```css
--font-family:          'Inter', system-ui, sans-serif;
--font-size-xs:         0.75rem;
--font-size-sm:         0.875rem;
--font-size-md:         1rem;
--font-size-lg:         1.125rem;
--font-size-xl:         1.25rem;
--font-size-2xl:        1.5rem;
--font-size-3xl:        1.875rem;
--font-weight-regular:  400;
--font-weight-medium:   500;
--font-weight-semibold: 600;
--font-weight-bold:     700;
```

## Spacing
```css
--spacing-xs:  0.25rem;
--spacing-sm:  0.5rem;
--spacing-md:  1rem;
--spacing-lg:  1.5rem;
--spacing-xl:  2rem;
--spacing-2xl: 3rem;
```

## Component Rules
- Border radius: `8px` (cards, inputs) / `6px` (buttons) / `12px` (modals)
- Button: Filled primary for primary actions, outlined for secondary, ghost for tertiary
- Input: Bordered, subtle background `#F8FAFC`, focus ring `--color-primary`
- Shadow: `0 1px 3px rgba(0,0,0,0.08)` for cards / `0 4px 12px rgba(0,0,0,0.10)` for modals
- Animation: Subtle — Framer Motion `duration: 0.2s ease` for modals, list entries, page transitions

## Balance Display Rules
- Pending amount → `--color-pending` (amber)
- Advance amount → `--color-advance` (green)
- Zero balance → `--color-text-muted`

## Language Toggle
- Toggle switch in header on every screen
- EN / HI label on either side of toggle
- Switches font rendering context — Inter supports Devanagari script natively

## Breakpoints
- Mobile:  < 768px
- Tablet:  768px–1024px
- Desktop: > 1024px

## Mobile-First Notes
- All tap targets minimum `44px` height
- Bottom-anchored primary action buttons on mobile (Add Order, Add Payment)
- Client list rows large enough to tap without zoom
- Ledger rows scannable at a glance — date left, balance right, bold
