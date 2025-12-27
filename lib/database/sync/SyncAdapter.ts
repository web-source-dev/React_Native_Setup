/**
 * Base Sync Adapter
 * 
 * Abstract base class for sync adapters.
 * Provides common functionality and ensures consistent interface.
 */

import { SyncAdapter, SyncStatusType, SyncConfig, SyncStatus } from './types';

export abstract class BaseSyncAdapter<T = any> implements SyncAdapter<T> {
  abstract config: SyncConfig;

  // Abstract methods that must be implemented by each model
  abstract getPendingItems(): Promise<T[]>;
  abstract getPendingDeletions(): Promise<T[]>;
  abstract getItemsToPull(lastSyncTimestamp?: number): Promise<T[]>;
  abstract transformToServer(localItem: T): any;
  abstract transformFromServer(serverItem: any): T;
  abstract updateSyncStatus(
    localId: number | string,
    status: SyncStatusType,
    remoteId?: string,
    remoteData?: any
  ): Promise<boolean>;
  abstract createFromServer(serverData: any): Promise<T | null>;
  abstract updateFromServer(localId: number | string, serverData: any): Promise<T | null>;
  abstract deleteLocally(localId: number | string): Promise<boolean>;

  // Default implementations (can be overridden)
  getSyncStatusField(): string {
    return 'syncStatus';
  }

  getLocalIdField(): string {
    return 'id';
  }

  getRemoteIdField(): string {
    return 'remoteId';
  }

  // Helper method to check if item needs sync
  protected needsSync(item: T): boolean {
    const statusField = this.getSyncStatusField();
    const status = (item as any)[statusField];
    return status === SyncStatus.PENDING || status === SyncStatus.FAILED;
  }

  // Helper method to extract local ID
  protected getLocalId(item: T): number | string {
    const idField = this.getLocalIdField();
    return (item as any)[idField];
  }

  // Helper method to extract remote ID
  protected getRemoteId(item: T): string | undefined {
    const remoteIdField = this.getRemoteIdField();
    return (item as any)[remoteIdField];
  }

  // Default implementation for deleted field
  getDeletedField(): string {
    return 'isDeleted';
  }

  // Helper method to check if item is deleted
  protected isDeleted(item: T): boolean {
    const deletedField = this.getDeletedField();
    return (item as any)[deletedField] === true;
  }
}


