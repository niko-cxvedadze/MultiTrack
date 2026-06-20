# Printa Backend

> See also: [Root CLAUDE.md](../../CLAUDE.md) for InstantDB patterns, shared constants, routing, and monorepo conventions.

> Hono API on Cloudflare Workers with InstantDB admin SDK, Zod validation, and event-driven notifications.

## Tech Stack

| Layer                | Technology                              |
| -------------------- | --------------------------------------- |
| **Framework**        | Hono                                    |
| **Runtime**          | Cloudflare Workers                      |
| **Language**         | TypeScript                              |
| **Database**         | InstantDB (admin SDK)                   |
| **Formatter/Linter** | Biome (semicolons, double quotes, tabs) |
| **Async**            | `p-map` for concurrent operations       |

## Use `prepareUpdate` and `prepareCreate` for InstantDB payloads

All store and service update/create methods must use the shared utilities from `@/common/utils/instantUpdates` to handle null/undefined values correctly. Never use inline `coerceNulls`, `mapValues`, or `omitBy(…, isUndefined)` patterns.

```tsx
import { prepareCreate, prepareUpdate } from '@/common/utils/instantUpdates'

// Update: undefined = skip, null = clear field, value = set
const updates = prepareUpdate(data as Record<string, unknown>, ['relationField'])
updates.updatedAt = Date.now()

// Create: drops undefined and null fields
const attrs = prepareCreate(data as Record<string, unknown>, ['relationField'])
```

The `omitKeys` parameter excludes relation IDs (e.g., `categoryId`, `whitelistedUserIds`) that are handled separately via link/unlink.

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

## Use `buildStockRestoreTxs` for stock restoration on cancellation

Stock restoration logic lives in `src/common/utils/stockRestore.ts`. Both the user cancel endpoint (`orderService.cancelOrder`) and the admin status update endpoint (`admin-orders.ts`) use this shared function. Never duplicate the stock restoration logic inline.

```tsx
import { buildStockRestoreTxs } from '@/common/utils/stockRestore'

const stockRestoreTxs =
  newStatus === OrderStatus.Cancelled ? buildStockRestoreTxs(order.items ?? [], adminDb) : []
```

## Always validate route params and request bodies with Zod

Every backend route that accepts params (`:id`) or a JSON body MUST validate them with Zod schemas from `packages/types/src/validators/`. Never trust raw `c.req.param()` or `c.req.json()` — always `safeParse` before use.

```tsx
import { orderIdParamSchema, updateOrderStatusBodySchema } from '@repo/types'

// Correct: Validate params
const paramResult = orderIdParamSchema.safeParse({ id: c.req.param('id') })
if (!paramResult.success) {
  return c.json({ success: false, message: 'Invalid order ID', statusCode: 400 }, 400)
}

// Correct: Validate body
const bodyResult = updateOrderStatusBodySchema.safeParse(await c.req.json())
if (!bodyResult.success) {
  return c.json({ success: false, message: bodyResult.error.issues[0]?.message, statusCode: 400 }, 400)
}

// Wrong: Unvalidated cast
const orderId = c.req.param('id')
const body = await c.req.json<{ status: string }>()
const status = body.status as OrderStatus
```

For ID params, use `z.string().uuid()`. For enum fields, use `z.nativeEnum(MyEnum)`.

## Validate JWT payloads with Zod — never use `as unknown as`

JWT payloads from `jwtVerify` must be validated with `AdminJwtPayloadSchema.safeParse()` before use.

```tsx
import { AdminJwtPayloadSchema } from '@repo/types'

// Correct
const { payload } = await jwtVerify(token, secret)
const parsed = AdminJwtPayloadSchema.safeParse(payload)
if (!parsed.success) return null
return parsed.data

// Wrong
return payload as unknown as { email: string; role: string }
```

## Rate limit all authentication endpoints

All auth endpoints (OTP send, admin login) must have rate limiting middleware. Use Cloudflare Workers rate limit bindings configured in `wrangler.jsonc`. The `simple.period` only supports values of `10` or `60` seconds.

- OTP endpoints: `rateLimitOtp` middleware, keyed on phone/email
- Admin login: `rateLimitAdminLogin` middleware, keyed on IP (`cf-connecting-ip`)

## Event system — `EventType` enum, `dispatchEvent`, and notifier pattern

All application events use the `EventType` enum from `@repo/types` (never string literals). Event payloads must be minimal — only IDs and status values. Consumers fetch full data from DB when needed.

### Dispatching events

Use `dispatchEvent()` from `@/common/utils/dispatchEvent` to send events to the queue. It wraps `queue.send()` with try/catch so dispatch failures never break the main request flow.

```tsx
import { EventType } from '@repo/types'

import { dispatchEvent } from '@/common/utils/dispatchEvent'

// Correct: Use enum + dispatchEvent with minimal payload
await dispatchEvent(queue, { type: EventType.OrderCreated, orderId })
await dispatchEvent(queue, { type: EventType.OrderStatusChanged, orderId, newStatus })

// Wrong: String literals
await queue.send({ type: 'order.created', orderId })

// Wrong: Bloated payload (fetch in consumer instead)
await queue.send({ type: EventType.OrderCreated, orderId, contactName, items, totalPrice })
```

### Queue handler and notifiers

The queue handler (`src/queue/handler.ts`) is a **pure router** — it fans out events to notifiers via `Promise.all`. It does NOT contain business logic. For order events, it pre-fetches the order and passes it optionally to notifiers.

Notifiers live in `src/queue/notifiers/` and are organized by **delivery channel** (not by event type):

- `emailNotifier.ts` — sends emails via Resend
- `smsNotifier.ts` — sends SMS via Sender.ge

Each notifier receives `(event, env, order?)` and handles all event types relevant to its channel.

### Adding new events

1. Add the event to `EventType` enum in `packages/types/src/events.ts`
2. Define the event interface and add it to the `AppEvent` union
3. Dispatch with `dispatchEvent()` using the enum
4. Add cases in each notifier that should react to the event

### Order status labels for emails/templates

Use `ORDER_STATUS_NAMES_KA` and `ORDER_STATUS_NAMES_EN` from `@repo/types` for raw status labels in emails, PDFs, and other non-i18n contexts. Never hardcode status label maps in template files.

### Email template naming

Email template functions follow the event naming pattern: `orderCreatedHtml/Subject`, `orderStatusChangedHtml/Subject`. Template files live in `src/common/email-templates/` and are named after the event (e.g., `order-created.ts`, `order-status-changed.ts`).
