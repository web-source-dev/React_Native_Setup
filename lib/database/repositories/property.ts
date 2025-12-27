import { getDb } from '../config/drizzle';
import { properties, type Property, type NewProperty } from '../schema/property.schema';
import { eq, and } from 'drizzle-orm';

// CREATE operations (from server sync only)
export const createProperty = async (propertyData: NewProperty): Promise<Property | null> => {
  try {
    const db = getDb();
    const result = await db.insert(properties).values(propertyData).returning();
    return result[0] || null;
  } catch (error) {
    console.error('Failed to create property:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        propertyData: JSON.stringify(propertyData, null, 2),
      });
    }
    return null;
  }
};

// READ operations
export const getPropertyById = async (id: number, includeDeleted: boolean = false): Promise<Property | null> => {
  try {
    const db = getDb();
    const conditions = includeDeleted 
      ? eq(properties.id, id)
      : and(eq(properties.id, id), eq(properties.isDeleted, false));
    const result = await db.select().from(properties).where(conditions).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Failed to get property by ID:', error);
    return null;
  }
};

export const getPropertyByRemoteId = async (remoteId: string, includeDeleted: boolean = false): Promise<Property | null> => {
  try {
    const db = getDb();
    const conditions = includeDeleted
      ? eq(properties.remoteId, remoteId)
      : and(eq(properties.remoteId, remoteId), eq(properties.isDeleted, false));
    const result = await db.select().from(properties).where(conditions).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Failed to get property by remote ID:', error);
    return null;
  }
};

export const getAllProperties = async (includeDeleted: boolean = false): Promise<Property[]> => {
  try {
    const db = getDb();
    if (includeDeleted) {
      return await db.select().from(properties);
    }
    return await db.select().from(properties).where(eq(properties.isDeleted, false));
  } catch (error) {
    console.error('Failed to get all properties:', error);
    // If table doesn't exist, return empty array
    if (error instanceof Error && error.message.includes('no such table')) {
      return [];
    }
    return [];
  }
};

export const getPropertiesByStatus = async (status: string, includeDeleted: boolean = false): Promise<Property[]> => {
  try {
    const db = getDb();
    const conditions = includeDeleted
      ? eq(properties.status, status)
      : and(eq(properties.status, status), eq(properties.isDeleted, false));
    return await db.select().from(properties).where(conditions);
  } catch (error) {
    console.error('Failed to get properties by status:', error);
    return [];
  }
};

export const getPropertiesByPhase = async (phase: string, includeDeleted: boolean = false): Promise<Property[]> => {
  try {
    const db = getDb();
    const conditions = includeDeleted
      ? eq(properties.phase, phase)
      : and(eq(properties.phase, phase), eq(properties.isDeleted, false));
    return await db.select().from(properties).where(conditions);
  } catch (error) {
    console.error('Failed to get properties by phase:', error);
    return [];
  }
};

export const getPropertiesByHomeownerId = async (homeownerId: string, includeDeleted: boolean = false): Promise<Property[]> => {
  try {
    const db = getDb();
    const conditions = includeDeleted
      ? eq(properties.homeownerId, homeownerId)
      : and(eq(properties.homeownerId, homeownerId), eq(properties.isDeleted, false));
    return await db.select().from(properties).where(conditions);
  } catch (error) {
    console.error('Failed to get properties by homeowner ID:', error);
    return [];
  }
};

// Get all items including deleted (for sync purposes)
export const getAllPropertiesIncludingDeleted = async (): Promise<Property[]> => {
  return getAllProperties(true);
};

// UPDATE operations (from server sync only)
export const updateProperty = async (
  id: number,
  updates: Partial<NewProperty>
): Promise<Property | null> => {
  try {
    const db = getDb();
    const result = await db
      .update(properties)
      .set(updates)
      .where(eq(properties.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error('Failed to update property:', error);
    return null;
  }
};

export const updatePropertySyncStatus = async (
  id: number,
  syncStatus: string,
  remoteId?: string
): Promise<boolean> => {
  try {
    const db = getDb();
    const updates: Partial<NewProperty> = { syncStatus };
    if (remoteId) {
      updates.remoteId = remoteId;
    }

    await db
      .update(properties)
      .set(updates)
      .where(eq(properties.id, id));

    return true;
  } catch (error) {
    console.error('Failed to update property sync status:', error);
    return false;
  }
};

// Utility operations
export const getPropertyStats = async () => {
  try {
    const allProperties = await getAllProperties(); // Excludes deleted by default

    const stats = {
      total: allProperties.length,
      byStatus: {} as Record<string, number>,
      byPhase: {} as Record<string, number>,
      byPropertyType: {} as Record<string, number>,
      pendingSync: allProperties.filter(p => p.syncStatus === 'pending').length,
      synced: allProperties.filter(p => p.syncStatus === 'synced').length,
    };

    // Count by status
    allProperties.forEach(p => {
      stats.byStatus[p.status] = (stats.byStatus[p.status] || 0) + 1;
    });

    // Count by phase
    allProperties.forEach(p => {
      stats.byPhase[p.phase] = (stats.byPhase[p.phase] || 0) + 1;
    });

    // Count by property type
    allProperties.forEach(p => {
      if (p.propertyType) {
        stats.byPropertyType[p.propertyType] = (stats.byPropertyType[p.propertyType] || 0) + 1;
      }
    });

    return stats;
  } catch (error) {
    console.error('Failed to get property stats:', error);
    return {
      total: 0,
      byStatus: {},
      byPhase: {},
      byPropertyType: {},
      pendingSync: 0,
      synced: 0,
    };
  }
};

