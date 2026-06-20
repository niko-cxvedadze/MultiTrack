# MultiTrack Market

> See also: [Root CLAUDE.md](../../CLAUDE.md) for InstantDB patterns, shared constants, routing, and monorepo conventions.

> Customer-facing app for MultiTrack (a time-tracking product), built with Next.js and InstantDB.

## Project Overview

This is the mobile-first, customer-facing app. It currently ships as a clean boilerplate: authentication, a landing page, an authenticated profile area (overview, settings, notifications), theming, and i18n. Domain features are built on top. The app prioritizes an excellent mobile experience while remaining fully functional on desktop.

## Tech Stack

| Layer               | Technology                                  |
| ------------------- | ------------------------------------------- |
| **Framework**       | Next.js 16 (App Router)                     |
| **Language**        | TypeScript                                  |
| **Database**        | InstantDB (real-time, offline-first)        |
| **Styling**         | Tailwind CSS v4                             |
| **UI Components**   | shadcn/ui (Radix Lyra style) + Lucide icons |
| **Package Manager** | Bun (monorepo via Turborepo)                |

## Core Features (boilerplate)

- **Landing page** - mobile-first hero / entry point
- **Auth** - phone & email OTP authentication via InstantDB tokens
- **Profile area** - authenticated account overview, settings, notification preferences
- **Theming** - light/dark mode, Radix Lyra (sharp-corner) shadcn/ui design system
- **i18n** - Georgian + English via next-intl, locale-prefixed routes

## Project Structure

```
apps/market/
├── app/
│   └── [locale]/           # Locale-prefixed App Router pages
│       ├── layout.tsx      # Locale layout (providers, header, footer)
│       ├── page.tsx        # Landing page
│       ├── profile/        # Authenticated account area (overview, settings, notifications)
│       ├── terms/          # Static legal pages
│       └── privacy/
├── components/
│   ├── ui/                 # shadcn/ui primitives (generated — do not edit)
│   ├── layout/             # Header, footer, theme, language switcher
│   ├── auth/               # Login / OTP / register forms
│   ├── profile/            # Profile sidebar, settings rows
│   └── shared/             # Generic shared components
├── data/
│   ├── client/             # InstantDB client + React Query queries/mutations
│   └── server/             # Server-side InstantDB admin helpers
├── i18n/                   # next-intl routing & request config
├── messages/               # Translation JSON (en, ka)
└── lib/                    # Utilities and configuration
```

## Mobile-First Design Principles

- **Touch-friendly targets**: Minimum 44x44px tap targets on all interactive elements
- **Bottom navigation**: Primary navigation at the bottom of the screen for thumb reach
- **Responsive breakpoints**: Design for mobile first (`sm:`, `md:`, `lg:`) - never desktop-down
- **Swipe gestures**: Support swipe interactions where natural (image galleries, dismiss)
- **Sticky CTAs**: Keep primary actions (Add to Cart, Checkout) visible with sticky positioning
- **Minimal input**: Reduce typing on mobile - use selectors, toggles, and saved data
- **Performance**: Optimize images, lazy-load below-fold content, minimize JS bundle

## Next.js Server-Side Guidelines

### Use Server Components by default

All components in the `app/` directory are Server Components by default. Only add `'use client'` when the component needs:

- Browser APIs (window, document)
- React hooks (useState, useEffect, etc.)
- Event handlers (onClick, onChange, etc.)
- InstantDB client-side hooks (`db.useQuery`, `db.useAuth`)

### Data fetching patterns

```tsx
// Server Component - use InstantDB admin SDK for initial data
// app/products/page.tsx
import { adminDb } from '@/lib/adminDb'
import { db } from '@/lib/db'

export default async function ProductsPage() {
  const { products } = await adminDb.query({ products: {} })
  return <ProductList initialProducts={products} />
}

// Client Component - use InstantDB client for real-time updates
// components/product/ProductList.tsx
;('use client')

export function ProductList({ initialProducts }) {
  const { data } = db.useQuery({ products: {} })
  // Real-time updates with InstantDB client
}
```

### Route Handlers for server logic

