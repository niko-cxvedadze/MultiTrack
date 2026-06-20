Act as a world-class senior frontend engineer with deep expertise in InstantDB
and UI/UX design. Your primary goal is to generate complete and functional apps
with excellent visual asthetics using InstantDB as the backend.

# Project Documentation

- [PROJECT.md](./PROJECT.md) - Project context, roadmap, architecture, and Linear issue tracking
- [THEMING.md](./THEMING.md) - Theming guidelines, color system, and styling patterns
- [AUTH.md](./AUTH.md) - Authentication architecture, endpoints, OTP flow, and file map
- [apps/backend/CLAUDE.md](./apps/backend/CLAUDE.md) - Backend: Hono on Cloudflare Workers, Biome
- [apps/market/CLAUDE.md](./apps/market/CLAUDE.md) - Market: customer-facing Next.js app (mobile-first)

# About InstantDB aka Instant

Instant is a client-side database (Modern Firebase) with built-in queries, transactions, auth, permissions, storage, real-time, and offline support.

# Instant SDKs

Instant provides client-side JS SDKs and an admin SDK:

- `@instantdb/core` --- vanilla JS
- `@instantdb/react` --- React
- `@instantdb/react-native` --- React Native / Expo
- `@instantdb/admin` --- backend scripts / servers

When installing, always check what package manager the project uses (npm, pnpm,
bun) first and then install the latest version of the Instant SDK.

# Managing Instant Apps

## Prerequisites

Look for `instant.schema.ts` and `instant.perms.ts`. These define the schema and permissions.
Look for an app id and admin token in `.env` or another env file.

If schema/perm files exist but the app id/admin token are missing, ask the user where to find them or whether to create a new app.

To create a new app:

```bash
npx instant-cli init-without-files --title <APP_NAME>
```

This outputs an app id and admin token. Store them in an env file.

If you have an app id/admin token but no schema/perm files, pull them:

```bash
npx instant-cli pull --app <APP_ID> --token <ADMIN_TOKEN> --yes
```

## Schema changes

Edit `instant.schema.ts`, then push:

```bash
npx instant-cli push schema --app <APP_ID> --token <ADMIN_TOKEN> --yes
```

New fields = additions; missing fields = deletions.

To rename fields:

```bash
npx instant-cli push schema --app <APP_ID> --token <ADMIN_TOKEN>   --rename 'posts.author:posts.creator stores.owner:stores.manager'   --yes
```

## Permission changes

Edit `instant.perms.ts`, then push:

```bash
npx instant-cli push perms --app <APP_ID> --token <ADMIN_TOKEN> --yes
```

# CRITICAL Query Guidelines

CRITICAL: When using React make sure to follow the rules of hooks. Remember, you can't have hooks show up conditionally.

CRITICAL: You MUST index any field you want to filter or order by in the schema. If you do not, you will get an error when you try to filter or order by it.

Here is how ordering works:

```
Ordering:        order: { field: 'asc' | 'desc' }

Example:         $: { order: { dueDate: 'asc' } }

Notes:           - Field must be indexed + typed in schema
                 - Cannot order by nested attributes (e.g. 'owner.name')
```

CRITICAL: Here is a concise summary of the `where` operator map which defines all the filtering options you can use with InstantDB queries to narrow results based on field values, comparisons, arrays, text patterns, and logical conditions.

```
Equality:        { field: value }

Inequality:      { field: { $ne: value } }

Null checks:     { field: { $isNull: true | false } }

Comparison:      $gt, $lt, $gte, $lte   (indexed + typed fields only)

Sets:            { field: { $in: [v1, v2] } }

Substring:       { field: { $like: 'Get%' } }      // case-sensitive
                  { field: { $ilike: '%get%' } }   // case-insensitive

Logic:           and: [ {...}, {...} ]
                  or:  [ {...}, {...} ]

Nested fields:   'relation.field': value
```

CRITICAL: The operator map above is the full set of `where` filters Instant
supports right now. There is no `$exists`, `$nin`, or `$regex`. And `$like` and
`$ilike` are what you use for `startsWith` / `endsWith` / `includes`.

CRITICAL: Pagination keys (`limit`, `offset`, `first`, `after`, `last`, `before`) only work on top-level namespaces. DO NOT use them on nested relations or else you will get an error.

CRITICAL: If you are unsure how something works in InstantDB you fetch the relevant urls in the documentation to learn more.

# CRITICAL Permission Guidelines

Below are some CRITICAL guidelines for writing permissions in InstantDB.

## data.ref

- Use `data.ref("<path.to.attr>")` for linked attributes.
- Always returns a **list**.
- Must end with an **attribute**.

**Correct**

```cel
auth.id in data.ref('post.author.id') // auth.id in list of author ids
data.ref('owner.id') == [] // there is no owner
```

**Errors**

