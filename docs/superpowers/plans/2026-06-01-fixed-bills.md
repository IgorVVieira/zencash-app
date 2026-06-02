# Fixed Bills (Contas Fixas) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Fixed Bills (Contas Fixas) feature — CRUD for recurring bill templates, per-period payment tracking, and a dashboard widget — using the existing Next.js 16 + MUI v7 + next-intl patterns.

**Architecture:** Frontend-only. A new `app/lib/fixed-bills.ts` service module wraps the REST API (same Axios pattern as `app/lib/categories.ts`). The main page at `app/[locale]/(protected)/fixed-bills/` renders two tabs: bill list (Tab 0) and monthly occurrences (Tab 1). Each tab is a focused child component. A `FixedBillsWidget` is added to the existing dashboard via a 6th `Promise.allSettled` slot.

**Tech Stack:** Next.js 16 App Router, TypeScript, MUI v7, next-intl, framer-motion, Axios (`app/lib/api.ts`)

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `app/lib/fixed-bills.ts` | Service: types + API functions |
| Create | `messages/pt-br/fixed-bills.json` | pt-br translations |
| Create | `messages/en/fixed-bills.json` | en translations |
| Modify | `messages/pt-br/common.json` | Add `nav.fixedBills` key |
| Modify | `messages/en/common.json` | Add `nav.fixedBills` key |
| Create | `app/[locale]/(protected)/fixed-bills/components/FixedBillCard.tsx` | Bill template card with 3-dot menu |
| Create | `app/[locale]/(protected)/fixed-bills/components/FixedBillFormDialog.tsx` | Create/edit dialog |
| Create | `app/[locale]/(protected)/fixed-bills/components/DeleteBillDialog.tsx` | Delete confirmation |
| Create | `app/[locale]/(protected)/fixed-bills/components/BillsTab.tsx` | Tab 0 — bill list, FAB, dialogs |
| Create | `app/[locale]/(protected)/fixed-bills/components/MonthSummaryCards.tsx` | 3 summary cards + progress bar |
| Create | `app/[locale]/(protected)/fixed-bills/components/PaymentDialog.tsx` | Mark paid / revert dialog |
| Create | `app/[locale]/(protected)/fixed-bills/components/OccurrenceCard.tsx` | Single occurrence row |
| Create | `app/[locale]/(protected)/fixed-bills/components/OccurrenceList.tsx` | Grouped list (OVERDUE→PENDING→PAID) |
| Create | `app/[locale]/(protected)/fixed-bills/components/MonthTab.tsx` | Tab 1 — monthly occurrences |
| Create | `app/[locale]/(protected)/fixed-bills/page.tsx` | Page shell with two tabs |
| Modify | `app/[locale]/dashboard/components/DashboardSidebar.tsx` | Add Fixed Bills nav item |
| Create | `app/[locale]/dashboard/components/FixedBillsWidget.tsx` | Dashboard widget |
| Modify | `app/[locale]/(protected)/dashboard/page.tsx` | Add FixedBillsWidget |

---

## Task 1: Service module

**Files:**
- Create: `app/lib/fixed-bills.ts`

- [ ] **Create the service module with all types and API functions**

```typescript
import api from './api';

export type Recurrence = 'MONTHLY' | 'ANNUAL';
export type OccurrenceStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface FixedBill {
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

export interface FixedBillOccurrence {
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

export interface FixedBillsDashboardItem {
  id: string;
  name: string;
  estimatedAmount: number;
  dueDate: string;
  status: OccurrenceStatus;
}

export interface FixedBillsDashboard {
  totalEstimated: number;
  totalPaid: number;
  totalPending: number;
  pendingOccurrences: FixedBillsDashboardItem[];
}

export interface CreateFixedBillRequest {
  name: string;
  amount: number;
  categoryId?: string | null;
  recurrence: Recurrence;
  dueDay: number;
  dueMonth?: number | null;
  matchKeywords: string[];
}

export interface UpdateFixedBillRequest {
  name?: string;
  amount?: number;
  categoryId?: string | null;
  recurrence?: Recurrence;
  dueDay?: number;
  dueMonth?: number | null;
  matchKeywords?: string[];
}

export interface UpdateOccurrenceRequest {
  status: 'PAID' | 'PENDING';
  paidAmount?: number;
}

export async function getFixedBills(): Promise<FixedBill[]> {
  const response = await api.get<FixedBill[]>('/api/fixed-bills');
  return response.data;
}

export async function createFixedBill(data: CreateFixedBillRequest): Promise<FixedBill> {
  const response = await api.post<FixedBill>('/api/fixed-bills', data);
  return response.data;
}

export async function updateFixedBill(id: string, data: UpdateFixedBillRequest): Promise<FixedBill> {
  const response = await api.put<FixedBill>(`/api/fixed-bills/${id}`, data);
  return response.data;
}

export async function deleteFixedBill(id: string): Promise<void> {
  await api.delete(`/api/fixed-bills/${id}`);
}

export async function getOccurrences(
  month: number,
  year: number,
): Promise<FixedBillOccurrence[]> {
  const response = await api.get<FixedBillOccurrence[]>(
    `/api/fixed-bills/occurrences?month=${month}&year=${year}`,
  );
  return response.data;
}

export async function updateOccurrence(
  id: string,
  data: UpdateOccurrenceRequest,
): Promise<FixedBillOccurrence> {
  const response = await api.patch<FixedBillOccurrence>(
    `/api/fixed-bills/occurrences/${id}`,
    data,
  );
  return response.data;
}

export async function getFixedBillsDashboard(
  month: number,
  year: number,
): Promise<FixedBillsDashboard | null> {
  const response = await api.get<{ fixedBills?: FixedBillsDashboard }>(
    `/api/dashboard?month=${month}&year=${year}`,
  );
  return response.data.fixedBills ?? null;
}
```

- [ ] **Commit**

```bash
git add app/lib/fixed-bills.ts
git commit -m "feat: add fixed-bills service module"
```

---

## Task 2: pt-br translations

**Files:**
- Create: `messages/pt-br/fixed-bills.json`

- [ ] **Create the pt-br translation file**