Use Next.js Route Handlers (`app/api/`) for operations that must run server-side:

- Processing payments
- Validating orders
- Admin operations
- Sending notifications

```tsx
// app/api/orders/route.ts
import { adminDb } from '@/lib/adminDb'

export async function POST(request: Request) {
  // Validate, process, and create order server-side
}
```

### Server Actions for mutations

Use Server Actions for form submissions and mutations that benefit from progressive enhancement:

```tsx
// app/actions/cart.ts
'use server'

export async function addToCart(productId: string, quantity: number) {
  // Server-side cart mutation
}
```

## InstantDB Usage

### Client-side (React components)

```tsx
import { init } from '@instantdb/react'

import schema from '@/instant.schema'

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  schema
})
```

### Server-side (Route Handlers, Server Components, Server Actions)

```tsx
import { init } from '@instantdb/admin'

import schema from '@/instant.schema'

const adminDb = init({
  appId: process.env.INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_APP_ADMIN_TOKEN!,
  schema
})
```

### Current entities

- `$users` - InstantDB built-in users (email, phoneNumber, fullName, newsletterSubscribed)
- `otpCodes` - one-time passcodes for phone/email auth
- `$files` - InstantDB built-in file storage

Add your own domain entities (projects, time entries, etc.) to `instant.schema.ts` at the repo root.

## Environment Variables

| Variable                     | Context | Description                           |
| ---------------------------- | ------- | ------------------------------------- |
| `NEXT_PUBLIC_INSTANT_APP_ID` | Client  | InstantDB app ID (exposed to browser) |
| `INSTANT_APP_ID`             | Server  | InstantDB app ID (server-side)        |
| `INSTANT_APP_ADMIN_TOKEN`    | Server  | InstantDB admin token (sensitive)     |

## CRITICAL Rules

### Never use `db` directly in pages or components — use `data/client/`

CRITICAL: Page components and UI components must NEVER import `db` directly from `@/data/client/db` to run queries or mutations. All InstantDB interactions must go through the centralized API layer:

- **Queries** → `data/client/queries/` (custom hooks like `useUserProfile`)
- **Mutations** → `data/client/mutations/` (plain functions like `updateFullName`, `updateNewsletter`)

```tsx
// ✅ Correct: Import from data/client layers
import { useUserProfile } from '@/data/client/queries'
import { updateFullName } from '@/data/client/mutations'

// ❌ Wrong: Direct db usage in pages/components
import { db } from '@/data/client/db'
const { data } = db.useQuery({ $users: { ... } })
await db.transact(db.tx.$users[id].update({ ... }))
```

**Exception:** `db.useAuth()` may be used directly in layout/auth components that only need the auth state.

When adding new features:

1. Create a query hook in `data/client/queries/` (e.g., `use-user-profile.ts`)
2. Create mutation functions in `data/client/mutations/` (e.g., `profile.ts`)
3. Export from the respective `index.ts` barrel files
4. Pages/components import only from `@/data/client/queries` and `@/data/client/mutations`

### Use React Query `useMutation` for API calls — never call async functions directly

All API calls to the backend (POST, PUT, DELETE) must go through React Query's `useMutation` hook. Never call raw async API functions directly from components or event handlers. This ensures consistent loading/error state management and enables caching, retries, and invalidation.

```tsx
// ✅ Correct: useMutation hook in data/client/mutations/
export function useValidateCoupon() {
  return useMutation({
    mutationFn: async (params: { code: string; cartTotal: number }) => {
      const response = await api.post('/coupons/validate', params)
      return response.data.responseObject
    },
  })
}

// ✅ Correct: Use the hook in a component
const { mutate, isPending, error } = useValidateCoupon()
mutate({ code, cartTotal }, { onSuccess: (result) => { ... } })

// ❌ Wrong: Raw async function called directly
export async function validateCoupon(code: string, cartTotal: number) { ... }
const result = await validateCoupon(code, cartTotal)
```

**Exception:** Fire-and-forget mutations like `createOrder` that are already wrapped in try/catch with explicit loading state (e.g., modal `placing` state) may remain as plain async functions.

### Square / sharp-corner design (radix-lyra theme)

