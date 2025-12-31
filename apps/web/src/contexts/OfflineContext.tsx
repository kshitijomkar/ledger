'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SyncService } from '@/lib/syncService';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export interface OfflineContextType {
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncTime: string | null;
  pendingChangesCount: number;
  syncError: string | null;
  retrySync: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const syncState = useOfflineSync();
  const [pendingCount, setPendingCount] = useState(0);

  // Load pending changes count
  useEffect(() => {
    const loadPendingCount = async () => {
      const count = await SyncService.getPendingChangesCount();
      setPendingCount(count);
    };
    loadPendingCount();
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (syncState.isOnline && syncState.syncStatus === 'syncing') {
      handleSync();
    }
  }, [syncState.isOnline]);

  const handleSync = useCallback(async () => {
    syncState.updateSyncState({ syncStatus: 'syncing' });
    try {
      const result = await SyncService.fullSync();
      if (result.success) {
        syncState.updateSyncState({ syncStatus: 'idle', syncError: null });
        await syncState.setLastSyncTime(new Date().toISOString());
        const count = await SyncService.getPendingChangesCount();
        setPendingCount(count);
      } else {
        syncState.updateSyncState({
          syncStatus: 'error',
          syncError: result.error || 'Sync failed',
        });
      }
    } catch (error) {
      syncState.updateSyncState({
        syncStatus: 'error',
        syncError: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [syncState]);

  const value: OfflineContextType = {
    isOnline: syncState.isOnline,
    syncStatus: syncState.syncStatus,
    lastSyncTime: syncState.lastSyncTime,
    pendingChangesCount: pendingCount,
    syncError: syncState.syncError,
    retrySync: handleSync,
  };

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
}
