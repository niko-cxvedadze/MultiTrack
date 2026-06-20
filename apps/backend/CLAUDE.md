# MultiTrack Backend

> See also: [Root CLAUDE.md](../../CLAUDE.md) for InstantDB patterns, shared constants, routing, and monorepo conventions.

> Hono API on Cloudflare Workers with InstantDB admin SDK, Zod validation, and an event queue scaffold.

## Tech Stack

| Layer                | Technology                              |
| -------------------- | --------------------------------------- |
| **Framework**        | Hono                                    |
| **Runtime**          | Cloudflare Workers                      |
| **Language**         | TypeScript                              |
| **Database**         | InstantDB (admin SDK)                   |
| **Formatter/Linter** | Biome (semicolons, double quotes, tabs) |
| **Async**            | `p-map` for concurrent operations       |

## Architecture

The app is organized into layers, wired together in `src/deps.ts`:

- `src/routes/` — Hono route handlers, registered in `src/index.ts`
- `src/api/` & `src/stores/` — services (business logic) and stores (InstantDB access)
- `src/common/` — middleware, services (email/SMS/OTP/upload), models, lib, utils
- `src/queue/` — Cloudflare Queue consumer (`handler.ts`)

The current boilerplate exposes auth (`/auth`) and an authenticated user route (`/me`). An `UploadService` (R2 presigned URLs) is wired in `deps.ts` and ready to expose via a route when needed.

## Use `p-map` instead of sequential `for...of` + `await` loops

Never use `for (const item of items) { await ... }` for independent async operations. Use `p-map` for concurrent execution.

```tsx
import pMap from 'p-map'

// Correct: Concurrent execution with p-map
await pMap(items, (item) => doAsyncWork(item))

// With concurrency limit if needed
await pMap(items, (item) => doAsyncWork(item), { concurrency: 5 })

// Wrong: Sequential execution blocks on each iteration
for (const item of items) {
  await doAsyncWork(item)
}
```

## Always validate route params and request bodies with Zod

Every backend route that accepts params (`:id`) or a JSON body MUST validate them with Zod schemas from `packages/types/src/validators/`. Never trust raw `c.req.param()` or `c.req.json()` — always `safeParse` before use.

```tsx
// Correct: Validate body against a shared validator
const bodyResult = SomeInputValidator.shape.body.safeParse(await c.req.json())
if (!bodyResult.success) {
  return c.json({ success: false, message: bodyResult.error.issues[0]?.message, statusCode: 400 }, 400)
}

// Wrong: Unvalidated cast
const body = await c.req.json<{ field: string }>()
```

For ID params, use `z.string().uuid()`. For enum fields, use `z.nativeEnum(MyEnum)`. Define new schemas in `packages/types/src/validators/` — never inline.

## Rate limit all authentication endpoints

All auth endpoints (e.g. OTP send) must have rate limiting middleware. Use Cloudflare Workers rate limit bindings configured in `wrangler.jsonc`. The `simple.period` only supports values of `10` or `60` seconds.

- OTP endpoints: `rateLimitOtp` middleware, keyed on phone/email

## Event system — `EventType` enum, `dispatchEvent`, and the queue handler

Async side-effects run through a Cloudflare Queue. Events use the `EventType` enum from `@repo/types` (never string literals). Payloads must be minimal — only IDs and primitive values; consumers fetch full data from the DB when needed.

### Dispatching events

Use `dispatchEvent()` from `@/common/utils/dispatchEvent` to send events to the queue. It wraps `queue.send()` in try/catch so dispatch failures never break the main request flow.

```tsx
import { EventType } from '@repo/types'

import { dispatchEvent } from '@/common/utils/dispatchEvent'

// Correct: enum + minimal payload
await dispatchEvent(queue, { type: EventType.Example, message })

// Wrong: string literal
await queue.send({ type: 'example', message })
```

### Queue handler

The queue handler (`src/queue/handler.ts`) is a simple router that switches on `event.type`. It currently handles the placeholder `EventType.Example`. As you add domain events, extend the switch (or fan out to per-channel notifiers, e.g. email/SMS, via `Promise.all`).

### Adding new events

1. Add the event to the `EventType` enum in `packages/types/src/events.ts`
2. Define the event interface and add it to the `AppEvent` union
3. Dispatch it with `dispatchEvent()` using the enum
4. Add a `case` for it in `handler.ts`

## Email templates

Transactional emails are plain functions in `src/common/email-templates/`, composed with the shared `layout.ts` wrapper and exported from `index.ts`. The boilerplate ships `verification-code.ts` (OTP email). Add new templates as their own files and export them from `index.ts`.