This project uses the `radix-lyra` shadcn style which has **square, sharp-cornered components** (`rounded-none`). All custom components must follow this convention:

- **NEVER** use `rounded-full`, `rounded-lg`, `rounded-md`, `rounded-xl`, etc. on custom components
- Inputs, buttons, badges, cards, and all UI elements should have sharp corners
- The only exception is if a specific design explicitly requires rounding (e.g., avatar circles) — but default to square

```tsx
// CORRECT — sharp corners matching radix-lyra
className = 'border bg-background px-4 py-2'
className = 'bg-primary text-primary-foreground px-3 py-1'

// WRONG — rounded corners break the design system
className = 'rounded-full bg-background px-4 py-2'
className = 'rounded-lg bg-primary text-primary-foreground px-3 py-1'
```

### Always use shadcn/ui components — avoid reinventing primitives

CRITICAL: Before building ANY UI element, you MUST follow this checklist:

1. **Check locally** — look in `components/ui/` to see if the shadcn component is already installed
2. **Check shadcn website** — browse https://ui.shadcn.com/docs/components to see if the component exists in the shadcn registry (use WebFetch to check)
3. **Install if available** — if the component exists on shadcn but isn't installed locally, run: `npx shadcn@latest add <component> -y`
4. **Only then build custom** — if no shadcn component exists for the pattern, create a custom component outside `components/ui/`

shadcn/ui provides well-built, themed components. Always use them instead of hand-styling raw HTML elements:

- **Buttons/Links**: Use `<Button>` with `asChild` + `<Link>` instead of custom styled `<a>` or `<Link>` elements
- **Inputs**: Use `<Input>` instead of raw `<input>` with custom classes
- **Badges**: Use `<Badge>` instead of hand-styled `<span>` elements
- **Cards, Dialogs, Sheets, etc.**: Always check if shadcn has a component before building custom

```tsx
// CORRECT — use shadcn components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

<Button variant="ghost" size="lg" asChild>
  <Link href="/cart"><ShoppingCart /> Cart</Link>
</Button>
<Input placeholder="Search..." className="h-10" />
<Badge variant="destructive">{count}</Badge>

// WRONG — hand-styled primitives duplicating what shadcn provides
<Link className="group flex items-center gap-2 text-sm font-medium transition-colors hover:...">
<input className="h-11 w-full border-none bg-background pl-11 pr-4 text-sm..." />
<span className="flex size-4 items-center justify-center bg-destructive text-xs...">
```

Never skip the check — many components exist in shadcn that you might not expect (Carousel, Drawer, Collapsible, Toggle, ToggleGroup, Accordion, Breadcrumb, Pagination, etc.). When in doubt, check the website first.

### Use Skeleton component for loading states — never raw animate-pulse

Always use the `<Skeleton />` component from `@/components/ui/skeleton` for loading/placeholder states. Never use raw `animate-pulse` divs or custom shimmer elements.

```tsx
// CORRECT — use Skeleton component
import { Skeleton } from '@/components/ui/skeleton'

<Skeleton className="h-8 w-48" />
<Skeleton className="h-4 w-full" />

// WRONG — raw animate-pulse divs
<div className="h-64 animate-pulse bg-muted/30" />
```

Build skeleton layouts that mirror the shape of the actual content (matching widths, heights, and layout structure) so the transition from loading to loaded feels seamless.

### NEVER modify generated UI components

The `components/ui/` directory contains **only** auto-generated shadcn/ui components. These are installed via `npx shadcn@latest add <component>`.

- **NEVER** edit files in `components/ui/` directly
- **NEVER** place custom components in `components/ui/`
- If you need to customize a shadcn component, wrap it in a new component outside `components/ui/` (e.g., `components/layout/`, `components/product/`, etc.)
- To add a new shadcn primitive, run: `npx shadcn@latest add <component> -y`

### Use ONLY theme colors — never hardcode colors

All colors are defined as CSS variables in `app/globals.css`. When implementing UI from a screenshot or design reference, extract the **layout and patterns** from the reference but always use our existing theme tokens:

