/**
 * Global Sync System - Types and Interfaces
 * 
 * This module defines the core types and interfaces for the global sync system
 * that works with any model/schema.
 */

// Sync status types
export const SyncStatus = {
  PENDING: 'pending',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  FAILED: 'failed',
  DELETED: 'deleted', // For soft deleted items that need to sync deletion
} as const;

export type SyncStatusType = typeof SyncStatus[keyof typeof SyncStatus];

// Sync operation types
export const SyncOperation = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export type SyncOperationType = typeof SyncOperation[keyof typeof SyncOperation];

// Sync result for a single item
export interface SyncResult<T = any> {
  success: boolean;
  localId: number | string;
  remoteId?: string;
  data?: T;
  error?: string;
  operation: SyncOperationType;
}

// Sync batch result
export interface SyncBatchResult<T = any> {
  modelName: string;
  success: boolean;
  total: number;
  succeeded: number;
  failed: number;
  results: SyncResult<T>[];
  errors?: string[];
}

// Sync configuration for a model
export interface SyncConfig {
  modelName: string;
  endpoint: string; // API endpoint (e.g., '/media')
  batchSize?: number; // Number of items to sync per batch (default: 10)
  retryAttempts?: number; // Number of retry attempts (default: 3)
  retryDelay?: number; // Delay between retries in ms (default: 1000)
}

// Sync adapter interface - models must implement this
export interface SyncAdapter<T = any> {
  // Model configuration
  config: SyncConfig;

  // Get all pending items for sync (including deletions)
  getPendingItems(): Promise<T[]>;

  // Get deleted items that need to be synced
  getPendingDeletions(): Promise<T[]>;

  // Get items that need to be pulled from server
  getItemsToPull(lastSyncTimestamp?: number): Promise<T[]>;

  // Transform local data to server format
  transformToServer(localItem: T): any;

  // Transform server data to local format
  transformFromServer(serverItem: any): T;

  // Update sync status of an item
  updateSyncStatus(
    localId: number | string,
    status: SyncStatusType,
    remoteId?: string,
    remoteData?: any
  ): Promise<boolean>;

  // Create item locally from server data
  createFromServer(serverData: any): Promise<T | null>;

  // Update item locally from server data
  updateFromServer(localId: number | string, serverData: any): Promise<T | null>;

  // Soft delete item locally
  deleteLocally(localId: number | string): Promise<boolean>;

  // Get deleted field name (default: 'isDeleted')
  getDeletedField?(): string;

  // Get sync status field name (default: 'syncStatus')
  getSyncStatusField?(): string;

  // Get local ID field name (default: 'id')
  getLocalIdField?(): string;

  // Get remote ID field name (default: 'remoteId' or '_id')
  getRemoteIdField?(): string;
}

// Sync manager state
export interface SyncManagerState {
  isSyncing: boolean;
  lastSyncTime: number | null;
  syncErrors: Record<string, string[]>;
  syncProgress: Record<string, { current: number; total: number }>;
}

// Sync options
export interface SyncOptions {
  models?: string[]; // Specific models to sync (if not provided, sync all)
  force?: boolean; // Force sync even if already synced
  pullOnly?: boolean; // Only pull from server
  pushOnly?: boolean; // Only push to server
  onProgress?: (modelName: string, progress: { current: number; total: number }) => void;
  onComplete?: (results: SyncBatchResult[]) => void;
  onError?: (modelName: string, error: string) => void;
}


