/**
 * Sync Hook
 * 
 * React hook for using the global sync service in components.
 */

import { useState, useCallback } from 'react';
import { syncService } from '../SyncService';
import { SyncOptions, SyncBatchResult } from '../types';

export interface UseSyncReturn {
  isSyncing: boolean;
  lastSyncTime: number | null;
  syncAll: (options?: SyncOptions) => Promise<SyncBatchResult[]>;
  syncModel: (modelName: string, options?: Partial<SyncOptions>) => Promise<SyncBatchResult>;
  getRegisteredModels: () => string[];
}

export function useSync(): UseSyncReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  const syncAll = useCallback(async (options: SyncOptions = {}): Promise<SyncBatchResult[]> => {
    setIsSyncing(true);
    try {
      const results = await syncService.syncAll({
        ...options,
        onComplete: (results) => {
          setLastSyncTime(Date.now());
          if (options.onComplete) {
            options.onComplete(results);
          }
        },
      });
      return results;
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncModel = useCallback(
    async (modelName: string, options: Partial<SyncOptions> = {}): Promise<SyncBatchResult> => {
      setIsSyncing(true);
      try {
        const result = await syncService.syncModel(modelName, options);
        setLastSyncTime(Date.now());
        return result;
      } catch (error) {
        console.error(`Sync failed for model ${modelName}:`, error);
        throw error;
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  const getRegisteredModels = useCallback(() => {
    return syncService.getRegisteredModels();
  }, []);

  return {
    isSyncing,
    lastSyncTime,
    syncAll,
    syncModel,
    getRegisteredModels,
  };
}


