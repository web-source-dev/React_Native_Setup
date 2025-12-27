/**
 * Property Sync Adapter
 * 
 * Sync adapter implementation for the Property model.
 * Properties are read-only on mobile - they are only created/updated on the web version.
 * This adapter only pulls properties from the server.
 */

import { BaseSyncAdapter } from '../SyncAdapter';
import { SyncConfig, SyncStatus, SyncStatusType } from '../types';
import {
  getAllPropertiesIncludingDeleted,
  createProperty,
  updateProperty,
} from '../../repositories/property';
import { getDb } from '../../config/drizzle';
import { properties, type Property, type NewProperty } from '../../schema/property.schema';
import { eq } from 'drizzle-orm';

export class PropertySyncAdapter extends BaseSyncAdapter<Property> {
  config: SyncConfig = {
    modelName: 'property',
    endpoint: '/properties',
    batchSize: 50, // Larger batch size for properties
    retryAttempts: 3,
    retryDelay: 1000,
  };

  async getPendingItems(): Promise<Property[]> {
    // Properties are read-only on mobile - no pending items to push
    return [];
  }

  async getPendingDeletions(): Promise<Property[]> {
    // Properties are read-only on mobile - no deletions to push
    return [];
  }

  async getItemsToPull(lastSyncTimestamp?: number): Promise<Property[]> {
    // Get all properties including deleted - used to find existing items by remoteId during pull
    return await getAllPropertiesIncludingDeleted();
  }

  transformToServer(localItem: Property): any {
    // Properties are read-only on mobile - this should never be called
    // But we'll implement it for completeness
    throw new Error('Properties cannot be created or updated from mobile app');
  }

  transformFromServer(serverItem: any): Property {
    // Transform server response to local format
    // Handle populated fields (homeowner, assigned teams, etc.)
    const homeowner = serverItem.homeowner || {};
    const assignedAPS_Reno = serverItem.assignedAPS_Reno || {};
    const assignedAPS_RE = serverItem.assignedAPS_RE || {};
    const assignedExternalAgent = serverItem.assignedExternalAgent || {};
    const assignedAPS_Ops = serverItem.assignedAPS_Ops || {};
    const createdBy = serverItem.createdBy || {};

    // Helper to extract user ID from populated object or string
    const extractUserId = (obj: any, fallback: any): string | null => {
      if (typeof obj === 'string') return obj;
      if (obj && obj._id) return String(obj._id);
      if (obj && obj.id) return String(obj.id);
      if (fallback && typeof fallback === 'string') return fallback;
      if (fallback && fallback._id) return String(fallback._id);
      return null;
    };

    // Helper to convert date to timestamp
    const dateToTimestamp = (date: any): number | null => {
      if (!date) return null;
      const timestamp = typeof date === 'number' ? date : new Date(date).getTime();
      return isNaN(timestamp) ? null : timestamp;
    };

    // Helper to ensure string is not undefined
    const ensureString = (value: any, defaultValue: string): string => {
      if (value === null || value === undefined) return defaultValue;
      return String(value);
    };

    return {
      id: 0, // Will be set by auto-increment on insert
      remoteId: String(serverItem._id || serverItem.id || ''),
      homeownerId: extractUserId(homeowner, serverItem.homeowner),
      address: ensureString(serverItem.address, ''),
      city: ensureString(serverItem.city, ''),
      state: ensureString(serverItem.state, ''),
      zipCode: ensureString(serverItem.zipCode, ''),
      country: ensureString(serverItem.country, 'USA'),
      propertyType: ensureString(serverItem.propertyType, 'Other'),
      bedrooms: serverItem.bedrooms != null ? Number(serverItem.bedrooms) : null,
      bathrooms: serverItem.bathrooms != null ? Number(serverItem.bathrooms) : null,
      squareFootage: serverItem.squareFootage != null ? Number(serverItem.squareFootage) : null,
      yearBuilt: serverItem.yearBuilt != null ? Number(serverItem.yearBuilt) : null,
      lotSize: serverItem.lotSize != null ? Number(serverItem.lotSize) : null,
      assignedAPS_RenoId: extractUserId(assignedAPS_Reno, serverItem.assignedAPS_Reno),
      assignedAPS_REId: extractUserId(assignedAPS_RE, serverItem.assignedAPS_RE),
      assignedExternalAgentId: extractUserId(assignedExternalAgent, serverItem.assignedExternalAgent),
      assignedAPS_OpsId: extractUserId(assignedAPS_Ops, serverItem.assignedAPS_Ops),
      targetStartDate: dateToTimestamp(serverItem.targetStartDate),
      targetListingDate: dateToTimestamp(serverItem.targetListingDate),
      targetBackstopDate: dateToTimestamp(serverItem.targetBackstopDate),
      permitsLikely: Boolean(serverItem.permitsLikely ?? false),
      structuralRisk: Boolean(serverItem.structuralRisk ?? false),
      occupancy: ensureString(serverItem.occupancy, 'Unknown'),
      status: ensureString(serverItem.status, 'new'),
      phase: ensureString(serverItem.phase, 'inquiry'),
      notes: serverItem.notes != null ? String(serverItem.notes) : null,
      goals: serverItem.goals != null ? String(serverItem.goals) : null,
      painPoints: serverItem.painPoints != null ? String(serverItem.painPoints) : null,
      budgetComfort: serverItem.budgetComfort != null ? String(serverItem.budgetComfort) : null,
      leadSource: ensureString(serverItem.leadSource, 'Homeowner'),
      createdById: extractUserId(createdBy, serverItem.createdBy),
      syncStatus: SyncStatus.SYNCED,
      isDeleted: Boolean(serverItem.isDeleted ?? false),
      createdAt: dateToTimestamp(serverItem.createdAt) ?? Date.now(),
      updatedAt: dateToTimestamp(serverItem.updatedAt) ?? Date.now(),
    } as Property;
  }

