import { getDb } from '../config/drizzle';
import {
  rooms,
  components,
  renovationOptions,
  scopeItems,
  scopeItemPhotos,
} from '../schema/scope.schema';
import type {
  Room,
  NewRoom,
  Component,
  NewComponent,
  RenovationOption,
  NewRenovationOption,
  ScopeItem,
  NewScopeItem,
  ScopeItemPhoto,
  NewScopeItemPhoto,
} from '../schema/scope.schema';
import { eq, and, or, desc, sql } from 'drizzle-orm';

// ==================== ROOMS ====================

export const getAllRooms = async (): Promise<Room[]> => {
  try {
    const db = getDb();
    return await db.select().from(rooms).orderBy(rooms.displayOrder, rooms.name);
  } catch (error) {
    console.error('Failed to get all rooms:', error);
    return [];
  }
};

export const getRoomByName = async (name: string): Promise<Room | null> => {
  try {
    const db = getDb();
    const result = await db.select().from(rooms).where(eq(rooms.name, name)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Failed to get room by name:', error);
    return null;
  }
};

export const createRoom = async (roomData: NewRoom): Promise<Room | null> => {
  try {
    const db = getDb();
    const result = await db.insert(rooms).values(roomData).returning();
    return result[0] || null;
  } catch (error) {
    console.error('Failed to create room:', error);
    return null;
  }
};

export const createRoomsBulk = async (roomsData: NewRoom[]): Promise<Room[]> => {
  try {
    const db = getDb();
    const result = await db.insert(rooms).values(roomsData).returning();
    return result;
  } catch (error) {
    console.error('Failed to create rooms in bulk:', error);
    return [];
  }
};

// ==================== COMPONENTS ====================

export const getComponentsByRoom = async (roomName: string): Promise<Component[]> => {
  try {
    const db = getDb();
    return await db
      .select()
      .from(components)
      .where(eq(components.roomName, roomName))
      .orderBy(components.displayOrder, components.area);
  } catch (error) {
    console.error('Failed to get components by room:', error);
    return [];
  }
};

export const createComponent = async (componentData: NewComponent): Promise<Component | null> => {
  try {
    const db = getDb();
    const result = await db.insert(components).values(componentData).returning();
    return result[0] || null;
  } catch (error) {
    console.error('Failed to create component:', error);
    return null;
  }
};

export const createComponentsBulk = async (componentsData: NewComponent[]): Promise<Component[]> => {
  try {
    const db = getDb();
    const result = await db.insert(components).values(componentsData).returning();
    return result;
  } catch (error) {
    console.error('Failed to create components in bulk:', error);
    return [];
  }
};

// ==================== RENOVATION OPTIONS ====================

export const getRenovationOptionsByComponent = async (
  roomName: string,
  componentArea: string
): Promise<RenovationOption[]> => {
  try {
    const db = getDb();
    return await db
      .select()
      .from(renovationOptions)
      .where(and(eq(renovationOptions.roomName, roomName), eq(renovationOptions.componentArea, componentArea)))
      .orderBy(renovationOptions.displayOrder, renovationOptions.optionName);
  } catch (error) {
    console.error('Failed to get renovation options by component:', error);
    return [];
  }
};

export const createRenovationOption = async (
  optionData: NewRenovationOption
): Promise<RenovationOption | null> => {
  try {
    const db = getDb();
    const result = await db.insert(renovationOptions).values(optionData).returning();
    return result[0] || null;
  } catch (error) {
    console.error('Failed to create renovation option:', error);
    return null;
  }
};

export const createRenovationOptionsBulk = async (
  optionsData: NewRenovationOption[]
): Promise<RenovationOption[]> => {
  try {
    const db = getDb();
    const result = await db.insert(renovationOptions).values(optionsData).returning();
    return result;
  } catch (error) {
    console.error('Failed to create renovation options in bulk:', error);
    return [];
  }
};

// ==================== SCOPE ITEMS ====================

export const createScopeItem = async (scopeItemData: NewScopeItem): Promise<ScopeItem | null> => {
  try {
    const db = getDb();
    const result = await db.insert(scopeItems).values(scopeItemData).returning();
    return result[0] || null;
  } catch (error) {
    console.error('Failed to create scope item:', error);
    return null;
  }
};

export const getScopeItemById = async (id: number, includeDeleted: boolean = false): Promise<ScopeItem | null> => {
  try {
    const db = getDb();
    const conditions = includeDeleted
      ? eq(scopeItems.id, id)
      : and(eq(scopeItems.id, id), eq(scopeItems.isDeleted, false));
    const result = await db.select().from(scopeItems).where(conditions).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Failed to get scope item by ID:', error);
    return null;
  }
};

export const getScopeItemsByProperty = async (
  propertyId: number,
  includeDeleted: boolean = false
): Promise<ScopeItem[]> => {
  try {
    const db = getDb();
    const conditions = includeDeleted
      ? eq(scopeItems.propertyId, propertyId)
      : and(eq(scopeItems.propertyId, propertyId), eq(scopeItems.isDeleted, false));
    return await db.select().from(scopeItems).where(conditions).orderBy(scopeItems.roomName, scopeItems.componentArea);
  } catch (error) {
    console.error('Failed to get scope items by property:', error);
    return [];
  }
};

export const getScopeItemsByRoom = async (roomName: string, includeDeleted: boolean = false): Promise<ScopeItem[]> => {
  try {
    const db = getDb();
    const conditions = includeDeleted
      ? eq(scopeItems.roomName, roomName)
      : and(eq(scopeItems.roomName, roomName), eq(scopeItems.isDeleted, false));
    return await db
      .select()
      .from(scopeItems)
      .where(conditions)
      .orderBy(scopeItems.componentArea, scopeItems.createdAt);
  } catch (error) {
    console.error('Failed to get scope items by room:', error);
    return [];
  }
};

export const updateScopeItem = async (
  id: number,
  updates: Partial<NewScopeItem>
): Promise<ScopeItem | null> => {
  try {
    const db = getDb();
    const result = await db
      .update(scopeItems)
      .set({ ...updates, updatedAt: Date.now() })
      .where(eq(scopeItems.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error('Failed to update scope item:', error);
    return null;
  }
};

export const deleteScopeItem = async (id: number): Promise<boolean> => {
  try {
    const db = getDb();
    const result = await db
      .update(scopeItems)
      .set({ isDeleted: true, updatedAt: Date.now() })
      .where(eq(scopeItems.id, id))
      .returning();
    return result.length > 0;
  } catch (error) {
    console.error('Failed to delete scope item:', error);
    return false;
  }
};

export const getScopeItemsGroupedByRoom = async (
  propertyId?: number
): Promise<Record<string, ScopeItem[]>> => {
  try {
    const db = getDb();
    const conditions = propertyId
      ? and(eq(scopeItems.propertyId, propertyId), eq(scopeItems.isDeleted, false))
      : eq(scopeItems.isDeleted, false);
    const items = await db.select().from(scopeItems).where(conditions);
    
    const grouped: Record<string, ScopeItem[]> = {};
    items.forEach((item) => {
      if (!grouped[item.roomName]) {
        grouped[item.roomName] = [];
      }
      grouped[item.roomName].push(item);
    });
    
    return grouped;
  } catch (error) {
    console.error('Failed to get scope items grouped by room:', error);
    return {};
  }
};

export const getFlaggedScopeItems = async (propertyId?: number): Promise<ScopeItem[]> => {
  try {
    const db = getDb();
    const conditions = propertyId
      ? and(
          eq(scopeItems.propertyId, propertyId),
          eq(scopeItems.isDeleted, false),
          or(
            eq(scopeItems.permitLikely, 'Yes'),
            eq(scopeItems.permitLikely, 'Maybe'),
            eq(scopeItems.complexity, 'High')
          )
        )
      : and(
          eq(scopeItems.isDeleted, false),
          or(
            eq(scopeItems.permitLikely, 'Yes'),
            eq(scopeItems.permitLikely, 'Maybe'),
            eq(scopeItems.complexity, 'High')
          )
        );
    return await db.select().from(scopeItems).where(conditions).orderBy(scopeItems.permitLikely, scopeItems.complexity);
  } catch (error) {
    console.error('Failed to get flagged scope items:', error);
    return [];
  }
};

// ==================== SCOPE ITEM PHOTOS ====================

export const addPhotoToScopeItem = async (
  scopeItemId: number,
  mediaFileId: number,
  displayOrder: number = 0
): Promise<ScopeItemPhoto | null> => {
  try {
    const db = getDb();
    const result = await db
      .insert(scopeItemPhotos)
      .values({
        scopeItemId,
        mediaFileId,
        displayOrder,
        createdAt: Date.now(),
      })
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error('Failed to add photo to scope item:', error);
    return null;
  }
};

export const getPhotosByScopeItem = async (scopeItemId: number): Promise<ScopeItemPhoto[]> => {
  try {
    const db = getDb();
    return await db
      .select()
      .from(scopeItemPhotos)
      .where(eq(scopeItemPhotos.scopeItemId, scopeItemId))
      .orderBy(scopeItemPhotos.displayOrder, scopeItemPhotos.createdAt);
  } catch (error) {
    console.error('Failed to get photos by scope item:', error);
    return [];
  }
};

export const removePhotoFromScopeItem = async (photoId: number): Promise<boolean> => {
  try {
    const db = getDb();
    await db.delete(scopeItemPhotos).where(eq(scopeItemPhotos.id, photoId));
    return true;
  } catch (error) {
    console.error('Failed to remove photo from scope item:', error);
    return false;
  }
};

// Re-export types for convenience
export type {
  Room,
  NewRoom,
  Component,
  NewComponent,
  RenovationOption,
  NewRenovationOption,
  ScopeItem,
  NewScopeItem,
  ScopeItemPhoto,
  NewScopeItemPhoto,
} from '../schema/scope.schema';

