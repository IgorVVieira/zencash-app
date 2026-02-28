import api from './api';

export interface UserSubscription {
  id: string;
  userId: string;
  productName: string;
  productDescription: string;
  durationInDays: number;
  price: number;
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'CANCELED';
  startAt: string;
  endAt: string;
}

export async function getSubscriptions(): Promise<UserSubscription[]> {
  const response = await api.get<UserSubscription[]>('/api/subscriptions');
  return response.data;
}

export async function getActiveSubscription(): Promise<boolean> {
  await api.get('/api/subscriptions/active', { _skipGlobalToast: true } as never);
  return true;
}
