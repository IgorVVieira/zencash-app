import api from './api';

export type Recurrence = 'MONTHLY' | 'ANNUAL';
export type OccurrenceStatus = 'PENDING' | 'PAID' | 'OVERDUE';
export type SettableOccurrenceStatus = Exclude<OccurrenceStatus, 'OVERDUE'>;

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
  status: SettableOccurrenceStatus;
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
