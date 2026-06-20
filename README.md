# MultiTrack

A full-stack time-tracking application, built on a modern InstantDB + TypeScript monorepo boilerplate.

> This repository starts as a clean boilerplate: monorepo tooling, phone/email OTP auth, an admin panel shell, a customer-facing app shell, theming, i18n, and file uploads. Time-tracking features are built on top of this foundation.

## What's inside?

This Turborepo monorepo includes:

### Apps
- `market`: customer-facing app — Next.js (App Router), mobile-first, shadcn/ui, next-intl
- `admin`: admin panel — React + Vite, Ant Design, TanStack Query, Jotai
- `backend`: API — Hono on Cloudflare Workers (R2 storage, Queues, rate limiting)

### Packages
- `@repo/types`: shared TypeScript types, constants, Zod validators, and utils
- `@repo/eslint-config`: shared ESLint configurations
- `@repo/typescript-config`: shared `tsconfig.json` configurations

### Included infrastructure
- Phone & email OTP authentication (custom auth via InstantDB tokens)
- Real-time data with InstantDB (`instant.schema.ts` / `instant.perms.ts`)
- i18n (Georgian + English) — next-intl (market), react-i18next (admin)
- File uploads to Cloudflare R2 (presigned URLs, image/video handling)
- Cloudflare Queue scaffold for async event processing
- Dark mode + theming

## Getting started

```bash
# Install dependencies
bun install

# Run all apps in dev mode
bun run dev
```

Copy `.env.example` to `.env` and fill in the InstantDB app id/token and other secrets (see `ENV_SETUP.md`).

## Utilities

- [TypeScript](https://www.typescriptlang.org/) — static type checking
- [ESLint](https://eslint.org/) + [Biome](https://biomejs.dev/) (backend) — linting
- [Prettier](https://prettier.io) — formatting
- [Turborepo](https://turbo.build/) — monorepo task running
