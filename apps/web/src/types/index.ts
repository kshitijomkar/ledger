export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  language?: string;
  theme?: string;
  font_size?: string;
  created_at?: string;
}

export interface Party {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  party_type: 'customer' | 'supplier';
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  party_id: string;
  amount: number;
  transaction_type: 'credit' | 'debit';
  description?: string;
  date: string;
  category?: string;
  attachment_url?: string;
  running_balance: number;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  party_id: string;
  amount: number;
  due_date: string;
  message?: string;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}
