export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `https://${process.env.REPLIT_DEV_DOMAIN}/api`;
export const APP_NAME = 'Khatabook Pro';
export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_THEME = 'theme-classic';
export const DEFAULT_FONT_SIZE = 'medium';

export const PUBLIC_ROUTES = ['/login', '/register', '/'];
export const PROTECTED_ROUTES = ['/dashboard', '/customers', '/suppliers', '/transactions', '/reminders', '/reports', '/settings'];

export const THEMES = {
  CLASSIC: 'theme-classic',
  MODERN: 'theme-modern',
  DARK: 'theme-dark',
} as const;

export const FONT_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const;

export const PARTY_TYPES = {
  CUSTOMER: 'customer',
  SUPPLIER: 'supplier',
} as const;

export const TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
} as const;

export const REMINDER_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
} as const;
