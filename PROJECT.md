# MultiTrack - Project Context

> **A full-stack time-tracking application with real-time data, an admin panel, and bilingual support — built on an InstantDB monorepo boilerplate.**

## Overview

MultiTrack is a time-tracking app. This repository currently provides the clean boilerplate it is built on: a customer-facing app, an admin panel, and a Cloudflare Workers backend — all powered by InstantDB for real-time data and offline support, with phone/email OTP authentication, i18n, theming, and file uploads already wired up.

Domain features (projects, time entries, reports, etc.) are added on top of this foundation. The shared `instant.schema.ts` currently defines only the auth-related entities (`$users`, `otpCodes`, `$files`).

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | Turborepo |
| **Package Manager** | Bun |
| **Database** | InstantDB (real-time, offline-first) |
| **Market (Customer)** | Next.js + React + TypeScript |
| **Admin Panel** | React + Vite + TypeScript |
| **Admin UI Library** | Ant Design 5 |
| **Admin State** | Jotai (global), TanStack React Query (server) |
| **Backend** | Hono (Cloudflare Workers) |
| **Storage** | Cloudflare R2 (S3-compatible) |
| **Queue** | Cloudflare Queues (async event processing) |
| **Rate Limiting** | Cloudflare Workers Rate Limiting |
| **Email** | Resend |
| **SMS** | sender.ge |
| **i18n** | next-intl (market), react-i18next (admin) |
| **Styling** | Tailwind CSS |

## Project Structure

```
apps/
  market/    Customer-facing Next.js app (mobile-first)
  admin/     Admin panel (React + Vite + Ant Design)
  backend/   Hono API on Cloudflare Workers
packages/
  types/             Shared types, constants, Zod validators, utils
  eslint-config/     Shared ESLint config
  typescript-config/ Shared tsconfig
instant.schema.ts    InstantDB schema (auth entities)
instant.perms.ts     InstantDB permissions
```

## Documentation

- [AUTH.md](./AUTH.md) — authentication architecture, OTP flow, file map
- [THEMING.md](./THEMING.md) — theming, colors, styling patterns
- [ENV_SETUP.md](./ENV_SETUP.md) — environment variables
- [CLAUDE.md](./CLAUDE.md) — codebase conventions and InstantDB guidelines
