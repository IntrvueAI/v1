export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  stripe_session_id: string;
  amount: number;
  currency: string;
  credits_purchased: number;
  status: OrderStatus;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
