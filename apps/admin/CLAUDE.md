# Printa Admin Panel

> See also: [Root CLAUDE.md](../../CLAUDE.md) for InstantDB patterns, shared constants, routing, and monorepo conventions.

> Admin panel for managing products, categories, sections, orders, and users. Built with React, Ant Design, React Query, and Jotai.

## Tech Stack

| Layer          | Technology                                                   |
| -------------- | ------------------------------------------------------------ |
| **Framework**  | React (Vite)                                                 |
| **Language**   | TypeScript                                                   |
| **UI Library** | Ant Design                                                   |
| **State**      | Jotai (global), React Query (server)                         |
| **Styling**    | Tailwind CSS                                                 |
| **Formatter**  | Prettier (`semi: false`, `singleQuote: true`, `tabWidth: 2`) |
| **Linter**     | ESLint                                                       |

## Always check Ant Design docs before implementing

CRITICAL: Before writing or modifying any Ant Design-related code, you MUST fetch the relevant Ant Design documentation page and review the API and code examples first. Use `WebFetch` on `https://ant.design/components/<component-name>` to verify correct usage, required props, hook patterns, and recommended approaches. Never assume how an antd component or API works from memory — always verify against the docs.

## Extract table columns into separate files

For Ant Design `Table` components, extract column definitions into dedicated files (e.g., `productColumns.tsx`, `categoryColumns.tsx`) next to the page component. Export a function that accepts dependencies (t, callbacks) and returns `ColumnsType<T>`.

```tsx
// Correct: pages/products/productColumns.tsx
export function getProductColumns({ t, onEdit, onDelete }: Params): ColumnsType<T> { ... }

// Correct: pages/products/Products.tsx
import { getProductColumns } from './productColumns'
const columns = getProductColumns({ t, onEdit, onDelete, isDeleting })

// Wrong: Inline columns array inside the page component
const columns: ColumnsType<T> = [ /* 100+ lines */ ]
```

## Use Jotai atoms for global/shared state — not React Context

Never use `createContext` / `useContext` for shared state management. Use Jotai atoms instead — they're simpler, require no providers, and avoid unnecessary re-renders.

```tsx
import { atom, useAtom } from 'jotai'

const myAtom = atom<string>('default')
export function useMyState() {
  return useAtom(myAtom)
}
```

## Use toast notifications for all mutations

Every mutation hook must show a toast notification on both success and error using antd's `notification` API (positioned bottom-left, configured globally in `Providers.tsx`). Never use `message` from antd — always use `notification`.

```tsx
import { App } from 'antd'

// Correct: use App.useApp() hook for context-aware notifications
const { notification } = App.useApp()
notification.success({ message: t('something.created') })
notification.error({ message: getErrMsg(err) || t('something.createFailed') })

// Wrong: static import — doesn't render inside App context
import { notification } from 'antd'
notification.success({ message: 'Created' })

// Wrong: message API
message.success('Created')
```

Rules:

- **CRITICAL:** Always use `App.useApp()` to get the `notification` instance — never use `import { notification } from 'antd'` (static API doesn't render inside the `<App>` context)
- Use `notification.success()` for success, `notification.error()` for errors
- Always use i18n translation keys (`t('...')`) — never hardcode English strings
- For errors, prefer the API error message with a translated fallback
- Notification placement is configured globally — do not pass `placement` per call
- Wrap `mutateAsync` calls in try/catch in form submit handlers — the mutation `onError` handles the notification, the catch prevents unhandled rejections

## Admin form layout — buttons in tab bar, single column, Card sections

All admin CRUD forms (products, categories, sections) follow a consistent layout pattern:

1. **Buttons in the tab bar** — Cancel and Save/Create buttons go in `tabBarExtraContent` of the top-level `Tabs` component
2. **Single column layout** — No two-column `Row`/`Col` splits. All cards and fields stack vertically
3. **`Card` for grouping** — Use antd `Card` with `title` to group related fields. No `Divider` + `Typography.Title` combos
4. **Translation tabs** — Language tabs (ka / en) are the primary tab navigation. Use `forceRender: true` so hidden tab fields are included in form submission
5. **Edit stays on page** — On save (edit mode), do NOT navigate back to the list. Only navigate on create

```tsx
// Correct: Buttons in tabBarExtraContent
<Tabs
  defaultActiveKey="ka"
  size="large"
  tabBarExtraContent={
    <div className="flex gap-2">
      <Button onClick={() => navigate(adminRoutes.list())}>{t('common.cancel')}</Button>
      <Button type="primary" htmlType="submit" loading={saving}>
        {isEdit ? t('common.save') : t('common.create')}
      </Button>
    </div>
  }
  items={[...]}
/>
```

## Admin detail page header — consistent back button pattern

All admin detail/edit pages use the same header pattern: a `<span className="flex items-center gap-2">` wrapping a `type="text"` back button + title text, passed as the first argument to `setHeader()`.

```tsx
setHeader(
  <span className="flex items-center gap-2">
    <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(adminRoutes.list())} />
    {t('entity.detail')}
  </span>
)
```

## Optimistic updates for mutations — update all relevant cache keys

When using React Query optimistic updates, ensure ALL related cache entries are updated — not just list queries. Use `predicate` to target specific query types and separately update detail queries.

```tsx
onMutate: async ({ id, status }) => {
  await queryClient.cancelQueries({ queryKey: ['orders'] })

  // Update list/kanban queries (exclude detail)
  queryClient.setQueriesData(
    { queryKey: ['orders'], predicate: (q) => q.queryKey[1] !== 'detail' },
    (old) => {
      /* update items */
    }
  )

  // Also update detail query if cached
  queryClient.setQueryData(['orders', 'detail', id], (old) => {
    if (!old) return old
    return { ...old, status, updatedAt: Date.now() }
  })
}
```

Always rollback ALL updated caches in `onError`, and invalidate in `onSettled`.

## Admin order status transitions — unrestricted except terminal states

Admin can move orders to ANY status from any non-terminal state. Only `delivered` and `cancelled` are terminal (no further transitions). This is enforced by `getValidNextStatuses()` in `packages/types/src/utils/order.ts` and validated server-side in the PUT endpoint.
