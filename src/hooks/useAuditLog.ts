import { useState, useEffect, useCallback } from 'react';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  module: string;
  details: string;
  userId: string;
  previousHash: string;
  hash: string;
}

export type AuditModule = 
  | 'auth'
  | 'books'
  | 'loans'
  | 'participants'
  | 'classes'
  | 'categories'
  | 'materials'
  | 'reading_sessions'
  | 'book_issues'
  | 'inventory'
  | 'config'
  | 'other_readers'
  | 'extra_activities'
  | 'system';

export type AuditAction =
  | 'login'
  | 'login_failed'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'backup'
  | 'restore'
  | 'config_change'
  | 'pin_change'
  | 'loan_create'
  | 'loan_return'
  | 'loan_renew'
  | 'issue_report'
  | 'issue_resolve'
  | 'inventory_start'
  | 'inventory_complete';

const AUDIT_STORAGE_KEY = 'bibliosystem_audit_log';

// Generate a unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// SHA-256 hash using Web Crypto API
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Create hash for an entry (excluding the hash field itself)
async function createEntryHash(entry: Omit<AuditEntry, 'hash'>): Promise<string> {
  const dataToHash = `${entry.id}|${entry.timestamp}|${entry.action}|${entry.module}|${entry.details}|${entry.userId}|${entry.previousHash}`;
  return sha256(dataToHash);
}

// Load audit log from localStorage
function loadAuditLog(): AuditEntry[] {
  try {
    const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load audit log:', e);
  }
  return [];
}

// Save audit log to localStorage
function saveAuditLog(entries: AuditEntry[]) {
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save audit log:', e);
  }
}

export function useAuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>(loadAuditLog);

  useEffect(() => {
    saveAuditLog(entries);
  }, [entries]);

  const logAction = useCallback(async (
    action: AuditAction,
    module: AuditModule,
    details: string,
    userId: string = 'admin'
  ): Promise<void> => {
    const currentEntries = loadAuditLog();
    const previousHash = currentEntries.length > 0 
      ? currentEntries[currentEntries.length - 1].hash 
      : '0000000000000000000000000000000000000000000000000000000000000000';

    const newEntry: Omit<AuditEntry, 'hash'> = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      action,
      module,
      details,
      userId,
      previousHash,
    };

    const hash = await createEntryHash(newEntry);
    const completeEntry: AuditEntry = { ...newEntry, hash };

    const updatedEntries = [...currentEntries, completeEntry];
    setEntries(updatedEntries);
    saveAuditLog(updatedEntries);
  }, []);

  const verifyIntegrity = useCallback(async (): Promise<{
    isValid: boolean;
    invalidIndex: number | null;
    totalEntries: number;
  }> => {
    const currentEntries = loadAuditLog();
    
    if (currentEntries.length === 0) {
      return { isValid: true, invalidIndex: null, totalEntries: 0 };
    }

    for (let i = 0; i < currentEntries.length; i++) {
      const entry = currentEntries[i];
      
      // Verify hash chain
      if (i === 0) {
        if (entry.previousHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
          return { isValid: false, invalidIndex: i, totalEntries: currentEntries.length };
        }
      } else {
        if (entry.previousHash !== currentEntries[i - 1].hash) {
          return { isValid: false, invalidIndex: i, totalEntries: currentEntries.length };
        }
      }

      // Verify entry hash
      const { hash, ...entryWithoutHash } = entry;
      const calculatedHash = await createEntryHash(entryWithoutHash);
      if (calculatedHash !== hash) {
        return { isValid: false, invalidIndex: i, totalEntries: currentEntries.length };
      }
    }

    return { isValid: true, invalidIndex: null, totalEntries: currentEntries.length };
  }, []);

  const getAuditLog = useCallback((
    options?: {
      module?: AuditModule;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): AuditEntry[] => {
    let filtered = loadAuditLog();

    if (options?.module) {
      filtered = filtered.filter(e => e.module === options.module);
    }

    if (options?.startDate) {
      filtered = filtered.filter(e => new Date(e.timestamp) >= options.startDate!);
    }

    if (options?.endDate) {
      filtered = filtered.filter(e => new Date(e.timestamp) <= options.endDate!);
    }

    // Sort by timestamp descending (most recent first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }, []);

  const exportAuditLog = useCallback(async (cdejNumber: string): Promise<void> => {
    const currentEntries = loadAuditLog();
    const integrity = await verifyIntegrity();

    // Calculate overall checksum
    const allHashes = currentEntries.map(e => e.hash).join('');
    const checksum = await sha256(allHashes);

    const exportData = {
      exportedAt: new Date().toISOString(),
      cdejNumber,
      totalEntries: currentEntries.length,
      integrityValid: integrity.isValid,
      checksum,
      firstEntry: currentEntries.length > 0 ? currentEntries[0].timestamp : null,
      lastEntry: currentEntries.length > 0 ? currentEntries[currentEntries.length - 1].timestamp : null,
      entries: currentEntries,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${cdejNumber}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [verifyIntegrity]);

  const getStatistics = useCallback(() => {
    const currentEntries = loadAuditLog();
    
    if (currentEntries.length === 0) {
      return {
        totalEntries: 0,
        firstEntry: null,
        lastEntry: null,
        byModule: {},
        byAction: {},
      };
    }

    const byModule: Record<string, number> = {};
    const byAction: Record<string, number> = {};

    currentEntries.forEach(entry => {
      byModule[entry.module] = (byModule[entry.module] || 0) + 1;
      byAction[entry.action] = (byAction[entry.action] || 0) + 1;
    });

    return {
      totalEntries: currentEntries.length,
      firstEntry: currentEntries[0].timestamp,
      lastEntry: currentEntries[currentEntries.length - 1].timestamp,
      byModule,
      byAction,
    };
  }, []);

  return {
    entries,
    logAction,
    verifyIntegrity,
    getAuditLog,
    exportAuditLog,
    getStatistics,
  };
}

// Singleton instance for use outside React components
let auditLogInstance: {
  logAction: (action: AuditAction, module: AuditModule, details: string, userId?: string) => Promise<void>;
} | null = null;

export async function logAuditAction(
  action: AuditAction,
  module: AuditModule,
  details: string,
  userId: string = 'admin'
): Promise<void> {
  const currentEntries = loadAuditLog();
  const previousHash = currentEntries.length > 0 
    ? currentEntries[currentEntries.length - 1].hash 
    : '0000000000000000000000000000000000000000000000000000000000000000';

  const newEntry: Omit<AuditEntry, 'hash'> = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    action,
    module,
    details,
    userId,
    previousHash,
  };

  const hash = await createEntryHash(newEntry);
  const completeEntry: AuditEntry = { ...newEntry, hash };

  const updatedEntries = [...currentEntries, completeEntry];
  saveAuditLog(updatedEntries);
}
