/**
 * Conflict Resolution for Offline-First Sync
 * Handles conflicts when local and server data differ
 */

export interface ConflictData {
  local: Record<string, unknown>;
  server: Record<string, unknown>;
  field: string;
}

export interface ConflictResolution {
  strategy: 'server' | 'local' | 'merged';
  resolved: Record<string, unknown>;
  conflict_fields: string[];
}

/**
 * Timestamp-based conflict resolution (Last-Write-Wins)
 * Server data is considered authoritative if newer
 */
export function resolveByTimestamp(
  local: Record<string, unknown>,
  server: Record<string, unknown>
): ConflictResolution {
  const localTime = new Date((local.updated_at as string) || 0).getTime();
  const serverTime = new Date((server.updated_at as string) || 0).getTime();

  const conflicts: string[] = [];
  const resolved: Record<string, unknown> = { ...server };

  // Check each field for conflicts
  for (const key in local) {
    if (local[key] !== server[key]) {
      conflicts.push(key);
      // Use local if newer, otherwise use server
      if (localTime > serverTime) {
        resolved[key] = local[key];
      }
    }
  }

  return {
    strategy: 'server',
    resolved,
    conflict_fields: conflicts,
  };
}

/**
 * Amount-based smart resolution for ledger entries
 * Critical: Prevent data loss for financial records
 */
export function resolveLedgerAmount(
  local: Record<string, unknown>,
  server: Record<string, unknown>
): ConflictResolution {
  const conflicts: string[] = [];
  const resolved: Record<string, unknown> = { ...server };

  // For transaction amounts, alert user but use server as default
  if (local.amount !== server.amount) {
    conflicts.push('amount');
    // Keep server amount but flag for user review
    console.warn(
      `Amount conflict: local=${local.amount}, server=${server.amount}`
    );
  }

  return {
    strategy: 'server',
    resolved,
    conflict_fields: conflicts,
  };
}

/**
 * User-guided resolution (for critical conflicts)
 */
export function createUserPrompt(conflict: ConflictResolution): {
  title: string;
  message: string;
  options: Array<{ label: string; value: 'server' | 'local' }>;
} {
  const fields = conflict.conflict_fields.join(', ');

  return {
    title: 'Data Conflict',
    message: `Fields changed on both devices: ${fields}. Which version should be saved?`,
    options: [
      { label: 'Keep server version', value: 'server' },
      { label: 'Keep local version', value: 'local' },
    ],
  };
}

/**
 * Apply user choice to conflict
 */
export function applyUserResolution(
  conflict: ConflictResolution,
  choice: 'server' | 'local',
  local: Record<string, unknown>,
  server: Record<string, unknown>
): Record<string, unknown> {
  if (choice === 'local') {
    return { ...server, ...local };
  }
  return conflict.resolved;
}
