/**
 * Enhanced API Client with Offline Support
 * Falls back to local database when offline
 */

import { getAPI } from './api';
import { getAllRecords, saveRecord } from './db';
import { SyncService } from './syncService';

export async function fetchWithOfflineFallback<T>(
  endpoint: string,
  table: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: Record<string, unknown>;
  }
): Promise<T> {
  const api = getAPI();
  const isOnline = navigator.onLine;

  try {
    if (options?.method === 'GET') {
      // GET: Try server first, fallback to local
      try {
        const response = await api.get(endpoint);
        // Save to local DB for offline access
        if (Array.isArray(response.data)) {
          for (const record of response.data) {
            await saveRecord(table, {
              ...record,
              sync_status: 'synced',
            });
          }
        }
        return response.data as T;
      } catch (error) {
        if (!isOnline) {
          // Offline: Use local data
          const local = await getAllRecords(table);
          return local as T;
        }
        throw error;
      }
    } else {
      // POST/PUT/DELETE: Queue for sync when offline
      if (!isOnline) {
        const recordId = (options?.data?.id as string) || `local-${Date.now()}`;
        await SyncService.addToQueue(
          (options?.method?.toLowerCase() as 'create' | 'update' | 'delete') ||
            'create',
          table as any,
          recordId,
          options?.data || {}
        );
        return { success: true, queued: true } as T;
      }

      // Online: Send immediately and update local
      const response = await api({
        method: options?.method || 'POST',
        url: endpoint,
        data: options?.data,
      });

      // Save to local DB
      if (response.data) {
        await saveRecord(table, {
          ...response.data,
          sync_status: 'synced',
        });
      }

      return response.data as T;
    }
  } catch (error) {
    console.error(`API error on ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Create transaction with offline support
 */
export async function createTransactionOffline(data: Record<string, unknown>) {
  return fetchWithOfflineFallback('/transactions', 'transactions', {
    method: 'POST',
    data,
  });
}

/**
 * Get transactions with offline support
 */
export async function getTransactionsOffline() {
  return fetchWithOfflineFallback('/transactions', 'transactions', {
    method: 'GET',
  });
}

/**
 * Create customer with offline support
 */
export async function createCustomerOffline(data: Record<string, unknown>) {
  return fetchWithOfflineFallback('/customers', 'customers', {
    method: 'POST',
    data,
  });
}

/**
 * Get customers with offline support
 */
export async function getCustomersOffline() {
  return fetchWithOfflineFallback('/customers', 'customers', {
    method: 'GET',
  });
}
