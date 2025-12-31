/**
 * Android SQLite Database Implementation
 * Uses Capacitor SQLite plugin for native Android support
 * Falls back to IndexedDB for web
 */

import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

let dbInstance: SQLiteDBConnection | null = null;

const initSQLite = async (): Promise<SQLiteDBConnection> => {
  const sqlite = new SQLiteConnection(CapacitorSQLite);
  return await sqlite.createConnection(
    'khatabook_pro',
    false,
    'no-encryption',
    1,
    false
  );
};

export async function getAndroidDB(): Promise<SQLiteDBConnection | null> {
  try {
    if (dbInstance) return dbInstance;
    dbInstance = await initSQLite();
    await dbInstance.open();
    await createTables();
    return dbInstance;
  } catch (error) {
    console.log('SQLite not available, using IndexedDB:', error);
    return null;
  }
}

async function createTables() {
  if (!dbInstance) return;

  const tables = [
    `CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      party_id TEXT,
      amount REAL,
      date TEXT,
      description TEXT,
      sync_status TEXT DEFAULT 'synced',
      created_at TEXT,
      updated_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      email TEXT,
      outstanding_balance REAL DEFAULT 0,
      sync_status TEXT DEFAULT 'synced',
      created_at TEXT,
      updated_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      email TEXT,
      outstanding_balance REAL DEFAULT 0,
      sync_status TEXT DEFAULT 'synced',
      created_at TEXT,
      updated_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      party_id TEXT,
      party_type TEXT,
      amount REAL,
      due_date TEXT,
      description TEXT,
      is_completed BOOLEAN DEFAULT 0,
      sync_status TEXT DEFAULT 'synced',
      created_at TEXT,
      updated_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      action TEXT,
      table_name TEXT,
      record_id TEXT,
      data TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT
    )`,
  ];

  for (const sql of tables) {
    await dbInstance.execute(sql);
  }
}

export async function saveRecordAndroid<T extends { id: string }>(
  table: string,
  record: T
): Promise<void> {
  const db = await getAndroidDB();
  if (!db) return; // Fallback to IndexedDB

  const cols = Object.keys(record).join(',');
  const vals = Object.values(record)
    .map((v) => (typeof v === 'string' ? `'${v}'` : v))
    .join(',');

  await db.execute(
    `INSERT OR REPLACE INTO ${table} (${cols}) VALUES (${vals})`
  );
}

export async function getRecordAndroid<T>(
  table: string,
  id: string
): Promise<T | undefined> {
  const db = await getAndroidDB();
  if (!db) return undefined;

  const result = await db.query(
    `SELECT * FROM ${table} WHERE id = ?`,
    [id]
  );

  return result.values?.[0] as T;
}

export async function getAllRecordsAndroid<T>(table: string): Promise<T[]> {
  const db = await getAndroidDB();
  if (!db) return [];

  const result = await db.query(`SELECT * FROM ${table}`);
  return result.values as T[];
}