```json
{
  "title": "Contas Fixas",
  "tabBills": "Minhas Contas",
  "tabMonth": "Este Mês",
  "addBill": "Adicionar conta fixa",
  "totalEstimated": "Total estimado por mês",
  "tooltipAnnual": "Custo mensal equivalente",
  "emptyState": {
    "title": "Você ainda não tem contas fixas.",
    "description": "Adicione suas contas recorrentes para acompanhar seus gastos com mais controle.",
    "cta": "Adicionar conta fixa"
  },
  "emptyMonth": "Nenhuma conta fixa este mês",
  "noOccurrences": "Nenhuma conta cadastrada",
  "form": {
    "createTitle": "Nova conta fixa",
    "editTitle": "Editar conta fixa",
    "name": "Nome da conta",
    "namePlaceholder": "ex: Aluguel, Netflix, Água",
    "amount": "Valor estimado (R$)",
    "category": "Categoria (opcional)",
    "categoryNone": "Nenhuma",
    "recurrence": "Recorrência",
    "monthly": "Mensal",
    "annual": "Anual",
    "dueDay": "Dia do mês",
    "dueMonth": "Mês de vencimento",
    "keywords": "Palavras-chave para match automático",
    "keywordsHint": "Use palavras que aparecem na descrição do extrato do seu banco (OFX).",
    "keywordsPlaceholder": "Adicionar palavra-chave",
    "nameRequired": "Nome é obrigatório",
    "amountRequired": "Informe um valor positivo",
    "dueDayInvalid": "Dia inválido (use 1–31)",
    "keywordsRequired": "Adicione ao menos uma palavra-chave"
  },
  "recurrenceLabel": {
    "MONTHLY": "/mês",
    "ANNUAL": "/ano"
  },
  "dueLabel": {
    "monthly": "Vence todo dia {day}",
    "annual": "Vence em {month}, dia {day}"
  },
  "months": {
    "1": "Janeiro",
    "2": "Fevereiro",
    "3": "Março",
    "4": "Abril",
    "5": "Maio",
    "6": "Junho",
    "7": "Julho",
    "8": "Agosto",
    "9": "Setembro",
    "10": "Outubro",
    "11": "Novembro",
    "12": "Dezembro"
  },
  "summary": {
    "estimated": "Estimado",
    "paid": "Pago",
    "pending": "Pendente",
    "progress": "{pct}% pago"
  },
  "groupHeaders": {
    "OVERDUE": "Em atraso",
    "PENDING": "Pendentes",
    "PAID": "Pagas"
  },
  "occurrence": {
    "dueDateLabel": "Vence em {date}",
    "overdueDateLabel": "Venceu em {date}",
    "paidDateLabel": "Pago em {date}",
    "paidWithEstimated": "{paid} pago (est. {estimated})",
    "autoMatched": "Importado automaticamente",
    "payButton": "Pagar",
    "undoButton": "Desfazer"
  },
  "payment": {
    "markTitle": "Marcar como paga",
    "revertTitle": "Desfazer pagamento",
    "paidAmount": "Valor pago (R$)",
    "revertConfirm": "Tem certeza que deseja marcar \"{name}\" como não pago em {period}?",
    "confirm": "Confirmar pagamento",
    "undo": "Desfazer"
  },
  "delete": {
    "title": "Excluir conta fixa",
    "confirm": "Deseja excluir \"{name}\"? Os registros de pagamento anteriores serão mantidos, mas futuras cobranças serão removidas.",
    "button": "Excluir"
  },
  "toast": {
    "created": "Conta criada com sucesso",
    "updated": "Conta atualizada",
    "deleted": "Conta excluída",
    "markedPaid": "Marcada como paga",
    "markedPending": "Marcada como pendente"
  },
  "dashboard": {
    "title": "Contas Fixas — {month} {year}",
    "viewAll": "Ver todas as contas"
  }
}
```

- [ ] **Commit**

```bash
git add messages/pt-br/fixed-bills.json
git commit -m "feat: add fixed-bills pt-br translations"
```

---

## Task 3: en translations + nav keys

**Files:**
- Create: `messages/en/fixed-bills.json`
- Modify: `messages/pt-br/common.json` — add `"fixedBills": "Contas Fixas"` inside `"nav"`
- Modify: `messages/en/common.json` — add `"fixedBills": "Fixed Bills"` inside `"nav"`

- [ ] **Create the en translation file**

```json
{
  "title": "Fixed Bills",
  "tabBills": "My Bills",
  "tabMonth": "This Month",
  "addBill": "Add fixed bill",
  "totalEstimated": "Total estimated per month",
  "tooltipAnnual": "Monthly equivalent cost",
  "emptyState": {
    "title": "No fixed bills yet.",
    "description": "Add your recurring bills to track your spending with more control.",
    "cta": "Add fixed bill"
  },
  "emptyMonth": "No fixed bills this month",
  "noOccurrences": "No bills registered",
  "form": {
    "createTitle": "New fixed bill",
    "editTitle": "Edit fixed bill",
    "name": "Bill name",
    "namePlaceholder": "e.g. Rent, Netflix, Water",
    "amount": "Estimated amount (R$)",
    "category": "Category (optional)",
    "categoryNone": "None",
    "recurrence": "Recurrence",
    "monthly": "Monthly",
    "annual": "Annual",
    "dueDay": "Day of month",
    "dueMonth": "Due month",
    "keywords": "Auto-match keywords",
    "keywordsHint": "Use words that appear in your bank statement (OFX) description.",
    "keywordsPlaceholder": "Add keyword",
    "nameRequired": "Name is required",
    "amountRequired": "Enter a positive amount",
    "dueDayInvalid": "Invalid day (use 1–31)",
    "keywordsRequired": "Add at least one keyword"
  },
  "recurrenceLabel": {
    "MONTHLY": "/mo",
    "ANNUAL": "/yr"
  },
  "dueLabel": {
    "monthly": "Due every day {day}",
    "annual": "Due in {month}, day {day}"
  },
  "months": {
    "1": "January",
    "2": "February",
    "3": "March",
    "4": "April",
    "5": "May",
    "6": "June",
    "7": "July",
    "8": "August",
    "9": "September",
    "10": "October",
    "11": "November",
    "12": "December"
  },
  "summary": {
    "estimated": "Estimated",
    "paid": "Paid",
    "pending": "Pending",
    "progress": "{pct}% paid"
  },
  "groupHeaders": {
    "OVERDUE": "Overdue",
    "PENDING": "Pending",
    "PAID": "Paid"
  },
  "occurrence": {
    "dueDateLabel": "Due on {date}",
    "overdueDateLabel": "Was due on {date}",
    "paidDateLabel": "Paid on {date}",
    "paidWithEstimated": "{paid} paid (est. {estimated})",
    "autoMatched": "Auto-imported",
    "payButton": "Pay",
    "undoButton": "Undo"
  },
  "payment": {
    "markTitle": "Mark as paid",
    "revertTitle": "Undo payment",
    "paidAmount": "Amount paid (R$)",
    "revertConfirm": "Are you sure you want to mark \"{name}\" as unpaid in {period}?",
    "confirm": "Confirm payment",
    "undo": "Undo"
  },
  "delete": {
    "title": "Delete fixed bill",
    "confirm": "Delete \"{name}\"? Previous payment records will be kept, but future bills will be removed.",
    "button": "Delete"
  },
  "toast": {
    "created": "Bill created successfully",
    "updated": "Bill updated",
    "deleted": "Bill deleted",
    "markedPaid": "Marked as paid",
    "markedPending": "Marked as pending"
  },
  "dashboard": {
    "title": "Fixed Bills — {month} {year}",
    "viewAll": "View all bills"
  }
}
```

