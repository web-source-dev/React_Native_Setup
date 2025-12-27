/**
 * Scope Item Sync Adapter
 * 
 * Sync adapter implementation for the ScopeItem model.
 * Scope items are created on mobile and synced to the server.
 */

import { BaseSyncAdapter } from '../SyncAdapter';
import { SyncConfig, SyncStatus, SyncStatusType } from '../types';
import {
  getScopeItemsByProperty,
  createScopeItem,
  updateScopeItem,
  deleteScopeItem,
  getScopeItemById,
  type ScopeItem,
  type NewScopeItem,
} from '../../repositories/scope';
import { getDb } from '../../config/drizzle';
import { scopeItems } from '../../schema/scope.schema';
import { eq, and } from 'drizzle-orm';

export class ScopeItemSyncAdapter extends BaseSyncAdapter<ScopeItem> {
  config: SyncConfig = {
    modelName: 'scope-item',
    endpoint: '/scope-items',
    batchSize: 50,
    retryAttempts: 3,
    retryDelay: 1000,
  };

  async getPendingItems(): Promise<ScopeItem[]> {
    try {
      const db = getDb();
      return await db
        .select()
        .from(scopeItems)
        .where(and(eq(scopeItems.syncStatus, SyncStatus.PENDING), eq(scopeItems.isDeleted, false)));
    } catch (error) {
      console.error('Failed to get pending scope items:', error);
      return [];
    }
  }

  async getPendingDeletions(): Promise<ScopeItem[]> {
    try {
      const db = getDb();
      return await db
        .select()
        .from(scopeItems)
        .where(and(eq(scopeItems.isDeleted, true), eq(scopeItems.syncStatus, SyncStatus.PENDING)));
    } catch (error) {
      console.error('Failed to get pending deletions:', error);
      return [];
    }
  }

  async getItemsToPull(lastSyncTimestamp?: number): Promise<ScopeItem[]> {
    try {
      // Get all scope items including deleted for comparison
      const db = getDb();
      return await db.select().from(scopeItems);
    } catch (error) {
      console.error('Failed to get scope items to pull:', error);
      return [];
    }
  }

  transformToServer(localItem: ScopeItem): any {
    // Note: We need to convert local propertyId to server property ID (remoteId)
    // Since transformToServer is synchronous, we'll need to handle the lookup elsewhere
    // For now, return the data structure and we'll enhance pushChanges to handle property lookup
    return {
      // property will be resolved to remoteId in pushChanges
      property: localItem.propertyId ? String(localItem.propertyId) : undefined, // Temporary - will be converted
      roomName: localItem.roomName,
      componentArea: localItem.componentArea,
      optionName: localItem.optionName,
      quantity: localItem.quantity ?? undefined,
      unit: localItem.unit ?? undefined,
      uom: localItem.uom ?? undefined,
      notes: localItem.notes ?? undefined,
      complexity: localItem.complexity,
      permitLikely: localItem.permitLikely,
      primaryTrades: localItem.primaryTrades ?? undefined,
      isSkipped: localItem.isSkipped ?? false,
      isDeleted: localItem.isDeleted ?? false,
    };
  }
  
  // Override to handle property ID conversion before transforming

