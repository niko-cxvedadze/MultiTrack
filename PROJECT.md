# MultiTrack - Project Context

> **A full-stack, real-time SaaS application with bilingual support — built on an InstantDB monorepo boilerplate.**

## Overview

MultiTrack is a SaaS app. This repository currently provides the clean boilerplate it is built on: a customer-facing app and a Cloudflare Workers backend — all powered by InstantDB for real-time data and offline support, with phone/email OTP authentication, i18n, theming, and file uploads already wired up.

Domain features (projects, time entries, reports, etc.) are added on top of this foundation. The shared `instant.schema.ts` currently defines only the auth-related entities (`$users`, `otpCodes`, `$files`).

## Tech Stack

| Layer                 | Technology                                 |
| --------------------- | ------------------------------------------ |
| **Monorepo**          | Turborepo                                  |
| **Package Manager**   | Bun                                        |
| **Database**          | InstantDB (real-time, offline-first)       |
| **App (Customer)**    | Next.js + React + TypeScript               |
| **Backend**           | Hono (Cloudflare Workers)                  |
| **Storage**           | Cloudflare R2 (S3-compatible)              |
| **Queue**             | Cloudflare Queues (async event processing) |
| **Rate Limiting**     | Cloudflare Workers Rate Limiting           |
| **Email**             | Resend                                     |
| **SMS**               | sender.ge                                  |
| **i18n**              | next-intl (app)                            |
| **Styling**           | Tailwind CSS                               |

## Project Structure

```
apps/
  app/       Customer-facing Next.js app (mobile-first)
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
