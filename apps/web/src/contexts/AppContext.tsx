'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getAPI, setAuthToken } from '@/lib/api';
import { User } from '@/lib/types';

interface AppContextType {
  user: User | null;
  token: string | null;
  language: string;
  theme: string;
  fontSize: string;
  loading: boolean;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  updateSettings: (settings: Partial<User>) => Promise<void>;
  setLanguage: (lang: string) => void;
  setTheme: (theme: string) => void;
  setFontSize: (size: string) => void;
  getAPI: () => any;
  api: () => any;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  language?: string;
}

// Translations
const translations = {
  en: {
    app_name: 'Khatabook Pro',
    dashboard: 'Dashboard',
    customers: 'Customers',
    suppliers: 'Suppliers',
    transactions: 'Transactions',
    reminders: 'Reminders',
    reports: 'Reports',
    ai_insights: 'AI Insights',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    phone: 'Phone',
    confirm_password: 'Confirm Password',
    forgot_password: 'Forgot Password?',
    dont_have_account: "Don't have an account?",
    already_have_account: 'Already have an account?',
    total_receivable: 'Total Receivable',
    total_payable: 'Total Payable',
    net_balance: 'Net Balance',
    today_credit: "Today's Credit",
    today_debit: "Today's Debit",
    recent_transactions: 'Recent Transactions',
    pending_reminders: 'Pending Reminders',
    overdue: 'Overdue',
    add_customer: 'Add Customer',
    add_supplier: 'Add Supplier',
    edit_party: 'Edit Party',
    delete_party: 'Delete Party',
    party_name: 'Party Name',
    opening_balance: 'Opening Balance',
    balance_type: 'Balance Type',
    credit: 'Credit',
    debit: 'Debit',
    none: 'None',
    search_parties: 'Search by name or phone',
    no_customers: 'No customers found',
    no_suppliers: 'No suppliers found',
    add_transaction: 'Add Transaction',
    amount: 'Amount',
    description: 'Description',
    date: 'Date',
    category: 'Category',
    select_party: 'Select Party',
    transaction_type: 'Transaction Type',
    you_gave: 'You Gave',
    you_got: 'You Got',
    all_transactions: 'All Transactions',
    filter_by_date: 'Filter by Date',
    add_reminder: 'Add Reminder',
    due_date: 'Due Date',
    message: 'Message',
    mark_complete: 'Mark Complete',
    pending: 'Pending',
    completed: 'Completed',
    daily_report: 'Daily Report',
    party_wise: 'Party Wise',
    export_report: 'Export Report',
    get_insights: 'Get AI Insights',
    business_health: 'Business Health',
    recommendations: 'Recommendations',
    ask_ai: 'Ask AI about your business...',
    language: 'Language',
    theme: 'Theme',
    font_size: 'Font Size',
    classic_theme: 'Classic Ledger',
    ocean_theme: 'Ocean Trust',
    midnight_theme: 'Midnight Trader',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    extra_large: 'Extra Large',
    save: 'Save',
    cancel: 'Cancel',
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [language, setLanguageState] = useState('en');
  const [theme, setThemeState] = useState('classic');
  const [fontSize, setFontSizeState] = useState('medium');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedLang = localStorage.getItem('language');
    const storedTheme = localStorage.getItem('theme');
    const storedFontSize = localStorage.getItem('font_size');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setAuthToken(storedToken);
    }
    if (storedLang) setLanguageState(storedLang);
    if (storedTheme) setThemeState(storedTheme);
    if (storedFontSize) setFontSizeState(storedFontSize);
    
    setLoading(false);
  }, []);

  const t = useCallback((key: string) => {
    return (translations as any)[language][key] || key;
  }, [language]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  }, []);

  const login = async (email: string, password: string) => {
    const api = getAPI();
    const response = await api.post('/auth/login', { email, password });
    const { user, token } = response.data;
    
    setUser(user);
    setToken(token);
    setAuthToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  };

  const register = async (data: RegisterData) => {
    const api = getAPI();
    const response = await api.post('/auth/register', data);
    const { user, token } = response.data;
    
    setUser(user);
    setToken(token);
    setAuthToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const updateSettings = async (settings: Partial<User>) => {
    const api = getAPI();
    await api.put('/user/profile', settings);
    const newUser = { ...user!, ...settings };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const setTheme = (theme: string) => {
    setThemeState(theme);
    localStorage.setItem('theme', theme);
  };

  const setFontSize = (size: string) => {
    setFontSizeState(size);
    localStorage.setItem('font_size', size);
  };

  return (
    <AppContext.Provider
      value={ {
        user,
        token,
        language,
        theme,
        fontSize,
        loading,
        t,
        formatCurrency,
        login,
        register,
        logout,
        updateSettings,
        setLanguage,
        setTheme,
        setFontSize,
        getAPI,
        api: getAPI
      } }
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const useAppContext = useApp;
