# Fixed Bills (Contas Fixas) — Frontend Design Spec

**Date:** 2026-06-01
**Status:** Approved
**Scope:** Frontend only (Next.js 16 App Router, TypeScript, MUI v7)

---

## 1. Overview

Allow users to register recurring fixed expenses (rent, utilities, subscriptions, etc.) to replace spreadsheets. The system provides:

- A list of fixed bills with estimated monthly/annual cost.
- Per-period payment tracking (PENDING → PAID → OVERDUE).
- Automatic reconciliation via OFX import (handled by backend; frontend shows the result).
- A dashboard widget summarising predicted vs actual spending.

**Backend is owned by a separate developer.** This spec covers only the frontend implementation.

---

## 2. API Contract (consumed, not implemented)

Base URL: `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:3001`)

| Method | Path | Purpose |
|--------|------|---------|
| POST   | `/api/fixed-bills` | Create bill |
| GET    | `/api/fixed-bills` | List bills |
| PUT    | `/api/fixed-bills/:id` | Update bill |
| DELETE | `/api/fixed-bills/:id` | Delete bill (soft) |
| GET    | `/api/fixed-bills/occurrences?month=&year=` | List occurrences for period |
| PATCH  | `/api/fixed-bills/occurrences/:id` | Manual payment override |
| GET    | `/api/dashboard` | Existing endpoint; gains `fixedBills` field |

See the original design spec for full request/response shapes.

---

## 3. File Structure

```
app/lib/fixed-bills.ts                          # service module
app/[locale]/(protected)/fixed-bills/
  page.tsx                                       # main page (two tabs)
  layout.tsx                                     # optional, no context needed
  components/
    FixedBillCard.tsx                            # bill template card with 3-dot menu
    FixedBillFormDialog.tsx                      # create/edit modal
    DeleteConfirmDialog.tsx                      # delete confirmation dialog
    OccurrenceCard.tsx                           # single occurrence row card
    OccurrenceList.tsx                           # grouped list (OVERDUE/PENDING/PAID)
    MonthSummaryCards.tsx                        # 3 summary cards + progress bar
    PaymentDialog.tsx                            # mark-as-paid / revert modal
app/[locale]/dashboard/components/FixedBillsWidget.tsx  # dashboard widget
messages/pt-br/fixed-bills.json
messages/en/fixed-bills.json
```

---

## 4. Service Module (`app/lib/fixed-bills.ts`)

Follows the same pattern as `app/lib/categories.ts`.

### Types

```ts
type Recurrence = 'MONTHLY' | 'ANNUAL';
type OccurrenceStatus = 'PENDING' | 'PAID' | 'OVERDUE';

interface FixedBill {
  id: string;
  name: string;
  amount: number;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  recurrence: Recurrence;
  dueDay: number;
  dueMonth: number | null;
  matchKeywords: string[];
  isActive: boolean;
  createdAt: string;
}

interface FixedBillOccurrence {
  id: string;
  fixedBillId: string;
  name: string;
  categoryName: string | null;
  categoryColor: string | null;
  recurrence: Recurrence;
  estimatedAmount: number;
  paidAmount: number | null;
  dueDate: string;
  status: OccurrenceStatus;
  transactionId: string | null;
}

interface FixedBillsDashboard {
  totalEstimated: number;
  totalPaid: number;
  totalPending: number;
  pendingOccurrences: Array<{
    id: string;
    name: string;
    estimatedAmount: number;
    dueDate: string;
    status: OccurrenceStatus;
  }>;
}
```

### Functions

- `getFixedBills(): Promise<FixedBill[]>` — GET `/api/fixed-bills`
- `createFixedBill(data): Promise<FixedBill>` — POST `/api/fixed-bills`
- `updateFixedBill(id, data): Promise<FixedBill>` — PUT `/api/fixed-bills/:id`
- `deleteFixedBill(id): Promise<void>` — DELETE `/api/fixed-bills/:id`
- `getOccurrences(month, year): Promise<FixedBillOccurrence[]>` — GET `/api/fixed-bills/occurrences?month=&year=`
- `updateOccurrence(id, data): Promise<FixedBillOccurrence>` — PATCH `/api/fixed-bills/occurrences/:id`
- `getFixedBillsDashboard(month, year): Promise<FixedBillsDashboard>` — GET `/api/dashboard` and extract `fixedBills` field

---

## 5. Main Page (`fixed-bills/page.tsx`)

Two MUI `Tabs`:

