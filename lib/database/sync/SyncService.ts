/**
 * Global Sync Service
 * 
 * Centralized service for syncing all registered models with the backend.
 * Supports bidirectional sync, batch operations, and error handling.
 * Uses the centralized API base client for all requests.
 */

import { SyncAdapter, SyncBatchResult, SyncResult, SyncOptions, SyncOperation, SyncStatus } from './types';
import { apiClient, ApiResponse, ApiError } from '../../../api/apibase';

class SyncService {
  private adapters: Map<string, SyncAdapter> = new Map();
  private isSyncing: boolean = false;
  private lastSyncTime: number | null = null;

  /**
   * Register a sync adapter for a model
   */
  registerAdapter(adapter: SyncAdapter): void {
    this.adapters.set(adapter.config.modelName, adapter);
    console.log(`Registered sync adapter for model: ${adapter.config.modelName}`);
  }

  /**
   * Unregister a sync adapter
   */
  unregisterAdapter(modelName: string): void {
    this.adapters.delete(modelName);
  }

  /**
   * Get all registered model names
   */
  getRegisteredModels(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Check if a model is registered
   */
  isModelRegistered(modelName: string): boolean {
    return this.adapters.has(modelName);
  }

  /**
   * Sync a single model
   */
  async syncModel(
    modelName: string,
    options: Partial<SyncOptions> = {}
  ): Promise<SyncBatchResult> {
    const adapter = this.adapters.get(modelName);
    if (!adapter) {
      throw new Error(`Sync adapter not found for model: ${modelName}`);
    }

    const results: SyncResult[] = [];
    const errors: string[] = [];

    try {
      // Push local changes to server
      if (!options.pullOnly) {
        const pushResults = await this.pushChanges(adapter, options);
        results.push(...pushResults);
      }

      // Pull server changes
      if (!options.pushOnly) {
        const pullResults = await this.pullChanges(adapter, options);
        results.push(...pullResults);
      }

      const succeeded = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      return {
        modelName,
        success: failed === 0,
        total: results.length,
        succeeded,
        failed,
        results,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      errors.push(errorMessage);
      return {
        modelName,
        success: false,
        total: results.length,
        succeeded: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length + 1,
        results,
        errors,
      };
    }
  }

  /**
   * Sync all registered models
   */
  async syncAll(options: SyncOptions = {}): Promise<SyncBatchResult[]> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress');
    }

    this.isSyncing = true;
    const modelsToSync = options.models || this.getRegisteredModels();
    const results: SyncBatchResult[] = [];

    try {
      console.log(`Starting full sync for models: ${modelsToSync.join(', ')}`);

      for (const modelName of modelsToSync) {
        if (!this.adapters.has(modelName)) {
          console.warn(`Model ${modelName} not registered, skipping`);
          continue;
        }

        try {
          console.log(`Syncing model: ${modelName}`);
          const result = await this.syncModel(modelName, options);
          results.push(result);

          if (options.onProgress) {
            options.onProgress(modelName, {
              current: results.length,
              total: modelsToSync.length,
            });
          }

          if (!result.success && options.onError) {
            options.onError(modelName, result.errors?.join(', ') || 'Sync failed');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Failed to sync model ${modelName}:`, errorMessage);

          if (options.onError) {
            options.onError(modelName, errorMessage);
          }

          results.push({
            modelName,
            success: false,
            total: 0,
            succeeded: 0,
            failed: 1,
            results: [],
            errors: [errorMessage],
          });
        }
      }

      this.lastSyncTime = Date.now();

      if (options.onComplete) {
        options.onComplete(results);
      }

      console.log('Full sync completed');
      return results;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Push local changes to server
   */
  private async pushChanges(
    adapter: SyncAdapter,
    options: Partial<SyncOptions>
  ): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    const pendingItems = await adapter.getPendingItems();

    if (pendingItems.length === 0) {
      return results;
    }

    const batchSize = adapter.config.batchSize || 10;
    const batches = this.chunkArray(pendingItems, batchSize);

      for (const batch of batches) {
      for (const item of batch) {
        const localIdField = adapter.getLocalIdField?.() || 'id';
        const localId = (item as any)[localIdField];
        const deletedField = adapter.getDeletedField?.() || 'isDeleted';
        const isDeleted = (item as any)[deletedField] === true;

        try {
          // Mark as syncing
          await adapter.updateSyncStatus(localId, SyncStatus.SYNCING);

          // Determine operation type (check if remoteId exists)
          const remoteIdField = adapter.getRemoteIdField?.() || 'remoteId';
          const remoteId = (item as any)[remoteIdField];

          // Handle deletion
          if (isDeleted && remoteId) {
            // Item is deleted and has remote ID - send DELETE request
            const endpoint = `${adapter.config.endpoint}/${remoteId}`;
            const response = await apiClient.delete(endpoint);

            if (response.success) {
              // Deletion synced successfully
              await adapter.updateSyncStatus(localId, SyncStatus.SYNCED);
              results.push({
                success: true,
                localId,
                remoteId,
                operation: SyncOperation.DELETE,
              });
            } else {
              throw new Error(response.message || 'Delete request failed');
            }
          } else if (isDeleted && !remoteId) {
            // Item is deleted but never synced - just mark as synced (no server record to delete)
            await adapter.updateSyncStatus(localId, SyncStatus.SYNCED);
            results.push({
              success: true,
              localId,
              operation: SyncOperation.DELETE,
            });
          } else {
            // Normal create/update flow
            // Transform to server format
            let serverData = adapter.transformToServer(item);
            
            // Special handling for ScopeItem: Convert local propertyId to server property remoteId
            if (adapter.config.modelName === 'scope-item' && (serverData as any).property) {
              try {
                const { getPropertyById } = await import('../repositories/property');
                const localPropertyId = Number((serverData as any).property);
                if (!isNaN(localPropertyId)) {
                  const property = await getPropertyById(localPropertyId);
                  if (property?.remoteId) {
                    (serverData as any).property = property.remoteId;
                  } else {
                    // Property doesn't have remoteId yet, set to undefined (scope item without property)
                    (serverData as any).property = undefined;
                  }
                }
              } catch (error) {
                console.error('Failed to convert property ID for scope item:', error);
                // Continue with original property value
              }
            }

            const operation = remoteId ? SyncOperation.UPDATE : SyncOperation.CREATE;
            const endpoint = remoteId
              ? `${adapter.config.endpoint}/${remoteId}`
              : adapter.config.endpoint;

            // Make API call using apiClient
            let response: ApiResponse;
            if (remoteId) {
              response = await apiClient.put(endpoint, serverData);
            } else {
              response = await apiClient.post(endpoint, serverData);
            }

            if (response.success && response.data) {
              // Transform response and update local record
              const transformed = adapter.transformFromServer(response.data);
              // Extract remote ID from response data
              const responseData = response.data as any;
              const newRemoteId = responseData._id || responseData.id || remoteId;

              await adapter.updateSyncStatus(
                localId,
                SyncStatus.SYNCED,
                newRemoteId,
                transformed
              );

              results.push({
                success: true,
                localId,
                remoteId: newRemoteId,
                data: transformed,
                operation,
              });
            } else {
              throw new Error(response.message || 'Server request failed');
            }
          }
        } catch (error) {
          // Handle ApiError from apiClient
          const errorMessage = error instanceof ApiError
            ? error.message
            : error instanceof Error
            ? error.message
            : 'Unknown error';
          console.error(`Failed to push item ${localId}:`, errorMessage);

          // Mark as failed
          await adapter.updateSyncStatus(localId, SyncStatus.FAILED);

          results.push({
            success: false,
            localId,
            error: errorMessage,
            operation: isDeleted ? SyncOperation.DELETE : SyncOperation.CREATE,
          });
        }
      }
    }

    return results;
  }

  /**
   * Pull changes from server
   */
  private async pullChanges(
    adapter: SyncAdapter,
    options: Partial<SyncOptions>
  ): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    try {
      // Get items from server using apiClient
      const response = await apiClient.get(adapter.config.endpoint);

      if (response.success && response.data) {
        // Handle different response formats
        // Properties endpoint returns { properties: [...], count: ... }
        // Media endpoint returns array directly or single item
        let serverItems: any[];
        if (Array.isArray(response.data)) {
          serverItems = response.data as any[];
        } else if ((response.data as any).properties && Array.isArray((response.data as any).properties)) {
          // Handle properties endpoint format: { properties: [...], count: ... }
          serverItems = (response.data as any).properties as any[];
        } else if ((response.data as any).property) {
          // Handle single property response: { property: {...} }
          serverItems = [(response.data as any).property as any];
        } else {
          // Single item response
          serverItems = [response.data];
        }

        for (const serverItem of serverItems) {
          try {
            const transformed = adapter.transformFromServer(serverItem);
            const remoteId = serverItem._id || serverItem.id;
            const deletedField = adapter.getDeletedField?.() || 'isDeleted';
            const isDeleted = (transformed as any)[deletedField] === true;

            // Check if item exists locally
            const existingItem = await this.findLocalItem(adapter, remoteId);

            if (existingItem) {
              // Update existing
              const localIdField = adapter.getLocalIdField?.() || 'id';
              const localId = (existingItem as any)[localIdField];

              // If server says it's deleted, mark as deleted locally
              if (isDeleted) {
                // Soft delete locally
                await adapter.deleteLocally(localId);
                await adapter.updateSyncStatus(localId, SyncStatus.SYNCED, remoteId);
                results.push({
                  success: true,
                  localId,
                  remoteId,
                  operation: SyncOperation.DELETE,
                });
              } else {
                // Update with server data
                const updated = await adapter.updateFromServer(localId, serverItem);
                if (updated) {
                  await adapter.updateSyncStatus(localId, SyncStatus.SYNCED, remoteId, updated);
                  results.push({
                    success: true,
                    localId,
                    remoteId,
                    data: updated,
                    operation: SyncOperation.UPDATE,
                  });
                }
              }
            } else {
              // Item doesn't exist locally
              if (isDeleted) {
                // Server says it's deleted, but we don't have it locally - skip it
                // (It was already deleted or never existed locally)
                continue;
              } else {
                // Create new
                const created = await adapter.createFromServer(serverItem);
                if (created) {
                  const localIdField = adapter.getLocalIdField?.() || 'id';
                  const localId = (created as any)[localIdField];

                  await adapter.updateSyncStatus(localId, SyncStatus.SYNCED, remoteId, created);
                  results.push({
                    success: true,
                    localId,
                    remoteId,
                    data: created,
                    operation: SyncOperation.CREATE,
                  });
                }
              }
            }
          } catch (error) {
            // Handle ApiError from apiClient
            const errorMessage = error instanceof ApiError
              ? error.message
              : error instanceof Error
              ? error.message
              : 'Unknown error';
            console.error('Failed to process server item:', errorMessage);
            results.push({
              success: false,
              localId: 'unknown',
              error: errorMessage,
              operation: SyncOperation.UPDATE,
            });
          }
        }
      }
    } catch (error) {
      // Handle ApiError from apiClient
      const errorMessage = error instanceof ApiError
        ? error.message
        : error instanceof Error
        ? error.message
        : 'Failed to pull changes';
      console.error(`Failed to pull changes for ${adapter.config.modelName}:`, errorMessage);
      throw error;
    }

    return results;
  }

  /**
   * Find local item by remote ID
   */
  private async findLocalItem(adapter: SyncAdapter, remoteId: string): Promise<any> {
    // Get all items (not just pending) to find by remote ID
    const allItems = await adapter.getItemsToPull();
    const remoteIdField = adapter.getRemoteIdField?.() || 'remoteId';
    return allItems.find((item: any) => item[remoteIdField] === remoteId);
  }


  /**
   * Chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get sync status
   */
  getSyncStatus(): { isSyncing: boolean; lastSyncTime: number | null } {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
    };
  }
}

// Export singleton instance
export const syncService = new SyncService();