  async updateSyncStatus(
    localId: number | string,
    status: SyncStatusType,
    remoteId?: string,
    remoteData?: any
  ): Promise<boolean> {
    const updates: any = {
      syncStatus: status,
      updatedAt: Date.now(),
    };
    
    if (remoteId || remoteData?.remoteId) {
      updates.remoteId = remoteId || remoteData?.remoteId;
    }
    
    // If remoteData has isDeleted, update it
    if (remoteData && 'isDeleted' in remoteData) {
      updates.isDeleted = remoteData.isDeleted;
    }
    
    try {
      const db = getDb();
      const result = await db
        .update(properties)
        .set(updates)
        .where(eq(properties.id, Number(localId)))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Failed to update sync status:', error);
      return false;
    }
  }

  async createFromServer(serverData: any): Promise<Property | null> {
    const transformed = this.transformFromServer(serverData);
    // Remove id field for insert (auto-increment will handle it)
    const { id, ...insertData } = transformed;
    return await createProperty(insertData as NewProperty);
  }

  async updateFromServer(localId: number | string, serverData: any): Promise<Property | null> {
    const transformed = this.transformFromServer(serverData);
    // transformed already excludes id field, use it directly for updates
    const updateData = {
      ...transformed,
      updatedAt: Date.now(),
    };
    return await updateProperty(Number(localId), updateData as Partial<NewProperty>);
  }

  async deleteLocally(localId: number | string): Promise<boolean> {
    // Soft delete - mark as deleted and set sync status to synced (we don't push deletions)
    try {
      const db = getDb();
      const result = await db
        .update(properties)
        .set({ 
          isDeleted: true, 
          syncStatus: SyncStatus.SYNCED,
          updatedAt: Date.now()
        })
        .where(eq(properties.id, Number(localId)))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Failed to soft delete property:', error);
      return false;
    }
  }

  getRemoteIdField(): string {
    return 'remoteId';
  }
}