  transformFromServer(serverItem: any): ScopeItem {
    const dateToTimestamp = (date: any): number | null => {
      if (!date) return null;
      const timestamp = typeof date === 'number' ? date : new Date(date).getTime();
      return isNaN(timestamp) ? null : timestamp;
    };

    return {
      id: 0, // Will be set by auto-increment on insert
      remoteId: String(serverItem._id || serverItem.id || ''),
      propertyId: serverItem.property ? (typeof serverItem.property === 'string' ? Number(serverItem.property) : null) : null,
      roomName: String(serverItem.roomName || ''),
      componentArea: String(serverItem.componentArea || ''),
      optionName: String(serverItem.optionName || ''),
      quantity: serverItem.quantity != null ? Number(serverItem.quantity) : null,
      unit: serverItem.unit != null ? String(serverItem.unit) : null,
      uom: serverItem.uom != null ? String(serverItem.uom) : null,
      notes: serverItem.notes != null ? String(serverItem.notes) : null,
      complexity: String(serverItem.complexity || 'Medium'),
      permitLikely: String(serverItem.permitLikely || 'Maybe'),
      primaryTrades: serverItem.primaryTrades != null ? String(serverItem.primaryTrades) : null,
      isSkipped: Boolean(serverItem.isSkipped ?? false),
      isDeleted: Boolean(serverItem.isDeleted ?? false),
      syncStatus: SyncStatus.SYNCED,
      createdAt: dateToTimestamp(serverItem.createdAt) ?? Date.now(),
      updatedAt: dateToTimestamp(serverItem.updatedAt) ?? Date.now(),
    } as ScopeItem;
  }

  async updateSyncStatus(
    localId: number | string,
    status: SyncStatusType,
    remoteId?: string,
    remoteData?: any
  ): Promise<boolean> {
    try {
      const db = getDb();
      const updates: any = {
        syncStatus: status,
        updatedAt: Date.now(),
      };

      if (remoteId) {
        updates.remoteId = remoteId;
      }

      if (remoteData && 'isDeleted' in remoteData) {
        updates.isDeleted = remoteData.isDeleted;
      }

      const result = await db
        .update(scopeItems)
        .set(updates)
        .where(eq(scopeItems.id, Number(localId)))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Failed to update sync status:', error);
      return false;
    }
  }

  async createFromServer(serverData: any): Promise<ScopeItem | null> {
    const transformed = this.transformFromServer(serverData);
    
    // Convert server property ID to local property ID
    const propertyRemoteId = serverData.property 
      ? (typeof serverData.property === 'string' ? serverData.property : serverData.property._id || serverData.property.id)
      : null;
    
    let localPropertyId: number | null = null;
    if (propertyRemoteId) {
      try {
        const { getPropertyByRemoteId } = await import('../../repositories/property');
        const property = await getPropertyByRemoteId(propertyRemoteId);
        localPropertyId = property?.id || null;
      } catch (error) {
        console.error('Failed to find local property by remoteId:', error);
      }
    }
    
    // Remove id field for insert (auto-increment will handle it)
    const { id, ...insertData } = transformed;
    const finalData = {
      ...insertData,
      propertyId: localPropertyId,
    };
    return await createScopeItem(finalData as NewScopeItem);
  }

  async updateFromServer(localId: number | string, serverData: any): Promise<ScopeItem | null> {
    const transformed = this.transformFromServer(serverData);
    
    // Convert server property ID to local property ID
    const propertyRemoteId = serverData.property 
      ? (typeof serverData.property === 'string' ? serverData.property : serverData.property._id || serverData.property.id)
      : null;
    
    let localPropertyId: number | null = null;
    if (propertyRemoteId) {
      try {
        const { getPropertyByRemoteId } = await import('../../repositories/property');
        const property = await getPropertyByRemoteId(propertyRemoteId);
        localPropertyId = property?.id || null;
      } catch (error) {
        console.error('Failed to find local property by remoteId:', error);
      }
    }
    
    const updateData = {
      ...transformed,
      propertyId: localPropertyId,
      updatedAt: Date.now(),
    };
    // Remove id from updateData
    const { id, ...updateDataWithoutId } = updateData;
    return await updateScopeItem(Number(localId), updateDataWithoutId as Partial<NewScopeItem>);
  }

  async deleteLocally(localId: number | string): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db
        .update(scopeItems)
        .set({
          isDeleted: true,
          syncStatus: SyncStatus.SYNCED,
          updatedAt: Date.now(),
        })
        .where(eq(scopeItems.id, Number(localId)))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Failed to soft delete scope item:', error);
      return false;
    }
  }

  getRemoteIdField(): string {
    return 'remoteId';
  }
}

