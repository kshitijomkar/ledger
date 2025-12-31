// IndexedDB Schema for Offline-First Ledger
// Stores: transactions, customers, suppliers, reminders locally

const DB_NAME = 'khatabook-pro';
const DB_VERSION = 1;

export interface SyncMetadata {
  sync_status: 'pending' | 'synced' | 'error';
  local_id: string;
  server_id?: string;
  version: number;
  created_locally: boolean;
  last_sync_attempt?: string;
  sync_error?: string;
}

export interface LocalTransaction extends SyncMetadata {
  id: string;
  type: 'payment' | 'receipt';
  party_id: string;
  amount: number;
  date: string; // ISO-8601
  description: string;
  created_at: string;
  updated_at: string;
}

export interface LocalCustomer extends SyncMetadata {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  email?: string;
  outstanding_balance: number;
  created_at: string;
  updated_at: string;
}

export interface LocalSupplier extends SyncMetadata {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  email?: string;
  outstanding_balance: number;
  created_at: string;
  updated_at: string;
}

export interface LocalReminder extends SyncMetadata {
  id: string;
  party_id: string;
  party_type: 'customer' | 'supplier';
  amount: number;
  due_date: string;
  description: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: 'transactions' | 'customers' | 'suppliers' | 'reminders';
  record_id: string;
  data: Record<string, unknown>;
  status: 'pending' | 'synced';
  attempt_count: number;
  last_error?: string;
  created_at: string;
}

export interface SyncState {
  isOnline: boolean;
  lastSyncTime?: string;
  pendingChanges: number;
  syncError?: string;
}

/**
 * Initialize IndexedDB and create object stores
 */
export async function initializeDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Transactions store
      if (!db.objectStoreNames.contains('transactions')) {
        const txnStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txnStore.createIndex('party_id', 'party_id', { unique: false });
        txnStore.createIndex('date', 'date', { unique: false });
        txnStore.createIndex('sync_status', 'sync_status', { unique: false });
      }

      // Customers store
      if (!db.objectStoreNames.contains('customers')) {
        const custStore = db.createObjectStore('customers', { keyPath: 'id' });
        custStore.createIndex('name', 'name', { unique: false });
        custStore.createIndex('sync_status', 'sync_status', { unique: false });
      }

      // Suppliers store
      if (!db.objectStoreNames.contains('suppliers')) {
        const suppStore = db.createObjectStore('suppliers', { keyPath: 'id' });
        suppStore.createIndex('name', 'name', { unique: false });
        suppStore.createIndex('sync_status', 'sync_status', { unique: false });
      }

      // Reminders store
      if (!db.objectStoreNames.contains('reminders')) {
        const remStore = db.createObjectStore('reminders', { keyPath: 'id' });
        remStore.createIndex('party_id', 'party_id', { unique: false });
        remStore.createIndex('due_date', 'due_date', { unique: false });
        remStore.createIndex('sync_status', 'sync_status', { unique: false });
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id' });
      }

      // Metadata store (for storing sync times, etc.)
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    };
  });
}

/**
 * Get database instance
 */
let dbInstance: IDBDatabase | null = null;

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await initializeDB();
  return dbInstance;
}

/**
 * Add or update a record in a store
 */
export async function saveRecord<T extends { id: string }>(
  storeName: string,
  record: T
): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(record);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get a record by ID
 */
export async function getRecord<T>(
  storeName: string,
  id: string
): Promise<T | undefined> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T | undefined);
  });
}

/**
 * Get all records from a store
 */
export async function getAllRecords<T>(storeName: string): Promise<T[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T[]);
  });
}

/**
 * Delete a record by ID
 */
export async function deleteRecord(storeName: string, id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Query records by index
 */
export async function queryByIndex<T>(
  storeName: string,
  indexName: string,
  value: unknown
): Promise<T[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value as IDBValidKey | IDBKeyRange);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T[]);
  });
}

/**
 * Clear all records from a store
 */
export async function clearStore(storeName: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Save metadata (like last sync time)
 */
export async function saveMetadata(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['metadata'], 'readwrite');
    const store = transaction.objectStore('metadata');
    const request = store.put({ key, value });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get metadata
 */
export async function getMetadata(key: string): Promise<unknown> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['metadata'], 'readonly');
    const store = transaction.objectStore('metadata');
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result as { key: string; value: unknown } | undefined;
      resolve(result?.value);
    };
  });
}
