# Environment Variable Setup

## Architecture

| App                          | Runtime                   | Config Method                                  |
| ---------------------------- | ------------------------- | ---------------------------------------------- |
| **Backend** (`apps/backend`) | Cloudflare Workers (Hono) | `wrangler.jsonc` bindings + Cloudflare secrets |
| **Market** (`apps/market`)   | Next.js 15                | `.env` / `.env.local`                          |

---

## Backend (`apps/backend`)

The backend runs on **Cloudflare Workers**. Environment variables are managed via Cloudflare, not `.env` files.

### Secrets (set via Cloudflare dashboard or CLI)

```bash
# Set secrets using wrangler CLI (recommended)
cd apps/backend
npx wrangler secret put INSTANT_APP_ID
npx wrangler secret put INSTANT_APP_ADMIN_TOKEN
npx wrangler secret put SMS_API_KEY
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put CORS_ORIGIN
npx wrangler secret put R2_PUBLIC_URL
npx wrangler secret put R2_ACCOUNT_ID
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
npx wrangler secret put R2_BUCKET_NAME
```

### Bindings (configured in `wrangler.jsonc`)

These are Cloudflare-managed resources, not user-set secrets:

| Binding            | Type             | Description                                     |
| ------------------ | ---------------- | ----------------------------------------------- |
| `R2_BUCKET`        | R2 Bucket        | Image storage (bucket: `printa`)                |
| `OTP_RATE_LIMITER` | Rate Limit       | OTP endpoints (5 req / 60s)                     |
| `EVENTS_QUEUE`     | Queue (producer) | Async event processing (queue: `printa-events`) |

### Local Development

For local dev with `wrangler dev`, create a `.dev.vars` file in `apps/backend/`:

```env
INSTANT_APP_ID=your-app-id
INSTANT_APP_ADMIN_TOKEN=your-admin-token
SMS_API_KEY=your-sms-api-key
RESEND_API_KEY=your-resend-api-key
CORS_ORIGIN=http://localhost:3000
R2_PUBLIC_URL=https://cdn.printa.ge
R2_ACCOUNT_ID=your-cf-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=printa
```

### Deploy

```bash
cd apps/backend
npx wrangler deploy
```

---

## Market (`apps/market`)

Next.js app — uses standard `.env` / `.env.local` files.

### Required Variables

```env
# InstantDB
INSTANT_APP_ID=your-app-id
INSTANT_APP_ADMIN_TOKEN=your-admin-token

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080   # or production URL

# Public (exposed to browser)
NEXT_PUBLIC_INSTANT_APP_ID=your-app-id
```

### Notes

- `NEXT_PUBLIC_` prefixed variables are exposed to the browser — never use this prefix for secrets
- `INSTANT_APP_ADMIN_TOKEN` is server-only (used in server components / `data/server/queries.ts`)
- Create `.env.local` for local overrides (gitignored)

---

## Development Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Set up backend local vars
cp apps/backend/.dev.vars.example apps/backend/.dev.vars
# Edit .dev.vars with your values

# 3. Set up market env
cp apps/market/.env.example apps/market/.env.local
# Edit .env.local with your values

# 4. Run all apps
bun run dev
# Backend: http://localhost:8080
# Market:  http://localhost:3000

# 5. Push schema (if needed)
bun run db:push:schema
```

---

## InstantDB Management

```bash
# Push schema changes
bun run db:push:schema

# Push permission changes
bun run db:push:perms

# Pull current schema from InstantDB
bun run db:pull
```

These commands use `INSTANT_APP_ID` and `INSTANT_APP_ADMIN_TOKEN` from the root environment or inline.
