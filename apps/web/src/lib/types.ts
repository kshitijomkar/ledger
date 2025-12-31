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
  phone: string;
  email?: string;
  address?: string;
  party_type: 'customer' | 'supplier';
  balance: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  party_id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  date: string;
  category?: string;
  running_balance: number;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  party_id: string;
  amount: number;
  due_date: string;
  message: string;
  status: 'pending' | 'completed' | 'overdue';
  created_at: string;
}