- [ ] **Add `nav.fixedBills` to `messages/pt-br/common.json`**

In the `"nav"` object, after the `"importOFX"` key, add:
```json
"fixedBills": "Contas Fixas",
```

- [ ] **Add `nav.fixedBills` to `messages/en/common.json`**

In the `"nav"` object, after the `"importOFX"` key, add:
```json
"fixedBills": "Fixed Bills",
```

- [ ] **Commit**

```bash
git add messages/en/fixed-bills.json messages/pt-br/common.json messages/en/common.json
git commit -m "feat: add fixed-bills en translations and nav keys"
```

---

## Task 4: FixedBillCard component

**Files:**
- Create: `app/[locale]/(protected)/fixed-bills/components/FixedBillCard.tsx`

- [ ] **Create the card component**

```typescript
'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslations, useLocale } from 'next-intl';
import type { FixedBill } from '../../../../lib/fixed-bills';

interface FixedBillCardProps {
  bill: FixedBill;
  onEdit: (bill: FixedBill) => void;
  onDelete: (bill: FixedBill) => void;
}

export default function FixedBillCard({ bill, onEdit, onDelete }: FixedBillCardProps) {
  const t = useTranslations('fixed-bills');
  const tc = useTranslations('common');
  const locale = useLocale();
  const loc = locale === 'pt-br' ? 'pt-BR' : 'en-US';

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleEdit = () => {
    handleMenuClose();
    onEdit(bill);
  };
  const handleDelete = () => {
    handleMenuClose();
    onDelete(bill);
  };

  const formattedAmount = bill.amount.toLocaleString(loc, {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const recurrenceLabel = t(`recurrenceLabel.${bill.recurrence}`);

  const dueLabelKey = bill.recurrence === 'MONTHLY' ? 'dueLabel.monthly' : 'dueLabel.annual';
  const dueLabel =
    bill.recurrence === 'MONTHLY'
      ? t('dueLabel.monthly', { day: bill.dueDay })
      : t('dueLabel.annual', {
          month: t(`months.${bill.dueMonth as 1}`),
          day: bill.dueDay,
        });

  const annualMonthlyEquiv =
    bill.recurrence === 'ANNUAL'
      ? (bill.amount / 12).toLocaleString(loc, {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : null;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                flexShrink: 0,
                bgcolor: bill.categoryColor ?? 'text.disabled',
                border: '1.5px solid',
                borderColor: 'divider',
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {bill.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {dueLabel}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Stack alignItems="flex-end">
              <Typography
                variant="body2"
                sx={{ fontFamily: 'var(--font-dm-mono), monospace', fontWeight: 600 }}
              >
                {formattedAmount}
                <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.25 }}>
                  {recurrenceLabel}
                </Typography>
              </Typography>
              {annualMonthlyEquiv && (
                <Tooltip title={t('tooltipAnnual')} placement="top">
                  <Typography variant="caption" sx={{ color: 'text.disabled', cursor: 'help' }}>
                    ≈ {annualMonthlyEquiv}/mês
                  </Typography>
                </Tooltip>
              )}
            </Stack>
            <IconButton size="small" onClick={handleMenuOpen} aria-label="options">
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>

      <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>{tc('actions.edit')}</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          {tc('actions.delete')}
        </MenuItem>
      </Menu>
    </Card>
  );
}
```

- [ ] **Commit**

```bash
git add "app/[locale]/(protected)/fixed-bills/components/FixedBillCard.tsx"
git commit -m "feat: add FixedBillCard component"
```

---

## Task 5: FixedBillFormDialog component

**Files:**
- Create: `app/[locale]/(protected)/fixed-bills/components/FixedBillFormDialog.tsx`

- [ ] **Create the create/edit dialog**

