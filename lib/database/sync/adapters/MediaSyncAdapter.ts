/**
 * Media Sync Adapter
 * 
 * Sync adapter implementation for the Media model.
 * This serves as an example of how to implement sync adapters for other models.
 */

import { BaseSyncAdapter } from '../SyncAdapter';
import { SyncConfig, SyncStatus, SyncStatusType } from '../types';
import {
  getPendingSyncMediaFiles,
  getDeletedMediaFilesForSync,
  getAllMediaFilesIncludingDeleted,
  updateMediaSyncStatus,
  createMediaFile,
  updateMediaFile,
  type MediaFile,
  type NewMediaFile,
} from '../../repositories/media';
import { getDb } from '../../config/drizzle';
import { mediaFiles } from '../../schema/media.schema';
import { eq } from 'drizzle-orm';

export class MediaSyncAdapter extends BaseSyncAdapter<MediaFile> {
  config: SyncConfig = {
    modelName: 'media',
    endpoint: '/media',
    batchSize: 10,
    retryAttempts: 3,
    retryDelay: 1000,
  };

  async getPendingItems(): Promise<MediaFile[]> {
    // Get both regular pending items and deleted items
    const pendingItems = await getPendingSyncMediaFiles();
    const deletedItems = await this.getPendingDeletions();
    return [...pendingItems, ...deletedItems];
  }

  async getPendingDeletions(): Promise<MediaFile[]> {
    return await getDeletedMediaFilesForSync();
  }

  async getItemsToPull(lastSyncTimestamp?: number): Promise<MediaFile[]> {
    // Get all items including deleted - used to find existing items by remoteId during pull
    return await getAllMediaFilesIncludingDeleted();
  }

  transformToServer(localItem: MediaFile): any {
    // Transform local media file to server format
    return {
      filename: localItem.filename,
      originalFilename: localItem.originalFilename,
      type: localItem.type,
      mimeType: localItem.mimeType,
      size: localItem.size,
      width: localItem.width,
      height: localItem.height,
      duration: localItem.duration,
      latitude: localItem.latitude,
      longitude: localItem.longitude,
      altitude: localItem.altitude,
      locationAccuracy: localItem.locationAccuracy,
      locationAddress: localItem.locationAddress,
      locationTimestamp: localItem.locationTimestamp,
      userId: localItem.userId,
      isPublic: localItem.isPublic,
      isDeleted: localItem.isDeleted || false, // Include deletion status
      createdAt: localItem.createdAt,
      updatedAt: localItem.updatedAt,
      // Note: localUri is not sent to server, only remoteUrl is stored
    };
  }

  transformFromServer(serverItem: any): MediaFile {
    // Transform server response to local format
    return {
      id: serverItem.id || 0, // Will be set by local DB
      filename: serverItem.filename,
      originalFilename: serverItem.originalFilename || serverItem.filename,
      localUri: '', // Not provided by server
      remoteUrl: serverItem.url || serverItem.remoteUrl || serverItem._id,
      type: serverItem.type,
      mimeType: serverItem.mimeType,
      size: serverItem.size || 0,
      width: serverItem.width,
      height: serverItem.height,
      duration: serverItem.duration,
      latitude: serverItem.latitude,
      longitude: serverItem.longitude,
      altitude: serverItem.altitude,
      locationAccuracy: serverItem.locationAccuracy,
      locationAddress: serverItem.locationAddress,
      locationTimestamp: serverItem.locationTimestamp,
      userId: serverItem.userId,
      isPublic: serverItem.isPublic ?? true,
      isDeleted: serverItem.isDeleted ?? false, // Include deletion status from server
      syncStatus: SyncStatus.SYNCED,
      createdAt: serverItem.createdAt || Date.now(),
      updatedAt: serverItem.updatedAt || Date.now(),
    } as MediaFile;
  }

  async updateSyncStatus(
    localId: number | string,
    status: SyncStatusType,
    remoteId?: string,
    remoteData?: any
  ): Promise<boolean> {
    // Preserve isDeleted status when updating sync status
    // If remoteData is provided and has isDeleted, use it; otherwise preserve existing
    const updates: any = {
      syncStatus: status,
      updatedAt: Date.now(),
    };
    
    if (remoteId || remoteData?.remoteUrl) {
      updates.remoteUrl = remoteId || remoteData?.remoteUrl;
    }
    
    // If remoteData has isDeleted, update it
    if (remoteData && 'isDeleted' in remoteData) {
      updates.isDeleted = remoteData.isDeleted;
    }
    
    try {
      const db = getDb();
      const result = await db
        .update(mediaFiles)
        .set(updates)
        .where(eq(mediaFiles.id, Number(localId)))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Failed to update sync status:', error);
      return false;
    }
  }

  async createFromServer(serverData: any): Promise<MediaFile | null> {
    const transformed = this.transformFromServer(serverData);
    return await createMediaFile(transformed as NewMediaFile);
  }

  async updateFromServer(localId: number | string, serverData: any): Promise<MediaFile | null> {
    const transformed = this.transformFromServer(serverData);
    // Remove id from updates as it's the local ID
    const { id, ...updates } = transformed;
    // Include isDeleted in updates
    const updateData = {
      ...updates,
      isDeleted: transformed.isDeleted || false,
      updatedAt: Date.now(),
    };
    return await updateMediaFile(Number(localId), updateData as Partial<NewMediaFile>);
  }

  async deleteLocally(localId: number | string): Promise<boolean> {
    // Soft delete - mark as deleted and set sync status to pending
    try {
      const db = getDb();
      const result = await db
        .update(mediaFiles)
        .set({ 
          isDeleted: true, 
          syncStatus: SyncStatus.PENDING,
          updatedAt: Date.now()
        })
        .where(eq(mediaFiles.id, Number(localId)))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Failed to soft delete media file:', error);
      return false;
    }
  }

  getRemoteIdField(): string {
    return 'remoteUrl';
  }
}