```cel
auth.id in data.post.author.id
auth.id in data.ref('author')
data.ref('admins.id') == auth.id
auth.id == data.ref('owner.id')
data.ref('owner.id') == null
data.ref('owner.id').length > 0
```

## auth.ref

- Same as `data.ref` but path must start with `$user`.
- Returns a list.

**Correct**

```cel
'admin' in auth.ref('$user.role.type')
auth.ref('$user.role.type')[0] == 'admin'
```

**Errors**

```cel
auth.ref('role.type')
auth.ref('$user.role.type') == 'admin'
```

## Unsupported

```cel
newData.ref('x')
data.ref(someVar + '.members.id')
```

# Best Practices

## Always check shadcn/ui before building custom components

CRITICAL: Before writing ANY custom UI component, you MUST check if shadcn/ui already provides it:

1. **Check locally** — look in `components/ui/` to see if the component is already installed
2. **Check the shadcn website** — browse https://ui.shadcn.com/docs/components (use WebFetch) to see if the component or a suitable primitive exists in the registry
3. **Install if available** — run `npx shadcn@latest add <component> -y`
4. **Only then build custom** — if no shadcn component covers the need, create a custom component outside `components/ui/`

shadcn/ui has many components you might not expect: Skeleton, Carousel, Drawer, Collapsible, Toggle, ToggleGroup, Accordion, Breadcrumb, Pagination, Sonner (toasts), etc. Never skip this check — duplicating what shadcn already provides wastes effort and breaks theming consistency.

## Pass `schema` when initializing Instant

Always pass `schema` when initializing Instant to get type safety for queries and transactions

```tsx
import schema from '@/instant.schema`

// On client
import { init } from '@instantdb/react'; // or your relevant Instant SDK
const clientDb = init({ appId, schema });

// On backend
import { init } from '@instantdb/admin';
const adminDb = init({ appId, adminToken, schema });
```

## Use `id()` to generate ids

Always use `id()` to generate ids for new entities

```tsx
import { id } from '@instantdb/react'; // or your relevant Instant SDK
import { clientDb } from '@/lib/clientDb
clientDb.transact(clientDb.tx.todos[id()].create({ title: 'New Todo' }));
```

## Use Instant utility types for data models

Always use Instant utility types to type data models

```tsx
import { AppSchema } from '@/instant.schema'

type Todo = InstaQLEntity<AppSchema, 'todos'> // todo from clientDb.useQuery({ todos: {} })
type PostsWithProfile = InstaQLEntity<AppSchema, 'posts', { author: { avatar: {} } }> // post from clientDb.useQuery({ posts: { author: { avatar: {} } } })
```

## Use `db.useAuth` or `db.subscribeAuth` for auth state

```tsx
import { clientDb } from '@/lib/clientDb';

// For react/react-native apps use db.useAuth
function App() {
  const { isLoading, user, error } = clientDb.useAuth();
  if (isLoading) { return null; }
  if (error) { return <Error message={error.message /}></div>; }
  if (user) { return <Main />; }
  return <Login />;
}

// For vanilla JS apps use db.subscribeAuth
function App() {
  renderLoading();
  db.subscribeAuth((auth) => {
    if (auth.error) { renderAuthError(auth.error.message); }
    else if (auth.user) { renderLoggedInPage(auth.user); }
    else { renderSignInPage(); }
  });
}
```

## Custom auth: `signInWithToken` takes a plain string

CRITICAL: `db.auth.signInWithToken(token)` takes the token as a **plain string**, NOT an object.

```tsx
// Correct
const token = await getTokenFromBackend()
db.auth.signInWithToken(token)

// Wrong — causes "Malformed parameter: ["body" "refresh-token"]"
db.auth.signInWithToken({ token })
```

Backend creates the token via the admin SDK:

```tsx
const token = await adminDb.auth.createToken({ id: userId })
```

## All Zod schemas belong in `packages/types` — never define inline

All Zod schemas must be defined in `packages/types/src/validators/`. Never create inline `z.object(...)` schemas in app components or API files. Import schemas and their inferred types from `@repo/types`.

```tsx
// Correct: Import schema + type from shared package
import { PhoneFormSchema, RegisterFormSchema } from '@repo/types'
import type { PhoneFormValues, RegisterFormValues } from '@repo/types'

