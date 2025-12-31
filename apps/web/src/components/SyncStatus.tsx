'use client';

import React from 'react';
import { useOffline } from '@/contexts/OfflineContext';
import { Wifi, WifiOff, RotateCw, AlertCircle } from 'lucide-react';

/**
 * Sync Status Indicator Component
 * Shows online/offline status, sync progress, and pending changes
 */
export function SyncStatus() {
  const { isOnline, syncStatus, pendingChangesCount, syncError, retrySync } =
    useOffline();

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500';
    if (syncStatus === 'syncing') return 'text-blue-500';
    if (syncStatus === 'error') return 'text-orange-500';
    return 'text-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (syncStatus === 'syncing') return 'Syncing...';
    if (syncStatus === 'error') return 'Sync Error';
    if (pendingChangesCount > 0) return `${pendingChangesCount} pending`;
    return 'Synced';
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${getStatusColor()} bg-opacity-10`}
    >
      {!isOnline ? (
        <WifiOff className="w-4 h-4" />
      ) : syncStatus === 'syncing' ? (
        <RotateCw className="w-4 h-4 animate-spin" />
      ) : syncStatus === 'error' ? (
        <AlertCircle className="w-4 h-4" />
      ) : (
        <Wifi className="w-4 h-4" />
      )}

      <span>{getStatusText()}</span>

      {syncStatus === 'error' && (
        <button
          onClick={retrySync}
          className="ml-2 underline cursor-pointer hover:opacity-80"
        >
          Retry
        </button>
      )}

      {syncError && (
        <div className="absolute top-full mt-2 bg-red-100 text-red-800 p-2 rounded text-xs">
          {syncError}
        </div>
      )}
    </div>
  );
}

/**
 * Minimal sync status badge (for header)
 */
export function SyncStatusBadge() {
  const { isOnline, syncStatus } = useOffline();

  if (isOnline && syncStatus === 'idle') {
    return null; // No badge when everything is synced
  }

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
      {!isOnline ? (
        <>
          <WifiOff className="w-3 h-3" />
          Offline
        </>
      ) : syncStatus === 'syncing' ? (
        <>
          <RotateCw className="w-3 h-3 animate-spin" />
          Syncing
        </>
      ) : (
        <>
          <AlertCircle className="w-3 h-3" />
          Error
        </>
      )}
    </div>
  );
}