```typescript
'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { getCategories, type Category } from '../../../../lib/categories';
import {
  createFixedBill,
  updateFixedBill,
  type FixedBill,
  type Recurrence,
} from '../../../../lib/fixed-bills';
import { useToast } from '../../../../components/ToastProvider';

interface FixedBillFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingBill?: FixedBill | null;
}

export default function FixedBillFormDialog({
  open,
  onClose,
  onSaved,
  editingBill,
}: FixedBillFormDialogProps) {
  const t = useTranslations('fixed-bills');
  const tc = useTranslations('common');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { showToast } = useToast();

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [name, setName] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [categoryId, setCategoryId] = React.useState<string>('');
  const [recurrence, setRecurrence] = React.useState<Recurrence>('MONTHLY');
  const [dueDay, setDueDay] = React.useState('');
  const [dueMonth, setDueMonth] = React.useState<string>('');
  const [keywords, setKeywords] = React.useState<string[]>([]);
  const [keywordInput, setKeywordInput] = React.useState('');

  const [nameError, setNameError] = React.useState('');
  const [amountError, setAmountError] = React.useState('');
  const [dueDayError, setDueDayError] = React.useState('');
  const [keywordsError, setKeywordsError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    getCategories().then(setCategories).catch(() => {});
    if (editingBill) {
      setName(editingBill.name);
      setAmount(String(editingBill.amount));
      setCategoryId(editingBill.categoryId ?? '');
      setRecurrence(editingBill.recurrence);
      setDueDay(String(editingBill.dueDay));
      setDueMonth(editingBill.dueMonth ? String(editingBill.dueMonth) : '');
      setKeywords(editingBill.matchKeywords);
    } else {
      setName('');
      setAmount('');
      setCategoryId('');
      setRecurrence('MONTHLY');
      setDueDay('');
      setDueMonth('');
      setKeywords([]);
    }
    setKeywordInput('');
    setNameError('');
    setAmountError('');
    setDueDayError('');
    setKeywordsError('');
  }, [open, editingBill]);

  const addKeyword = () => {
    const kw = keywordInput.trim().toUpperCase();
    if (kw && !keywords.includes(kw)) {
      setKeywords((prev) => [...prev, kw]);
      if (keywordsError) setKeywordsError('');
    }
    setKeywordInput('');
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword();
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  };

  const validate = (): boolean => {
    let valid = true;
    if (!name.trim()) {
      setNameError(t('form.nameRequired'));
      valid = false;
    } else {
      setNameError('');
    }
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError(t('form.amountRequired'));
      valid = false;
    } else {
      setAmountError('');
    }
    const parsedDay = parseInt(dueDay, 10);
    if (!dueDay || isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) {
      setDueDayError(t('form.dueDayInvalid'));
      valid = false;
    } else {
      setDueDayError('');
    }
    if (keywords.length === 0) {
      setKeywordsError(t('form.keywordsRequired'));
      valid = false;
    } else {
      setKeywordsError('');
    }
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        amount: parseFloat(amount),
        categoryId: categoryId || null,
        recurrence,
        dueDay: parseInt(dueDay, 10),
        dueMonth: recurrence === 'ANNUAL' && dueMonth ? parseInt(dueMonth, 10) : null,
        matchKeywords: keywords,
      };
      if (editingBill) {
        await updateFixedBill(editingBill.id, payload);
        showToast({ message: t('toast.updated') });
      } else {
        await createFixedBill(payload);
        showToast({ message: t('toast.created') });
      }
      onSaved();
      onClose();
    } catch {
      // interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingBill ? t('form.editTitle') : t('form.createTitle')}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label={t('form.name')}
            placeholder={t('form.namePlaceholder')}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.trim()) setNameError('');
            }}
            error={!!nameError}
            helperText={nameError || ' '}
            fullWidth
            autoFocus
          />

          <TextField
            label={t('form.amount')}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v > 0) setAmountError('');
            }}
            error={!!amountError}
            helperText={amountError || ' '}
            fullWidth
            type="number"
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
          />

          <FormControl fullWidth>
            <InputLabel id="fb-category-label">{t('form.category')}</InputLabel>
            <Select
              labelId="fb-category-label"
              value={categoryId}
              onChange={(e: SelectChangeEvent) => setCategoryId(e.target.value)}
              label={t('form.category')}
            >
              <MenuItem value="">
                <em>{t('form.categoryNone')}</em>
              </MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: c.color,
                        flexShrink: 0,
                      }}
                    />
                    <span>{c.name}</span>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{' '}</FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>{t('form.recurrence')}</FormLabel>
            <RadioGroup
              row
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as Recurrence)}
            >
              <FormControlLabel value="MONTHLY" control={<Radio />} label={t('form.monthly')} />
              <FormControlLabel value="ANNUAL" control={<Radio />} label={t('form.annual')} />
            </RadioGroup>
          </FormControl>

          <Stack direction="row" spacing={2}>
            <TextField
              label={t('form.dueDay')}
              value={dueDay}
              onChange={(e) => {
                setDueDay(e.target.value);
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 1 && v <= 31) setDueDayError('');
              }}
              error={!!dueDayError}
              helperText={dueDayError || ' '}
              type="number"
              slotProps={{ htmlInput: { min: 1, max: 31 } }}
              sx={{ flex: 1 }}
            />
            {recurrence === 'ANNUAL' && (
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="fb-due-month-label">{t('form.dueMonth')}</InputLabel>
                <Select
                  labelId="fb-due-month-label"
                  value={dueMonth}
                  onChange={(e: SelectChangeEvent) => setDueMonth(e.target.value)}
                  label={t('form.dueMonth')}
                >
                  {monthOptions.map((m) => (
                    <MenuItem key={m} value={String(m)}>
                      {t(`months.${m as 1}`)}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{' '}</FormHelperText>
              </FormControl>
            )}
          </Stack>

          <Box>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
              {t('form.keywords')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              {t('form.keywordsHint')}
            </Typography>
            {keywords.length > 0 && (
              <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 1 }}>
                {keywords.map((kw) => (
                  <Chip key={kw} label={kw} size="small" onDelete={() => removeKeyword(kw)} />
                ))}
              </Stack>
            )}
            <TextField
              placeholder={t('form.keywordsPlaceholder')}
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeywordKeyDown}
              onBlur={addKeyword}
              error={!!keywordsError}
              helperText={keywordsError || ' '}
              fullWidth
              size="small"
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          {tc('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {tc('actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

- [ ] **Commit**

```bash
git add "app/[locale]/(protected)/fixed-bills/components/FixedBillFormDialog.tsx"
git commit -m "feat: add FixedBillFormDialog component"
```

---

## Task 6: DeleteBillDialog component

**Files:**
- Create: `app/[locale]/(protected)/fixed-bills/components/DeleteBillDialog.tsx`

- [ ] **Create the delete confirmation dialog**

```typescript
'use client';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslations } from 'next-intl';

interface DeleteBillDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
  billName: string;
}