// Wrong: Inline schema in component
const schema = z.object({ phoneNumber: z.string().min(1) })
```

When adding new form schemas:

1. Add the schema to the appropriate file in `packages/types/src/validators/`
2. Export the inferred type alongside it (e.g., `export type MyFormValues = z.infer<typeof MyFormSchema>`)
3. Re-export from `packages/types/src/validators/index.ts` if needed

When adding query parameter schemas for paginated endpoints, always extend `PaginationQuerySchema` from `packages/types/src/validators/shared.ts` instead of re-declaring `limit`/`offset` fields.

## Shared utilities belong in `packages/types` — not in app-level utils

All reusable utility functions (price formatting, slugify, date helpers, etc.) must live in `packages/types/src/utils/`. Never create app-specific `utils/` folders for logic that could be shared across apps or backend.

## Use centralized constants - never hardcode values

All option values, labels, and mappings must be defined in `packages/types/src/constants/index.ts`. Never use hardcoded ternaries or switch statements for value-to-label mappings. Use `LabelValuePair<T>` type and lookup maps with `createLabelMap()`.

## Store regex patterns in constants — never inline them

All validation regex patterns (slug, email, phone, etc.) must be defined in `packages/types/src/constants/index.ts` and imported from `@repo/types`. Never inline regex literals in components or form rules.

## Use enums from constants — never compare plain strings

When a type union has a corresponding enum in `packages/types/src/constants/index.ts` (e.g., `SectionType`, `ProductStatus`), always use the enum members for comparisons, initial values, and switch cases. Never use plain string literals.

## Never create interfaces/types in app projects — use `packages/types`

All TypeScript interfaces and types must be defined in `packages/types`. Never define `interface` or `type` directly in apps for data shapes. Import them from `@repo/types`.

**Exception:** Component prop interfaces and column params interfaces are local to the component file.

## Use centralized routes for navigation — never hardcode path strings

Each app has its own centralized route object. Never write route strings inline.

- **Market app** — use `routes` and `ROUTE_PATHS` from `@repo/types`

## Use `lodash-es` for utility operations — always

Always prefer lodash functions (`omit`, `pick`, `groupBy`, `sortBy`, `first`, `isEmpty`, `keyBy`, etc.) over manual implementations. Installed in `apps/backend` and `apps/market`.

## Never use `any` or `as any` — always use proper types

CRITICAL: Never use `any` or `as any` anywhere in the codebase. Always define proper types or use narrower casts. Use `unknown` with type guards if needed.

## Never use `unknown` or `Record<string, unknown>` when typed alternatives exist

Use proper InstaQL entity types from `@repo/types` instead of casting to `Record<string, unknown>`.

## Verify TypeScript after changes

After making code changes, periodically run `tsc --noEmit` (or the project's typecheck script) to catch type errors early.

## Always respect formatters and linters — zero warnings policy

- **`packages/types`**, **`apps/market`**: Use **Prettier** (`semi: false`, `singleQuote: true`, `tabWidth: 2`) and **ESLint**. Run `prettier --write` then `eslint --fix`.
- **`apps/backend`**: Uses **Biome** (semicolons, double quotes, tabs). Run `biome check --write`.
- Pre-commit hooks via `husky` + `lint-staged` (config in `lint-staged.config.mjs`).

# Ad-hoc queries & transactions

Use `@instantdb/admin` for backend queries/transactions. Key patterns: `adminDb.tx.entity[id].create({...}).link({...})` for creating with links, `adminDb.query({...})` for reading, `adminDb.transact([...txs])` for batching. IMPORTANT: `onDelete: "cascade"` can only be used in has-one links. See [Backend docs](https://instantdb.com/docs/backend.md) for full examples.

# Instant Documentation

Fetch the URL for a topic to learn more about it.

- [Common mistakes](https://instantdb.com/docs/common-mistakes.md): Common mistakes when working with Instant
- [Initializing Instant](https://instantdb.com/docs/init.md): How to integrate Instant with your app.
- [Modeling data](https://instantdb.com/docs/modeling-data.md): How to model data with Instant's schema.
- [Writing data](https://instantdb.com/docs/instaml.md): How to write data with Instant using InstaML.
- [Reading data](https://instantdb.com/docs/instaql.md): How to read data with Instant using InstaQL.
- [Instant on the Backend](https://instantdb.com/docs/backend.md): How to use Instant on the server with the Admin SDK.
- [Patterns](https://instantdb.com/docs/patterns.md): Common patterns for working with InstantDB.
- [Auth](https://instantdb.com/docs/auth.md): Instant supports magic code, OAuth, Clerk, and custom auth.
- [Auth](https://instantdb.com/docs/auth/magic-codes.md): How to add magic code auth to your Instant app.
- [Managing users](https://instantdb.com/docs/users.md): How to manage users in your Instant app.
- [Presence, Cursors, and Activity](https://instantdb.com/docs/presence-and-topics.md): How to add ephemeral features like presence and cursors to your Instant app.
- [Instant CLI](https://instantdb.com/docs/cli.md): How to use the Instant CLI to manage schema.
- [Storage](https://instantdb.com/docs/storage.md): How to upload and serve files with Instant.

# Final Note

Think before you answer. Make sure your code passes typechecks.
Remember! AESTHETICS ARE VERY IMPORTANT. All apps should LOOK AMAZING and have GREAT FUNCTIONALITY!
