import { useEffect, useState, useCallback } from 'react';
import { getMetadata, saveMetadata } from '@/lib/db';

export interface OfflineSyncState {
  isOnline: boolean;
  lastSyncTime: string | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  pendingChangesCount: number;
  syncError: string | null;
}

const INITIAL_STATE: OfflineSyncState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastSyncTime: null,
  syncStatus: 'idle',
  pendingChangesCount: 0,
  syncError: null,
};

/**
 * Hook to track online/offline status and sync state
 */
export function useOfflineSync() {
  const [syncState, setSyncState] = useState<OfflineSyncState>(INITIAL_STATE);

  // Load initial sync time from database
  useEffect(() => {
    const loadSyncState = async () => {
      try {
        const lastSyncTime = (await getMetadata('lastSyncTime')) as string | null;
        setSyncState((prev) => ({ ...prev, lastSyncTime }));
      } catch (error) {
        console.error('Failed to load sync state:', error);
      }
    };

    loadSyncState();
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setSyncState((prev) => ({
        ...prev,
        isOnline: true,
        syncStatus: 'syncing', // Trigger sync when coming online
      }));
    };

    const handleOffline = () => {
      setSyncState((prev) => ({
        ...prev,
        isOnline: false,
        syncStatus: 'idle',
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateSyncState = useCallback(
    (updates: Partial<OfflineSyncState>) => {
      setSyncState((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const setLastSyncTime = useCallback(async (time: string) => {
    await saveMetadata('lastSyncTime', time);
    setSyncState((prev) => ({ ...prev, lastSyncTime: time }));
  }, []);

  return {
    ...syncState,
    updateSyncState,
    setLastSyncTime,
  };
}