export default function DeleteBillDialog({
  open,
  onClose,
  onConfirm,
  loading,
  billName,
}: DeleteBillDialogProps) {
  const t = useTranslations('fixed-bills');
  const tc = useTranslations('common');

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('delete.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('delete.confirm', { name: billName })}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          {tc('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : t('delete.button')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

- [ ] **Commit**

```bash
git add "app/[locale]/(protected)/fixed-bills/components/DeleteBillDialog.tsx"
git commit -m "feat: add DeleteBillDialog component"
```

---

## Task 7: BillsTab component (Tab 0)

**Files:**
- Create: `app/[locale]/(protected)/fixed-bills/components/BillsTab.tsx`

- [ ] **Create Tab 0 — bill list with FAB and dialogs**

```typescript
'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Button from '@mui/material/Button';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import {
  getFixedBills,
  deleteFixedBill,
  type FixedBill,
} from '../../../../lib/fixed-bills';
import { useToast } from '../../../../components/ToastProvider';
import FixedBillCard from './FixedBillCard';
import FixedBillFormDialog from './FixedBillFormDialog';
import DeleteBillDialog from './DeleteBillDialog';

export default function BillsTab() {
  const t = useTranslations('fixed-bills');
  const locale = useLocale();
  const loc = locale === 'pt-br' ? 'pt-BR' : 'en-US';
  const { showToast } = useToast();

  const [bills, setBills] = React.useState<FixedBill[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingBill, setEditingBill] = React.useState<FixedBill | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingBill, setDeletingBill] = React.useState<FixedBill | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const loadBills = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await getFixedBills();
      if (signal?.aborted) return;
      setBills(data);
    } catch (err: unknown) {
      if (signal?.aborted) return;
      if (err instanceof Error && err.name === 'CanceledError') return;
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    loadBills(controller.signal);
    return () => controller.abort();
  }, [loadBills]);

  const handleEdit = React.useCallback((bill: FixedBill) => {
    setEditingBill(bill);
    setFormOpen(true);
  }, []);

  const handleDelete = React.useCallback((bill: FixedBill) => {
    setDeletingBill(bill);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingBill) return;
    setDeleteLoading(true);
    try {
      await deleteFixedBill(deletingBill.id);
      setBills((prev) => prev.filter((b) => b.id !== deletingBill.id));
      setDeleteOpen(false);
      setDeletingBill(null);
      showToast({ message: t('toast.deleted') });
    } catch {
      // interceptor handles error toast
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingBill(null);
  };

  const handleSaved = () => {
    loadBills();
  };

  const totalMonthlyEstimate = React.useMemo(
    () =>
      bills.reduce((sum, b) => {
        return sum + (b.recurrence === 'MONTHLY' ? b.amount : b.amount / 12);
      }, 0),
    [bills],
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', pb: 10 }}>
      {bills.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pt: 8,
            gap: 2,
          }}
        >
          <ReceiptLongIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('emptyState.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
            {t('emptyState.description')}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            {t('emptyState.cta')}
          </Button>
        </Box>
      ) : (
        <>
          <Paper
            variant="outlined"
            sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('totalEstimated')}
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontFamily: 'var(--font-dm-mono), monospace', fontWeight: 700 }}
            >
              {totalMonthlyEstimate.toLocaleString(loc, {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Paper>

          <Stack spacing={1.5}>
            {bills.map((bill, i) => (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3, ease: 'easeOut' }}
              >
                <FixedBillCard bill={bill} onEdit={handleEdit} onDelete={handleDelete} />
              </motion.div>
            ))}
          </Stack>
        </>
      )}

      <Tooltip title={t('addBill')} placement="left">
        <Fab
          color="primary"
          aria-label={t('addBill')}
          onClick={() => setFormOpen(true)}
          sx={{ position: 'fixed', bottom: 32, right: 32 }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      <FixedBillFormDialog
        open={formOpen}
        onClose={handleFormClose}
        onSaved={handleSaved}
        editingBill={editingBill}
      />

      <DeleteBillDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeletingBill(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        billName={deletingBill?.name ?? ''}
      />
    </Box>
  );
}
```

- [ ] **Commit**

```bash
git add "app/[locale]/(protected)/fixed-bills/components/BillsTab.tsx"
git commit -m "feat: add BillsTab (Tab 0) component"
```

---

## Task 8: MonthSummaryCards component

**Files:**
- Create: `app/[locale]/(protected)/fixed-bills/components/MonthSummaryCards.tsx`

- [ ] **Create the 3-card summary + progress bar**

```typescript
'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { useTranslations, useLocale } from 'next-intl';

interface MonthSummaryCardsProps {
  totalEstimated: number;
  totalPaid: number;
  totalPending: number;
}

export default function MonthSummaryCards({
  totalEstimated,
  totalPaid,
  totalPending,
}: MonthSummaryCardsProps) {
  const t = useTranslations('fixed-bills');
  const locale = useLocale();
  const loc = locale === 'pt-br' ? 'pt-BR' : 'en-US';

  const pct = totalEstimated > 0 ? Math.round((totalPaid / totalEstimated) * 100) : 0;

  const fmt = (v: number) =>
    v.toLocaleString(loc, { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const cards = [
    { label: t('summary.estimated'), value: fmt(totalEstimated), color: 'text.primary' },
    { label: t('summary.paid'), value: fmt(totalPaid), color: 'success.main' },
    { label: t('summary.pending'), value: fmt(totalPending), color: 'warning.main' },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {cards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 4 }}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                {card.label}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontWeight: 700,
                  color: card.color,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                }}
              >
                {card.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{ flex: 1, height: 8, borderRadius: 4 }}
          color="success"
        />
        <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', minWidth: 60 }}>
          {t('summary.progress', { pct })}
        </Typography>
      </Box>
    </Box>
  );
}
```

- [ ] **Commit**

```bash
git add "app/[locale]/(protected)/fixed-bills/components/MonthSummaryCards.tsx"
git commit -m "feat: add MonthSummaryCards component"
```

---

## Task 9: PaymentDialog component

**Files:**
- Create: `app/[locale]/(protected)/fixed-bills/components/PaymentDialog.tsx`

- [ ] **Create the mark-paid / revert dialog**

```typescript
'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslations, useLocale } from 'next-intl';
import { updateOccurrence, type FixedBillOccurrence } from '../../../../lib/fixed-bills';
import { useToast } from '../../../../components/ToastProvider';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdated: (updated: FixedBillOccurrence) => void;
  occurrence: FixedBillOccurrence | null;
  mode: 'pay' | 'revert';
}

export default function PaymentDialog({
  open,
  onClose,
  onUpdated,
  occurrence,
  mode,
}: PaymentDialogProps) {
  const t = useTranslations('fixed-bills');
  const tc = useTranslations('common');
  const locale = useLocale();
  const loc = locale === 'pt-br' ? 'pt-BR' : 'en-US';
  const { showToast } = useToast();

  const [paidAmount, setPaidAmount] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && occurrence && mode === 'pay') {
      setPaidAmount(String(occurrence.estimatedAmount));
    }
  }, [open, occurrence, mode]);

  const period = React.useMemo(() => {
    if (!occurrence) return '';
    const d = new Date(occurrence.dueDate);
    return d.toLocaleDateString(loc, { month: 'long', year: 'numeric' });
  }, [occurrence, loc]);

  const handleConfirm = async () => {
    if (!occurrence) return;
    setLoading(true);
    try {
      let updated: FixedBillOccurrence;
      if (mode === 'pay') {
        updated = await updateOccurrence(occurrence.id, {
          status: 'PAID',
          paidAmount: parseFloat(paidAmount),
        });
        showToast({ message: t('toast.markedPaid') });
      } else {
        updated = await updateOccurrence(occurrence.id, { status: 'PENDING' });
        showToast({ message: t('toast.markedPending') });
      }
      onUpdated(updated);
      onClose();
    } catch {
      // interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {mode === 'pay' ? t('payment.markTitle') : t('payment.revertTitle')}
      </DialogTitle>
      <DialogContent>
        {mode === 'pay' ? (
          <>
            {occurrence && (
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                {occurrence.name} — {period}
              </Typography>
            )}
            <TextField
              label={t('payment.paidAmount')}
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              type="number"
              fullWidth
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            />
          </>
        ) : (
          <DialogContentText>
            {occurrence
              ? t('payment.revertConfirm', { name: occurrence.name, period })
              : ''}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          {tc('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          color={mode === 'pay' ? 'primary' : 'warning'}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : mode === 'pay' ? (
            t('payment.confirm')
          ) : (
            t('payment.undo')
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

- [ ] **Commit**

```bash
git add "app/[locale]/(protected)/fixed-bills/components/PaymentDialog.tsx"
git commit -m "feat: add PaymentDialog component"
```

---

## Task 10: OccurrenceCard component

**Files:**
- Create: `app/[locale]/(protected)/fixed-bills/components/OccurrenceCard.tsx`

- [ ] **Create the single occurrence row card**

```typescript
'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinkIcon from '@mui/icons-material/Link';
import { useTranslations, useLocale } from 'next-intl';
import type { FixedBillOccurrence } from '../../../../lib/fixed-bills';

const STATUS_COLORS = {
  OVERDUE: 'error.main',
  PENDING: 'warning.main',
  PAID: 'success.main',
} as const;

interface OccurrenceCardProps {
  occurrence: FixedBillOccurrence;
  onPay: (occurrence: FixedBillOccurrence) => void;
  onRevert: (occurrence: FixedBillOccurrence) => void;
}

export default function OccurrenceCard({ occurrence, onPay, onRevert }: OccurrenceCardProps) {
  const t = useTranslations('fixed-bills');
  const locale = useLocale();
  const loc = locale === 'pt-br' ? 'pt-BR' : 'en-US';

  const dueDate = new Date(occurrence.dueDate);
  const dateStr = dueDate.toLocaleDateString(loc, { day: '2-digit', month: '2-digit' });

  const dateLabel =
    occurrence.status === 'PAID'
      ? t('occurrence.paidDateLabel', { date: dateStr })
      : occurrence.status === 'OVERDUE'
      ? t('occurrence.overdueDateLabel', { date: dateStr })
      : t('occurrence.dueDateLabel', { date: dateStr });

  const fmt = (v: number) =>
    v.toLocaleString(loc, {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const amountLabel =
    occurrence.status === 'PAID' && occurrence.paidAmount !== null
      ? occurrence.paidAmount !== occurrence.estimatedAmount
        ? t('occurrence.paidWithEstimated', {
            paid: fmt(occurrence.paidAmount),
            estimated: fmt(occurrence.estimatedAmount),
          })
        : fmt(occurrence.paidAmount)
      : fmt(occurrence.estimatedAmount);

  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                flexShrink: 0,
                bgcolor: STATUS_COLORS[occurrence.status],
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    textDecoration: occurrence.status === 'PAID' ? 'line-through' : 'none',
                    color: occurrence.status === 'PAID' ? 'text.secondary' : 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {occurrence.name}
                </Typography>
                {occurrence.transactionId && (
                  <Chip
                    icon={<LinkIcon sx={{ fontSize: '0.75rem !important' }} />}
                    label={t('occurrence.autoMatched')}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.65rem', height: 18 }}
                  />
                )}
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {dateLabel}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontWeight: 600,
                color: occurrence.status === 'PAID' ? 'success.main' : 'text.primary',
                textAlign: 'right',
              }}
            >
              {amountLabel}
            </Typography>
            {occurrence.status !== 'PAID' ? (
              <Button size="small" variant="outlined" onClick={() => onPay(occurrence)}>
                {t('occurrence.payButton')}
              </Button>
            ) : (
              <Button size="small" variant="text" color="inherit" onClick={() => onRevert(occurrence)}>
                {t('occurrence.undoButton')}
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Commit**

```bash
git add "app/[locale]/(protected)/fixed-bills/components/OccurrenceCard.tsx"
git commit -m "feat: add OccurrenceCard component"
```

---

## Task 11: OccurrenceList component

**Files:**
- Create: `app/[locale]/(protected)/fixed-bills/components/OccurrenceList.tsx`

- [ ] **Create the grouped occurrence list**

```typescript
'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { FixedBillOccurrence, OccurrenceStatus } from '../../../../lib/fixed-bills';
import OccurrenceCard from './OccurrenceCard';

interface OccurrenceListProps {
  occurrences: FixedBillOccurrence[];
  onPay: (occurrence: FixedBillOccurrence) => void;
  onRevert: (occurrence: FixedBillOccurrence) => void;
}

const GROUP_ORDER: OccurrenceStatus[] = ['OVERDUE', 'PENDING', 'PAID'];

export default function OccurrenceList({ occurrences, onPay, onRevert }: OccurrenceListProps) {
  const t = useTranslations('fixed-bills');

  const grouped = GROUP_ORDER.reduce<Record<OccurrenceStatus, FixedBillOccurrence[]>>(
    (acc, status) => {
      acc[status] = occurrences.filter((o) => o.status === status);
      return acc;
    },
    { OVERDUE: [], PENDING: [], PAID: [] },
  );

  const hasAny = occurrences.length > 0;

  if (!hasAny) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', pt: 4 }}>
        {t('emptyMonth')}
      </Typography>
    );
  }

  let cardIndex = 0;

  return (
    <Stack spacing={3}>
      {GROUP_ORDER.map((status) => {
        const group = grouped[status];
        if (group.length === 0) return null;
        return (
          <Box key={status}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Divider sx={{ flex: 1 }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  fontSize: '0.68rem',
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                }}
              >
                {t(`groupHeaders.${status}`)}
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Stack>
            <Stack spacing={1}>
              {group.map((occ) => {
                const idx = cardIndex++;
                return (
                  <motion.div
                    key={occ.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.25, ease: 'easeOut' }}
                  >
                    <OccurrenceCard occurrence={occ} onPay={onPay} onRevert={onRevert} />
                  </motion.div>
                );
              })}
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
```

- [ ] **Commit**

```bash
git add "app/[locale]/(protected)/fixed-bills/components/OccurrenceList.tsx"
git commit -m "feat: add OccurrenceList component"
```

---

## Task 12: MonthTab component (Tab 1)

**Files:**
- Create: `app/[locale]/(protected)/fixed-bills/components/MonthTab.tsx`

- [ ] **Create Tab 1 — monthly occurrences**

```typescript
'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslations } from 'next-intl';
import MonthYearPicker from '../../../../components/MonthYearPicker';
import {
  getOccurrences,
  type FixedBillOccurrence,
} from '../../../../lib/fixed-bills';
import { useSubscription } from '../../../../lib/subscription-context';
import MonthSummaryCards from './MonthSummaryCards';
import OccurrenceList from './OccurrenceList';
import PaymentDialog from './PaymentDialog';

export default function MonthTab() {
  const t = useTranslations('fixed-bills');
  const { hasSubscription } = useSubscription();
  const now = new Date();
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [year, setYear] = React.useState(now.getFullYear());
  const [occurrences, setOccurrences] = React.useState<FixedBillOccurrence[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [paymentMode, setPaymentMode] = React.useState<'pay' | 'revert'>('pay');
  const [selectedOccurrence, setSelectedOccurrence] = React.useState<FixedBillOccurrence | null>(null);

  const loadOccurrences = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await getOccurrences(month, year);
      if (signal?.aborted) return;
      setOccurrences(data);
    } catch (err: unknown) {
      if (signal?.aborted) return;
      if (err instanceof Error && err.name === 'CanceledError') return;
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [month, year]);

  React.useEffect(() => {
    const controller = new AbortController();
    loadOccurrences(controller.signal);
    return () => controller.abort();
  }, [loadOccurrences]);

  const handlePay = React.useCallback((occ: FixedBillOccurrence) => {
    setSelectedOccurrence(occ);
    setPaymentMode('pay');
    setPaymentOpen(true);
  }, []);

  const handleRevert = React.useCallback((occ: FixedBillOccurrence) => {
    setSelectedOccurrence(occ);
    setPaymentMode('revert');
    setPaymentOpen(true);
  }, []);

  const handleOccurrenceUpdated = (updated: FixedBillOccurrence) => {
    setOccurrences((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const totals = React.useMemo(() => {
    const totalEstimated = occurrences.reduce((s, o) => s + o.estimatedAmount, 0);
    const totalPaid = occurrences
      .filter((o) => o.status === 'PAID')
      .reduce((s, o) => s + (o.paidAmount ?? o.estimatedAmount), 0);
    const totalPending = totalEstimated - totalPaid;
    return { totalEstimated, totalPaid, totalPending };
  }, [occurrences]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 2 }}>
        <MonthYearPicker
          month={month}
          year={year}
          onChange={(m, y) => { setMonth(m); setYear(y); }}
          disabled={!hasSubscription}
        />
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
          <CircularProgress />
        </Box>
      ) : occurrences.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', pt: 4 }}>
          {t('emptyMonth')}
        </Typography>
      ) : (
        <>
          <MonthSummaryCards
            totalEstimated={totals.totalEstimated}
            totalPaid={totals.totalPaid}
            totalPending={totals.totalPending}
          />
          <OccurrenceList
            occurrences={occurrences}
            onPay={handlePay}
            onRevert={handleRevert}
          />
        </>
      )}

      <PaymentDialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onUpdated={handleOccurrenceUpdated}
        occurrence={selectedOccurrence}
        mode={paymentMode}
      />
    </Box>
  );
}
```

- [ ] **Commit**

```bash
git add "app/[locale]/(protected)/fixed-bills/components/MonthTab.tsx"
git commit -m "feat: add MonthTab (Tab 1) component"
```

---

## Task 13: Fixed Bills page

**Files:**
- Create: `app/[locale]/(protected)/fixed-bills/page.tsx`

- [ ] **Create the page with two tabs**

```typescript
'use client';

import * as React from 'react';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import PageHeader from '../../../components/PageHeader';
import BillsTab from './components/BillsTab';
import MonthTab from './components/MonthTab';

export default function FixedBillsPage() {
  const t = useTranslations('fixed-bills');
  const searchParams = useSearchParams();
  const initialTab = Number(searchParams.get('tab') ?? '0');
  const [tab, setTab] = React.useState(initialTab);

  return (
    <Container sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <PageHeader title={t('title')} />
      <Tabs
        value={tab}
        onChange={(_, v: number) => setTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={t('tabBills')} />
        <Tab label={t('tabMonth')} />
      </Tabs>
      <Box sx={{ flex: 1 }}>
        {tab === 0 && <BillsTab />}
        {tab === 1 && <MonthTab />}
      </Box>
    </Container>
  );
}
```

- [ ] **Commit**

```bash
git add "app/[locale]/(protected)/fixed-bills/page.tsx"
git commit -m "feat: add Fixed Bills page with tabs"
```

---

## Task 14: Sidebar nav item

**Files:**
- Modify: `app/[locale]/dashboard/components/DashboardSidebar.tsx`

- [ ] **Add EventRepeatIcon import and nav item**

At the top of `DashboardSidebar.tsx`, add the icon import after the existing icon imports:
```typescript
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
```

- [ ] **Add nav item between Transactions and Import**

Locate the block that renders the `transactions` `DashboardSidebarPageItem` and the `import` item. Insert the fixed-bills item between them:

```typescript
<DashboardSidebarPageItem
  id="fixed-bills"
  title={t('nav.fixedBills')}
  icon={<EventRepeatIcon />}
  href="/fixed-bills"
  selected={pathname.startsWith('/fixed-bills')}
/>
```

The resulting section should look like:
```typescript
<DashboardSidebarPageItem
  id="transactions"
  title={t('nav.transactions')}
  icon={<ReceiptLongIcon />}
  href="/transactions"
  selected={pathname.startsWith('/transactions')}
  tourId="transactions"
/>
<DashboardSidebarPageItem
  id="fixed-bills"
  title={t('nav.fixedBills')}
  icon={<EventRepeatIcon />}
  href="/fixed-bills"
  selected={pathname.startsWith('/fixed-bills')}
/>
<DashboardSidebarPageItem
  id="import"
  title={t('nav.importOFX')}
  icon={<FileUploadIcon />}
  href="/import"
  selected={pathname.startsWith('/import')}
  tourId="import"
/>
```

- [ ] **Commit**

```bash
git add "app/[locale]/dashboard/components/DashboardSidebar.tsx"
git commit -m "feat: add Fixed Bills sidebar nav item"
```

---

## Task 15: FixedBillsWidget dashboard component

**Files:**
- Create: `app/[locale]/dashboard/components/FixedBillsWidget.tsx`

- [ ] **Create the dashboard widget**

```typescript
'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import type { FixedBillsDashboard, OccurrenceStatus } from '../../../lib/fixed-bills';

const STATUS_COLORS: Record<OccurrenceStatus, string> = {
  OVERDUE: 'error.main',
  PENDING: 'warning.main',
  PAID: 'success.main',
};

interface FixedBillsWidgetProps {
  data: FixedBillsDashboard | null;
  loading: boolean;
  month: number;
  year: number;
}

export default function FixedBillsWidget({ data, loading, month, year }: FixedBillsWidgetProps) {
  const t = useTranslations('fixed-bills');
  const locale = useLocale();
  const loc = locale === 'pt-br' ? 'pt-BR' : 'en-US';

  const monthName = new Date(year, month - 1).toLocaleDateString(
    locale === 'pt-br' ? 'pt-BR' : 'en-US',
    { month: 'long' },
  );

  const fmt = (v: number) =>
    v.toLocaleString(loc, {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const pct =
    data && data.totalEstimated > 0
      ? Math.round((data.totalPaid / data.totalEstimated) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
    >
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography
            component="h2"
            variant="caption"
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
              fontSize: '0.68rem',
              mb: 2,
              display: 'block',
            }}
          >
            {t('dashboard.title', { month: monthName.charAt(0).toUpperCase() + monthName.slice(1), year })}
          </Typography>

          {loading || !data ? (
            <LinearProgress sx={{ my: 2 }} />
          ) : (
            <>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                {[
                  { label: t('summary.estimated'), value: fmt(data.totalEstimated) },
                  { label: t('summary.paid'), value: fmt(data.totalPaid) },
                  { label: t('summary.pending'), value: fmt(data.totalPending) },
                ].map((item) => (
                  <Box key={item.label} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'var(--font-dm-mono), monospace', fontWeight: 700 }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{ flex: 1, height: 6, borderRadius: 3 }}
                  color="success"
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 40 }}>
                  {pct}%
                </Typography>
              </Box>

              <Stack spacing={0.75} sx={{ mb: 2 }}>
                {data.pendingOccurrences.slice(0, 3).map((occ) => {
                  const dueDate = new Date(occ.dueDate);
                  const dayStr = dueDate.toLocaleDateString(loc, { day: '2-digit', month: '2-digit' });
                  return (
                    <Stack key={occ.id} direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: STATUS_COLORS[occ.status],
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {occ.name}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {dayStr}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontFamily: 'var(--font-dm-mono), monospace', fontWeight: 600 }}
                        >
                          {fmt(occ.estimatedAmount)}
                        </Typography>
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>

              <Box sx={{ textAlign: 'right' }}>
                <Link
                  href="/fixed-bills?tab=1"
                  style={{ textDecoration: 'none' }}
                >
                  <Stack
                    component="span"
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ justifyContent: 'flex-end', color: 'primary.main', fontSize: '0.8rem' }}
                  >
                    {t('dashboard.viewAll')}
                    <ArrowForwardIcon sx={{ fontSize: '0.9rem' }} />
                  </Stack>
                </Link>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

- [ ] **Commit**

```bash
git add "app/[locale]/dashboard/components/FixedBillsWidget.tsx"
git commit -m "feat: add FixedBillsWidget dashboard component"
```

---

## Task 16: Dashboard page integration

**Files:**
- Modify: `app/[locale]/(protected)/dashboard/page.tsx`

- [ ] **Add import for the widget and service function**

At the top of `dashboard/page.tsx`, add:
```typescript
import FixedBillsWidget from '../../dashboard/components/FixedBillsWidget';
import {
  getFixedBillsDashboard,
  type FixedBillsDashboard,
} from '../../../lib/fixed-bills';
```

- [ ] **Add state variable for fixed bills data**

Inside `DashboardPage`, after the existing state declarations, add:
```typescript
const [fixedBillsDashboard, setFixedBillsDashboard] = React.useState<FixedBillsDashboard | null>(null);
const [loadingFixedBills, setLoadingFixedBills] = React.useState(true);
```

- [ ] **Add the 6th Promise.allSettled slot**

Inside the `loadAll` function, add `getFixedBillsDashboard(currentMonth, currentYear)` as the 6th entry in the `Promise.allSettled` array, and set the loading states before and after:

```typescript
async function loadAll() {
  setLoadingMonth(true);
  setLoadingPayments(true);
  setLoadingCatOut(true);
  setLoadingCatIn(true);
  setLoadingSixMonths(true);
  setLoadingFixedBills(true);  // add this line

  const results = await Promise.allSettled([
    getTransactionsByMonth(currentMonth, currentYear),
    getPaymentMethodsSummary(currentMonth, currentYear),
    getCategoriesSummary(currentMonth, currentYear, 'CASH_OUT'),
    getCategoriesSummary(currentMonth, currentYear, 'CASH_IN'),
    getLastSixMonths(currentMonth, currentYear),
    getFixedBillsDashboard(currentMonth, currentYear),  // add this line
  ]);

  if (controller.signal.aborted) return;

  if (results[0].status === 'fulfilled') setMonthTransactions(results[0].value);
  setLoadingMonth(false);

  if (results[1].status === 'fulfilled') setPaymentMethods(results[1].value);
  setLoadingPayments(false);

  if (results[2].status === 'fulfilled') setCategoriesCashOut(results[2].value);
  setLoadingCatOut(false);

  if (results[3].status === 'fulfilled') setCategoriesCashIn(results[3].value);
  setLoadingCatIn(false);

  if (results[4].status === 'fulfilled') setLastSixMonths(results[4].value);
  setLoadingSixMonths(false);

  // add these two lines:
  if (results[5].status === 'fulfilled') setFixedBillsDashboard(results[5].value);
  setLoadingFixedBills(false);
}
```

- [ ] **Add FixedBillsWidget to the JSX**

After the categories breakdown `Grid` (the last `<Grid container>` in the return), add:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
>
  <FixedBillsWidget
    data={fixedBillsDashboard}
    loading={loadingFixedBills}
    month={currentMonth}
    year={currentYear}
  />
</motion.div>
```

- [ ] **Commit**

```bash
git add "app/[locale]/(protected)/dashboard/page.tsx"
git commit -m "feat: integrate FixedBillsWidget into dashboard"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered by task |
|-----------------|----------------|
| CRUD for FixedBill | Tasks 5, 6, 7, 8 |
| MONTHLY / ANNUAL recurrence in form | Task 5 |
| Tab 0 — bill list with summary bar and FAB | Task 7 |
| Tab 1 — occurrences with month navigator | Task 12 |
| OVERDUE/PENDING/PAID status groups | Tasks 10, 11 |
| MonthSummaryCards + progress bar | Task 8 |
| Manual payment modal (mark paid / revert) | Task 9 |
| Auto-matched chip indicator | Task 10 |
| Dashboard widget with top-3 pending | Task 15 |
| "Ver todas as contas →" deep-link to tab=1 | Task 15 |
| Dashboard integration (6th fetch) | Task 16 |
| Sidebar nav item | Task 14 |
| i18n pt-br + en | Tasks 2, 3 |
| Service module (all 7 API calls) | Task 1 |
| Annual bill monthly equivalent tooltip | Task 4 |
| Empty states (Tab 0 and Tab 1) | Tasks 7, 12 |

**All spec requirements covered.**
