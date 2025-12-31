import { getAPI } from './api';
import {
  getAllRecords,
  saveRecord,
  deleteRecord,
  getMetadata,
  saveMetadata,
  SyncQueueItem,
} from './db';

const SYNC_BATCH_SIZE = 10;

/**
 * Sync Service: Handles push/pull of changes between local DB and backend
 */
export class SyncService {
  static async addToQueue(
    action: 'create' | 'update' | 'delete',
    table: 'transactions' | 'customers' | 'suppliers' | 'reminders',
    recordId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: `${Date.now()}-${Math.random()}`,
      action,
      table,
      record_id: recordId,
      data,
      status: 'pending',
      attempt_count: 0,
      created_at: new Date().toISOString(),
    };

    await saveRecord('sync_queue', queueItem);
  }

  /**
   * Get pending changes count
   */
  static async getPendingChangesCount(): Promise<number> {
    const queue = await getAllRecords<SyncQueueItem>('sync_queue');
    return queue.filter((item) => item.status === 'pending').length;
  }

  /**
   * Sync changes to backend (push changes)
   */
  static async syncToBackend(): Promise<{ success: boolean; error?: string }> {
    try {
      const api = getAPI();
      const queue = await getAllRecords<SyncQueueItem>('sync_queue');
      const pending = queue.filter((item) => item.status === 'pending');

      if (pending.length === 0) {
        return { success: true };
      }

      // Batch process changes
      for (let i = 0; i < pending.length; i += SYNC_BATCH_SIZE) {
        const batch = pending.slice(i, i + SYNC_BATCH_SIZE);

        try {
          const response = await api.post('/sync', {
            changes: batch.map((item) => ({
              id: item.id,
              action: item.action,
              table: item.table,
              record_id: item.record_id,
              data: item.data,
            })),
            timestamp: new Date().toISOString(),
          });

          // Mark synced items in queue
          for (const item of batch) {
            await saveRecord<SyncQueueItem>('sync_queue', {
              ...item,
              status: 'synced',
            });
          }

          // Merge server response into local DB
          if (response.data?.updates) {
            await this.mergeServerUpdates(response.data.updates);
          }
        } catch (error) {
          console.error('Sync batch failed:', error);
          // Continue with next batch even if one fails
        }
      }

      // Update last sync time
      await saveMetadata('lastSyncTime', new Date().toISOString());

      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Sync from backend (pull changes)
   */
  static async syncFromBackend(): Promise<{ success: boolean; error?: string }> {
    try {
      const api = getAPI();
      const lastSync = (await getMetadata('lastSyncTime')) as string | null;

      const response = await api.get('/sync-status', {
        params: { since: lastSync || undefined },
      });

      if (response.data?.updates) {
        await this.mergeServerUpdates(response.data.updates);
      }

      await saveMetadata('lastSyncTime', new Date().toISOString());

      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Merge server updates into local database
   */
  private static async mergeServerUpdates(
    updates: Array<{
      table: string;
      action: string;
      record: Record<string, unknown>;
    }>
  ): Promise<void> {
    for (const update of updates) {
      const { table, action, record } = update;

      if (action === 'delete') {
        await deleteRecord(table, record.id as string);
      } else {
        const recordWithSync = {
          ...record,
          sync_status: 'synced',
        } as any;
        await saveRecord(table, recordWithSync);
      }
    }
  }

  /**
   * Full sync: pull from server, then push local changes
   */
  static async fullSync(): Promise<{ success: boolean; error?: string }> {
    try {
      // First pull latest from server
      const pullResult = await this.syncFromBackend();
      if (!pullResult.success) {
        return pullResult;
      }

      // Then push local changes
      const pushResult = await this.syncToBackend();
      return pushResult;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Check if record exists locally, return server version if available
   */
  static async getRecordWithFallback<T>(
    table: string,
    id: string,
    serverFetcher: () => Promise<T>
  ): Promise<T | null> {
    try {
      // Try to get from server first
      return await serverFetcher();
    } catch (error) {
      // Fallback to local if offline
      const local = await getAllRecords<T>(table);
      return (local.find((r) => (r as any).id === id) as T) || null;
    }
  }
}
