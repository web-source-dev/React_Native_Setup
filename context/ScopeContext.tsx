/**
 * Scope Context
 * 
 * Provides scope-related state and methods throughout the app
 * Manages rooms, components, renovation options, and scope items
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useDatabaseContext } from '../lib/database/DatabaseProvider';
import {
  getAllRooms,
  getComponentsByRoom,
  getRenovationOptionsByComponent,
  createScopeItem,
  getScopeItemsByProperty,
  getScopeItemsByRoom,
  updateScopeItem,
  deleteScopeItem,
  getScopeItemsGroupedByRoom,
  getFlaggedScopeItems,
  type Room,
  type Component,
  type RenovationOption,
  type ScopeItem,
  type NewScopeItem,
} from '../lib/database/repositories/scope';

interface ScopeContextType {
  // State
  rooms: Room[];
  currentRoom: Room | null;
  components: Component[];
  currentComponent: Component | null;
  renovationOptions: RenovationOption[];
  scopeItems: ScopeItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadRooms: () => Promise<void>;
  selectRoom: (roomName: string) => Promise<void>;
  loadComponents: (roomName: string) => Promise<void>;
  selectComponent: (componentArea: string) => Promise<void>;
  loadRenovationOptions: (roomName: string, componentArea: string) => Promise<void>;
  createScopeItem: (data: Omit<NewScopeItem, 'createdAt' | 'updatedAt'>) => Promise<ScopeItem | null>;
  updateScopeItem: (id: number, updates: Partial<NewScopeItem>) => Promise<boolean>;
  deleteScopeItem: (id: number) => Promise<boolean>;
  loadScopeItems: (propertyId?: number) => Promise<void>;
  loadScopeItemsByRoom: (roomName: string) => Promise<void>;
  getScopeItemsGroupedByRoom: (propertyId?: number) => Promise<Record<string, ScopeItem[]>>;
  getFlaggedScopeItems: (propertyId?: number) => Promise<ScopeItem[]>;
  clearError: () => void;
}

const ScopeContext = createContext<ScopeContextType | undefined>(undefined);

export function ScopeProvider({ children, propertyId }: { children: React.ReactNode; propertyId?: number }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [currentComponent, setCurrentComponent] = useState<Component | null>(null);
  const [renovationOptions, setRenovationOptions] = useState<RenovationOption[]>([]);
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isInitialized: dbInitialized } = useDatabaseContext();

  const loadRooms = useCallback(async () => {
    if (!dbInitialized) {
      console.log('loadRooms: Database not initialized yet');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading rooms from database...');
      const loadedRooms = await getAllRooms();
      console.log(`Loaded ${loadedRooms.length} rooms from database`);
      setRooms(loadedRooms);
      
      // If no rooms found, catalog might not be initialized yet
      if (loadedRooms.length === 0) {
        console.warn('No rooms found in database. Catalog may need to be initialized.');
        // Try to initialize catalog if it hasn't been done
        try {
          const { initializeCatalog } = await import('../lib/database/services/catalogInit.service');
          const result = await initializeCatalog();
          if (result.success && result.roomsLoaded > 0) {
            console.log(`Catalog initialized. Reloading rooms...`);
            const reloadedRooms = await getAllRooms();
            setRooms(reloadedRooms);
            console.log(`Reloaded ${reloadedRooms.length} rooms after catalog init`);
          }
        } catch (initError) {
          console.error('Failed to initialize catalog:', initError);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load rooms';
      setError(errorMessage);
      console.error('Failed to load rooms:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dbInitialized]);

  const loadComponents = useCallback(
    async (roomName: string) => {
      if (!dbInitialized) return;

      try {
        setIsLoading(true);
        setError(null);
        const loadedComponents = await getComponentsByRoom(roomName);
        setComponents(loadedComponents);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load components';
        setError(errorMessage);
        console.error('Failed to load components:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [dbInitialized]
  );

  const selectRoom = useCallback(
    async (roomName: string) => {
      if (!dbInitialized) {
        console.log('selectRoom: Database not initialized yet');
        return;
      }

      try {
        console.log(`Selecting room: "${roomName}"`);
        const room = rooms.find((r) => r.name === roomName);
        if (room) {
          console.log(`Room found: ${room.name} (id: ${room.id})`);
          setCurrentRoom(room);
          setCurrentComponent(null); // Reset selected component when room changes
          // Don't clear components here - let loadComponents handle it
          await loadComponents(roomName);
        } else {
          console.warn(`Room "${roomName}" not found in rooms array. Available rooms:`, rooms.map(r => r.name));
        }
      } catch (err) {
        console.error('Failed to select room:', err);
      }
    },
    [rooms, dbInitialized, loadComponents]
  );

  const selectComponent = useCallback(
    async (componentArea: string) => {
      if (!dbInitialized || !currentRoom) return;

      try {
        const component = components.find((c) => c.area === componentArea);
        if (component) {
          setCurrentComponent(component);
          await loadRenovationOptions(currentRoom.name, componentArea);
        }
      } catch (err) {
        console.error('Failed to select component:', err);
      }
    },
    [components, currentRoom, dbInitialized]
  );

  const loadRenovationOptions = useCallback(
    async (roomName: string, componentArea: string) => {
      if (!dbInitialized) return;

      try {
        setIsLoading(true);
        setError(null);
        const loadedOptions = await getRenovationOptionsByComponent(roomName, componentArea);
        setRenovationOptions(loadedOptions);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load renovation options';
        setError(errorMessage);
        console.error('Failed to load renovation options:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [dbInitialized]
  );

  const createScopeItemLocal = useCallback(
    async (data: Omit<NewScopeItem, 'createdAt' | 'updatedAt'>): Promise<ScopeItem | null> => {
      if (!dbInitialized) return null;

      try {
        const newItem = await createScopeItem({
          ...data,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        if (newItem) {
          setScopeItems((prev) => [...prev, newItem]);
          // Reload scope items if propertyId is set
          if (propertyId) {
            await loadScopeItems(propertyId);
          }
        }

        return newItem;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create scope item';
        setError(errorMessage);
        console.error('Failed to create scope item:', err);
        return null;
      }
    },
    [dbInitialized, propertyId]
  );

  const updateScopeItemLocal = useCallback(
    async (id: number, updates: Partial<NewScopeItem>): Promise<boolean> => {
      if (!dbInitialized) return false;

      try {
        const updated = await updateScopeItem(id, updates);
        if (updated) {
          setScopeItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
          return true;
        }
        return false;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update scope item';
        setError(errorMessage);
        console.error('Failed to update scope item:', err);
        return false;
      }
    },
    [dbInitialized]
  );

  const deleteScopeItemLocal = useCallback(
    async (id: number): Promise<boolean> => {
      if (!dbInitialized) return false;

      try {
        const success = await deleteScopeItem(id);
        if (success) {
          setScopeItems((prev) => prev.filter((item) => item.id !== id));
        }
        return success;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete scope item';
        setError(errorMessage);
        console.error('Failed to delete scope item:', err);
        return false;
      }
    },
    [dbInitialized]
  );

  const loadScopeItems = useCallback(
    async (propId?: number) => {
      if (!dbInitialized) return;

      try {
        setIsLoading(true);
        setError(null);
        const id = propId || propertyId;
        if (id) {
          const items = await getScopeItemsByProperty(id);
          setScopeItems(items);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load scope items';
        setError(errorMessage);
        console.error('Failed to load scope items:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [dbInitialized, propertyId]
  );

  const loadScopeItemsByRoomLocal = useCallback(
    async (roomName: string) => {
      if (!dbInitialized) return;

      try {
        setIsLoading(true);
        setError(null);
        const items = await getScopeItemsByRoom(roomName);
        setScopeItems(items);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load scope items by room';
        setError(errorMessage);
        console.error('Failed to load scope items by room:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [dbInitialized]
  );

  const getScopeItemsGroupedByRoomLocal = useCallback(
    async (propId?: number): Promise<Record<string, ScopeItem[]>> => {
      if (!dbInitialized) return {};

      try {
        const id = propId || propertyId;
        return await getScopeItemsGroupedByRoom(id);
      } catch (err) {
        console.error('Failed to get scope items grouped by room:', err);
        return {};
      }
    },
    [dbInitialized, propertyId]
  );

  const getFlaggedScopeItemsLocal = useCallback(
    async (propId?: number): Promise<ScopeItem[]> => {
      if (!dbInitialized) return [];

      try {
        const id = propId || propertyId;
        return await getFlaggedScopeItems(id);
      } catch (err) {
        console.error('Failed to get flagged scope items:', err);
        return [];
      }
    },
    [dbInitialized, propertyId]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load rooms on mount
  useEffect(() => {
    if (dbInitialized) {
      loadRooms();
    }
  }, [dbInitialized, loadRooms]);

  // Load scope items if propertyId is provided
  useEffect(() => {
    if (dbInitialized && propertyId) {
      loadScopeItems(propertyId);
    }
  }, [dbInitialized, propertyId, loadScopeItems]);

  const value: ScopeContextType = {
    rooms,
    currentRoom,
    components,
    currentComponent,
    renovationOptions,
    scopeItems,
    isLoading,
    error,
    loadRooms,
    selectRoom,
    loadComponents,
    selectComponent,
    loadRenovationOptions,
    createScopeItem: createScopeItemLocal,
    updateScopeItem: updateScopeItemLocal,
    deleteScopeItem: deleteScopeItemLocal,
    loadScopeItems,
    loadScopeItemsByRoom: loadScopeItemsByRoomLocal,
    getScopeItemsGroupedByRoom: getScopeItemsGroupedByRoomLocal,
    getFlaggedScopeItems: getFlaggedScopeItemsLocal,
    clearError,
  };

  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>;
}

/**
 * Hook to use scope context
 */
export function useScopeContext(): ScopeContextType {
  const context = useContext(ScopeContext);
  if (context === undefined) {
    throw new Error('useScopeContext must be used within a ScopeProvider');
  }
  return context;
}

