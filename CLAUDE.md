# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js on port 3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

There is no test suite. Requires a backend API running at `http://localhost:3001` (configured via `NEXT_PUBLIC_API_URL` in `.env.local`).

## Architecture

ZenCash is a **frontend-only** Next.js 16 (App Router) financial management app in TypeScript. It communicates with an external REST API for all data. The UI supports Brazilian Portuguese (`pt-br`, default) and English (`en`).

### Route structure

All routes live under `app/[locale]/` for i18n. Protected pages are in the `(protected)` route group:

```
app/[locale]/
  layout.tsx              # Locale root: fonts, metadata, NextIntlClientProvider, ToastProvider
  layout-client.tsx       # Client wrapper for ToastProvider
  (protected)/
    layout.tsx            # Wraps children with AuthGuard → DashboardLayout
    dashboard/
    transactions/
    categories/
    import/
    profile/
  login/
  register/
  reset-password/
  page.tsx                # Landing page
```

### i18n

Uses `next-intl`. Locales are defined in `i18n/routing.ts` (`pt-br` default, `en`). Translation messages are in `messages/pt-br/` and `messages/en/` split by feature namespace (e.g. `common.json`, `transactions.json`).

**Important:** Always import `Link`, `useRouter`, `usePathname`, and `redirect` from `@/i18n/navigation` (not `next/navigation`) so locale is preserved in navigation.

The next-intl middleware is in `proxy.ts` at the project root (acts as `middleware.ts`).

### Key layers

- **`app/lib/api.ts`** — Axios instance with auth interceptors. Attaches Bearer token from `localStorage`. On 401 (non-auth-management paths), clears token and redirects to `/login`. On 403, fetches a payment link from AbacatePay and redirects the user there; pass `_skipGlobalToast: true` in Axios config to suppress the global error toast for a specific request.
- **`app/lib/`** — Service modules: `auth.ts`, `transactions.ts`, `categories.ts`, `dashboard.ts`, `subscriptions.ts`, `payments.ts`, `transaction-imports.ts`. Each wraps specific API endpoints.
- **`app/lib/toast-emitter.ts`** — Singleton event emitter for global toast notifications. Deduplicates identical messages within a 2-second window.
- **`app/lib/auth-guard.tsx`** — Client component that checks `localStorage` for `zencash_token`; redirects to `/login` if absent. Mounts `SubscriptionProvider` around authorized children.
- **`app/lib/subscription-context.tsx`** — Polls `/api/subscriptions/active` every 60 seconds. Exposes `{ hasSubscription, loading }`. Shows a full-page spinner while loading.
- **`app/lib/category-context.tsx`** / **`transaction-context.tsx`** — React contexts for shared list state and edit selection, mounted in route-level `layout.tsx` files within `(protected)/categories/` and `(protected)/transactions/`.
- **`app/shared-theme/`** — MUI theme config. `AppTheme.tsx` is the provider; `themePrimitives.ts` defines colors/typography; `customizations/` overrides MUI component styles.
- **`app/components/`** — Shared components: `ToastProvider` (context + `useToast` hook), `MonthYearPicker`, `CoinLogo`.

### Provider chain

```
NextIntlClientProvider
  └─ ToastProvider
       └─ AuthGuard (checks localStorage token)
            └─ SubscriptionProvider (polls subscription status)
                 └─ DashboardLayout (AppTheme + sidebar/header shell)
                      └─ [route layout] (CategoryProvider | TransactionProvider)
                           └─ page content
```

### Auth

JWT token stored in `localStorage` as `zencash_token`. The Axios interceptor attaches it to all requests. 401 responses (outside of `/api/auth/reset-password`, `/api/auth/validate-token`, `/api/auth/forgot-password`) trigger automatic redirect to `/login`. 403 responses (outside of `/api/subscriptions/active`) trigger a redirect to the AbacatePay payment link.

### Data fetching pattern

Components fetch data directly with Axios via service functions in `app/lib/`. State is managed locally with `useState`/`useEffect`. The dashboard uses `Promise.allSettled()` for parallel fetches. No global state library.

### UI stack

MUI v7 components throughout (DataGrid, Charts, DatePickers, form controls). Styling uses MUI `sx` prop. Tailwind CSS is installed but minimally used. `framer-motion` for animations, `driver.js` for product tours, `react-colorful` for color pickers (categories), `dayjs` for date manipulation. Font: Plus Jakarta Sans. Path alias: `@/*` maps to project root.