```tsx
// CORRECT — use theme tokens
className = 'bg-primary text-primary-foreground'
className = 'bg-secondary text-secondary-foreground'
className = 'bg-muted text-muted-foreground'
className = 'bg-background text-foreground'
className = 'bg-destructive text-destructive'
className = 'border-border'
className = 'bg-accent text-accent-foreground'
className = 'bg-card text-card-foreground'

// WRONG — never hardcode colors
className = 'bg-[#c5d9a0]'
className = 'bg-[hsl(90,40%,78%)]'
className = 'text-[#333]'
className = 'bg-green-200'
```

Available theme tokens (defined in `globals.css`):

- `background` / `foreground` — page background and text
- `primary` / `primary-foreground` — primary brand (purple #822ef5)
- `secondary` / `secondary-foreground` — secondary surfaces
- `muted` / `muted-foreground` — subdued backgrounds and text
- `accent` / `accent-foreground` — accent surfaces
- `card` / `card-foreground` — card surfaces
- `destructive` — error/danger states
- `border` / `input` / `ring` — borders and focus rings

Do NOT add custom CSS variables to `globals.css` unless there is genuinely no existing token that works. The existing palette is sufficient — use opacity modifiers (`bg-primary/20`, `text-foreground/70`) to create lighter/darker variants.

### Screenshot-to-code workflow

When implementing from a screenshot/design reference:

1. Identify the **layout structure** (flexbox, grid, spacing, alignment)
2. Identify the **UI patterns** (search bars, cards, badges, buttons)
3. Map the reference colors to our **existing theme tokens** — use the closest match with opacity modifiers if needed
4. Never copy colors literally — always translate to our design system
5. Never use arbitrary Tailwind color values (`bg-[#xxx]`, `text-[hsl(...)]`, `bg-green-200`)

## Theming Reference

This section is the single source of truth for how theming works in Printa Market. All components must follow these patterns exactly to maintain brand consistency.

### Design System: Radix Lyra

The app uses the **radix-lyra** shadcn/ui preset. The defining visual trait is **sharp corners** (`rounded-none`) on every element — buttons, badges, inputs, cards, images, modals, and all custom components.

### Color Tokens

All colors are CSS custom properties defined in `app/globals.css` using the OKLCH color space. They are mapped to Tailwind via `@theme inline`. **Never hardcode hex, HSL, or Tailwind palette colors.**

#### Core Palette

| Token                  | Light Mode                                        | Usage                                            |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------ |
| `background`           | `oklch(1 0 0)` white                              | Page background                                  |
| `foreground`           | `oklch(0.145 0 0)` near-black                     | Primary text                                     |
| `primary`              | `oklch(0.544 0.265 294.709)` **purple (#822ef5)** | Brand color — header, CTAs, links, active states |
| `primary-foreground`   | `oklch(0.97 0.02 294.709)` near-white             | Text on primary backgrounds                      |
| `secondary`            | `oklch(0.967 0.001 286.375)` light gray           | Secondary surfaces, header action buttons        |
| `secondary-foreground` | `oklch(0.21 0.006 285.885)` dark gray             | Text on secondary surfaces                       |
| `muted`                | `oklch(0.97 0 0)` off-white                       | Subtle backgrounds, placeholder areas            |
| `muted-foreground`     | `oklch(0.556 0 0)` medium gray                    | Secondary text, "see all" links, placeholders    |
| `accent`               | `oklch(0.97 0 0)` off-white                       | Hover/selected backgrounds                       |
| `accent-foreground`    | `oklch(0.205 0 0)` dark gray                      | Text on accent backgrounds                       |
| `destructive`          | `oklch(0.58 0.22 27)` **red**                     | Errors, discount badges, delete actions          |
| `card`                 | `oklch(1 0 0)` white                              | Card/elevated surfaces                           |
| `card-foreground`      | `oklch(0.145 0 0)` near-black                     | Text on cards                                    |
| `border`               | `oklch(0.922 0 0)` light gray                     | All borders, dividers                            |
| `input`                | `oklch(0.922 0 0)` light gray                     | Form input borders                               |
| `ring`                 | `oklch(0.708 0 0)` medium gray                    | Focus rings                                      |

#### Opacity Modifiers (instead of new tokens)

Use Tailwind opacity modifiers to create variants from existing tokens:

```tsx
bg - muted / 20 // Very subtle background (product image area)
bg - muted / 50 // Lighter muted (gradient placeholder)
bg - background / 90 // Semi-transparent white (hover button bg)
bg - background / 95 // Nearly opaque white (scroll arrows)
text - foreground / 75 // Slightly dimmed text (product names)
text - foreground / 15 // Very faint (placeholder icons inside image area)
text - background / 70 // Dimmed text on dark bg (announcement bar)
text - background / 40 // Very dimmed on dark bg (inactive language switcher)
bg - foreground / 5 // Barely visible dark overlay (backdrop, mobile)
bg - foreground / 10 // Subtle dark overlay (backdrop, desktop)
border - foreground / 15 // Slight border darkening on hover
```

### Typography

| Element         | Classes                                                                             | Example                                                           |
| --------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Logo            | `text-xl font-black tracking-tight text-primary-foreground sm:text-2xl md:text-3xl` | "PRINTA"                                                          |
| Section title   | `text-lg font-bold tracking-tight sm:text-xl lg:text-2xl`                           | "Featured Deals -20%"                                             |
| Product price   | `text-sm font-bold text-foreground sm:text-base`                                    | "223.00 ₾"                                                        |
| Original price  | `text-xs text-muted-foreground line-through`                                        | "279.00 ₾"                                                        |
| Product name    | `text-xs leading-relaxed text-foreground/75`                                        | Truncated with `line-clamp-3` (mobile) / `line-clamp-2` (desktop) |
| Category button | `text-xs font-medium` (via Button size="lg")                                        | "Home & Living"                                                   |
| Announcement    | `text-xs text-background/70 sm:text-sm`                                             | "Free shipping over 50 GEL"                                       |
| "See all" link  | `text-sm font-medium text-muted-foreground hover:text-foreground`                   | "See all →"                                                       |
| Body font       | `font-sans` → JetBrains Mono Variable (set in `@theme inline`)                      | All text                                                          |

### Spacing & Layout

| Pattern                        | Value                        |
| ------------------------------ | ---------------------------- |
| Container max-width            | `max-w-7xl` (1280px)         |
| Container padding              | `px-4 sm:px-6`               |
| Section vertical padding       | `py-5 sm:py-7`               |
| Gap between header and content | Section title `mb-4 sm:mb-5` |
| Product card gap               | `gap-3 sm:gap-4`             |
| Category button gap            | `gap-2 sm:gap-2.5`           |

### Product Card Anatomy

```
┌──────────────────────┐
│  [image area]        │  aspect-square, border-border, bg-muted/20
│                      │  Hover: border-foreground/15, image scale-105
│  [-20%]    [♡][🛒]  │  Badge: bg-destructive (bottom-left)
│                      │  Actions: top-right, desktop hover only
├──────────────────────┤
│  223.00 ₾  279.00 ₾ │  Bold price + strikethrough original
│  Product name that   │  line-clamp-3 mobile, line-clamp-2 desktop
│  wraps to 2-3 lines  │  flex-1 (absorbs height variance)
│  [♡] [🛒 Add to cart]│  Mobile only (sm:hidden), pinned to bottom
└──────────────────────┘
```

**Equal-height cards on mobile:** The card uses `flex flex-col` and the info section uses `flex flex-1 flex-col`. The product name gets `flex-1` to absorb variable text length, keeping the add-to-cart row aligned across cards in the same scroll row.

**Responsive widths:** `w-[170px] sm:w-[210px] lg:w-[230px]`

### Component Color Mapping

#### Header

| Part               | Colors                                        |
| ------------------ | --------------------------------------------- |
| Announcement bar   | `bg-foreground` + `text-background/70`        |
| Main header        | `bg-primary`                                  |
| Logo               | `text-primary-foreground`                     |
| Cart/Login buttons | `variant="secondary"` on primary bg           |
| Active language    | `text-background`                             |
| Inactive language  | `text-background/40 hover:text-background/70` |

#### Category Bar

| Part                 | Colors                                                              |
| -------------------- | ------------------------------------------------------------------- |
| Container            | `bg-background` + `border-b border-border`                          |
| "All Categories" btn | `bg-foreground text-background hover:bg-foreground/85`              |
| Category buttons     | `variant="outline"`                                                 |
| Scroll fades         | `bg-gradient-to-r from-background via-background/60 to-transparent` |
| Expanded overlay     | `bg-foreground/5 sm:bg-foreground/10`                               |
| Expanded panel       | `bg-background border-border shadow-lg`                             |

#### Product Section

| Part              | Colors                                                              |
| ----------------- | ------------------------------------------------------------------- |
| Title             | `text-foreground` (inherited)                                       |
| "See all"         | `text-muted-foreground hover:text-foreground`                       |
| Scroll arrows     | `variant="outline"` + `bg-background/95 shadow-md backdrop-blur-sm` |
| Scroll fades      | `bg-gradient-to-r from-background to-transparent`                   |
| Section separator | `<Separator />` (bg-border)                                         |

#### Product Card

| Part                | Colors                                                           |
| ------------------- | ---------------------------------------------------------------- |
| Image bg            | `bg-muted/20`, placeholder gradient: `from-muted/20 to-muted/50` |
| Image border        | `border-border`, hover: `border-foreground/15`                   |
| Discount badge      | `bg-destructive text-white`                                      |
| Hover actions       | `bg-background/90 backdrop-blur-sm shadow-sm`                    |
| Wishlist hover      | `hover:text-destructive`                                         |
| Cart hover          | `hover:text-primary`                                             |
| Price               | `text-foreground font-bold`                                      |
| Original price      | `text-muted-foreground line-through`                             |
| Product name        | `text-foreground/75`                                             |
| Mobile wishlist btn | `text-muted-foreground hover:text-destructive`                   |
| Mobile add-to-cart  | `variant="outline"`                                              |

### Scroll Navigation Pattern

Used by both CategoryBar and ProductSection:

1. Detect overflow via `scrollWidth > clientWidth`
2. Show/hide left and right arrow buttons with gradient fades
3. Gradient: `w-12 bg-gradient-to-r from-background to-transparent`
4. Arrow button: `variant="outline" bg-background/95 shadow-md backdrop-blur-sm`
5. Scroll amount: 75% of visible width, `behavior: 'smooth'`
6. Hide native scrollbar: `.scrollbar-none` utility class

### Anti-Patterns (DO NOT)

```tsx
// ❌ NEVER hardcode colors
className = 'bg-[#4CAF50]'
className = 'bg-green-500'
className = 'text-gray-600'
className = 'border-gray-200'

// ❌ NEVER use rounded corners
className = 'rounded-lg'
className = 'rounded-full'
className = 'rounded-xl'

// ❌ NEVER use text-white directly
className = 'text-white' // use text-background or text-primary-foreground

// ❌ NEVER use Tailwind gray/slate palette
className = 'bg-gray-100'
className = 'text-slate-500'

// ✅ ALWAYS use semantic tokens
className = 'bg-muted'
className = 'text-muted-foreground'
className = 'border-border'
className = 'bg-primary text-primary-foreground'
```

### Adding New Components Checklist

When creating a new component, verify:

1. All colors use theme tokens (no hardcoded values)
2. No rounded corners (`rounded-none` is the default via shadcn)
3. Uses shadcn/ui primitives where possible (Button, Badge, Input, etc.)
4. Mobile-first responsive classes (`sm:`, `md:`, `lg:`)
5. Touch targets are at minimum 28px (icon-sm) on mobile
6. Hover effects use `group` + `group-hover:` pattern
7. Transitions use `transition-colors`, `transition-all`, or `transition-transform`
8. Text truncation uses `line-clamp-*` for multi-line or `truncate` for single-line

### Use `header-*` tokens on `bg-primary` header surfaces

CRITICAL: When `bg-primary` is used as a container background (e.g., the main header bar), all child element colors must use the **`header-*` CSS tokens** defined in `globals.css` — never use theme tokens like `text-foreground`, `bg-background`, `bg-secondary`, or `variant="secondary"` because those flip in dark mode while `bg-primary` stays the same.

Available header tokens (identical in light and dark mode):

- `bg-header-bg` / `text-header-fg` — white background, dark text (for search input, buttons)
- `text-header-fg-muted` — muted text (for placeholders)
- `bg-header-btn-bg` / `hover:bg-header-btn-bg-hover` — button backgrounds
- `bg-header-topbar-bg` / `text-header-topbar-fg` — always-black announcement bar

```tsx
// CORRECT — use header tokens
className = 'bg-header-btn-bg text-header-fg hover:bg-header-btn-bg-hover'
className = 'text-header-topbar-fg/70'

// WRONG — theme tokens flip in dark mode
className = 'bg-secondary text-secondary-foreground'
className = 'text-background/70'
```

For **image overlays** (banners), use hardcoded oklch values since they're always on top of images: `text-[oklch(1_0_0)]` for white text, `bg-[oklch(0_0_0/0.2)]` for dark overlay.

### Update `lastUpdated` date when modifying Terms or Privacy Policy

CRITICAL: Whenever you modify the content of the **Terms & Conditions** (`terms` key) or **Privacy Policy** (`privacy` key) in the translation files (`messages/en.json`, `messages/ka.json`, `messages/ru.json`), you MUST update the `lastUpdated` field in ALL three locale files to today's date.

The date format per locale:

- **en.json**: `"Last updated: March 7, 2026"` (Month Day, Year)
- **ka.json**: `"ბოლო განახლება: 7 მარტი, 2026"` (Day Month, Year)
- **ru.json**: `"Последнее обновление: 7 марта 2026"` (Day Month Year)

Both `terms.lastUpdated` and `privacy.lastUpdated` must be updated independently — only update the one whose content was actually changed.

### Use postfix `!` for important — never prefix `!`

Tailwind v4 uses the postfix `!` syntax for important modifiers. Never use the legacy `!` prefix.

```tsx
// CORRECT — postfix !
className = 'text-header-fg! bg-header-bg!'
className = 'placeholder:text-muted!'

// WRONG — legacy prefix !
className = '!text-header-fg !bg-header-bg'
className = 'placeholder:!text-muted'
```

## Keep server queries in `api/server/` — not in components

All server-side data queries using `adminDb` must live in `api/server/queries.ts` and be exported from `api/server/index.ts`. Server components should import and call these query functions — never inline `adminDb.query()` calls directly in components.

```tsx
// Correct: Query function in api/server/queries.ts
export async function getHomeSections(locale: SupportedLocale) {
  const { sections } = await adminDb.query({ sections: { ... } })
  return sections
}

// Correct: Server component imports from api/server
import { getHomeSections } from '@/api/server'
export async function HomeSections({ locale }: Props) {
  const sections = await getHomeSections(locale)
  return <>{sections.map(...)}</>
}

// Wrong: Inline adminDb.query() in a component
import { adminDb } from '@/api/server/db'
export async function HomeSections() {
  const { sections } = await adminDb.query({ ... }) // move this to queries.ts
}
```

## Add `generateMetadata` to every server-side page — SEO is mandatory

Every Next.js server page (`page.tsx`) **must** export a `generateMetadata` function for SEO and social sharing. Never ship a page without metadata.

Pattern: fetch entity via `api/server/queries.ts`, use `getTranslatedField` for title (`metaTitle` -> `name`) and description (`metaDescription` -> `shortDescription`), include OpenGraph with images, return `{}` if not found. Every page under `app/[locale]/` must have it. Always localize — never hardcode English strings.

## Conventions

- Use `@/` path alias for imports (maps to project root)
- shadcn/ui components go in `components/ui/` (generated only, never modified)
- Custom components go in `components/layout/`, `components/product/`, etc.
- Follow the root [`CLAUDE.md`](../../CLAUDE.md) for InstantDB patterns, constants, and routing
- All new schema fields that need filtering/ordering must be indexed
- Use `id()` from InstantDB for generating entity IDs
- Keep components small and composable
- Prefer Server Components; only use `'use client'` when necessary