- **Tab 0 — "Minhas Contas"**: Lists all `FixedBill` templates. Shows a summary bar with total estimated monthly cost. FAB button "+ Adicionar conta fixa" at bottom right.
- **Tab 1 — "Este Mês"**: Shows occurrences for the selected month/year with a month navigator, 3 summary cards, a progress bar, and an occurrence list grouped by status (OVERDUE → PENDING → PAID).

The page accepts a `?tab=0|1` search param so the dashboard widget can deep-link to Tab 1.

---

## 6. Components

### FixedBillCard

Card with:
- Category color dot (gray if no category)
- Bill name + recurrence badge
- Amount formatted as "R$ X.XXX,XX/mês" or "R$ X.XXX,XX/ano"
- Due day label
- `IconButton` (MoreVertIcon) opening a `Menu` with Edit and Delete actions

### FixedBillFormDialog

Full-screen dialog (mobile) or `Dialog` (md+). Fields:
- `name` — TextField
- `amount` — TextField (numeric)
- `categoryId` — Select from user's categories (fetched on open)
- `recurrence` — RadioGroup: MONTHLY / ANNUAL
- `dueDay` — TextField (1–31)
- `dueMonth` — Select (visible only when recurrence=ANNUAL)
- `matchKeywords` — tag input (chips + TextField, Enter/comma adds a chip)

Inline validation messages below each field. On success: dismiss + refresh + toast.

### DeleteConfirmDialog

Same pattern as `categories/components/DeleteConfirmDialog.tsx`.

### OccurrenceCard

Card row for a single occurrence:
- Coloured status dot (red/yellow/green)
- Bill name + due/paid date label
- Estimated amount (or "R$ X,XX pago (est. R$ Y,YY)" when PAID with different amount)
- "Pagar" button (PENDING/OVERDUE) or "Desfazer" button (PAID)
- `🔗 Importado automaticamente` chip when `transactionId` is set and was auto-matched

### OccurrenceList

Groups occurrences by status. Renders group headers ("Em atraso", "Pendentes", "Pagas") then `OccurrenceCard` items.

### MonthSummaryCards

Three `Paper` cards in a grid: Estimado / Pago / Pendente. Below them: a linear progress bar (`paidAmount / estimatedAmount * 100`).

### PaymentDialog

Two modes:
1. **Mark as PAID**: shows `paidAmount` field (pre-filled with `estimatedAmount`) and date field (pre-filled with `dueDate`). On confirm: calls `updateOccurrence` with `{ status: 'PAID', paidAmount }`.
2. **Revert to PENDING**: confirmation text only. On confirm: calls `updateOccurrence` with `{ status: 'PENDING' }`.

### FixedBillsWidget (dashboard)

Card on the dashboard page showing the `fixedBills` section from `GET /api/dashboard`:
- Title "Contas Fixas — {Mês} {Ano}"
- 3 summary values inline (Estimado / Pago / Pendente)
- Progress bar
- Up to 3 pending/overdue occurrences listed with status dot, name, due day, and amount
- "Ver todas as contas →" link to `/fixed-bills?tab=1`

---

## 7. Sidebar

Add "Contas Fixas" nav item to `DashboardSidebar.tsx` under the "Gestão" section, between "Transações" and "Importar OFX". Use `ReceiptIcon` or `EventRepeatIcon` from `@mui/icons-material`.

Add translation key `nav.fixedBills` to `common.json` (both locales).

---

## 8. i18n

New file `messages/pt-br/fixed-bills.json` (and `en/fixed-bills.json`) with keys covering:
- Page titles, tab labels
- Field labels and placeholders
- Validation messages
- Status labels (PENDING, PAID, OVERDUE)
- Group headers, empty states
- Toast messages
- Dialog titles and button labels

---

## 9. Dashboard Integration

The existing `DashboardPage` fetches data with `Promise.allSettled`. Add a 6th fetch for `getFixedBillsDashboard(currentMonth, currentYear)`. Pass the result to `FixedBillsWidget`.

---

## 10. Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| No bills registered | Empty state with CTA on Tab 0; Tab 1 shows "Nenhuma conta cadastrada" |
| Month has no occurrences | Summary shows R$ 0,00; "Nenhuma conta fixa este mês" |
| `paidAmount !== estimatedAmount` | Show both: "R$ X pago (est. R$ Y)" |
| Auto-matched by OFX | Show `🔗 Importado automaticamente` chip |
| API error on load | Graceful fallback; global toast via Axios interceptor |
| No category linked | Neutral gray dot |
