/**
 * Catalog Initialization Service
 * 
 * Loads and initializes the room-by-room renovation catalog data from JSON files
 * into the database. This should be run once when the app is first installed or
 * when catalog updates are needed.
 */

import {
  getAllRooms,
  createRoomsBulk,
  createComponentsBulk,
  createRenovationOptionsBulk,
} from '../repositories/scope';
import {
  loadRoomsCatalog,
  loadComponentsCatalog,
  loadRenovationOptionsCatalog,
  transformRoomForDb,
  transformComponentForDb,
  transformRenovationOptionForDb,
} from '../utils/catalogLoader';

export interface CatalogInitResult {
  success: boolean;
  roomsLoaded: number;
  componentsLoaded: number;
  optionsLoaded: number;
  error?: string;
}

/**
 * Initialize catalog data (rooms, components, renovation options)
 * This should be called once during app initialization or when catalog needs updating
 */
export async function initializeCatalog(): Promise<CatalogInitResult> {
  try {
    console.log('Starting catalog initialization...');

    // Check if rooms already exist
    const existingRooms = await getAllRooms();
    if (existingRooms.length > 0) {
      console.log(`Catalog already initialized with ${existingRooms.length} rooms. Skipping initialization.`);
      return {
        success: true,
        roomsLoaded: existingRooms.length,
        componentsLoaded: 0,
        optionsLoaded: 0,
      };
    }

    // Load data from JSON files
    const [roomsData, componentsData, optionsData] = await Promise.all([
      loadRoomsCatalog(),
      loadComponentsCatalog(),
      loadRenovationOptionsCatalog(),
    ]);

    console.log(`Loaded ${roomsData.length} rooms, ${componentsData.length} components, ${optionsData.length} options from JSON`);

    // Transform and insert rooms
    const roomsForDb = roomsData.map((room, index) => transformRoomForDb(room, index));
    const insertedRooms = await createRoomsBulk(roomsForDb);
    console.log(`Inserted ${insertedRooms.length} rooms`);

    // Transform and insert components
    const componentsForDb = componentsData.map((comp, index) => transformComponentForDb(comp, index));
    const insertedComponents = await createComponentsBulk(componentsForDb);
    console.log(`Inserted ${insertedComponents.length} components`);

    // Transform and insert renovation options (in batches to avoid memory issues)
    const BATCH_SIZE = 500;
    let totalOptionsInserted = 0;

    for (let i = 0; i < optionsData.length; i += BATCH_SIZE) {
      const batch = optionsData.slice(i, i + BATCH_SIZE);
      const optionsForDb = batch.map((option, batchIndex) =>
        transformRenovationOptionForDb(option, i + batchIndex)
      );
      const inserted = await createRenovationOptionsBulk(optionsForDb);
      totalOptionsInserted += inserted.length;
      console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${inserted.length} options (total: ${totalOptionsInserted})`);
    }

    console.log('Catalog initialization completed successfully');

    return {
      success: true,
      roomsLoaded: insertedRooms.length,
      componentsLoaded: insertedComponents.length,
      optionsLoaded: totalOptionsInserted,
    };
  } catch (error) {
    console.error('Catalog initialization failed:', error);
    return {
      success: false,
      roomsLoaded: 0,
      componentsLoaded: 0,
      optionsLoaded: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if catalog is initialized
 */
export async function isCatalogInitialized(): Promise<boolean> {
  try {
    const rooms = await getAllRooms();
    return rooms.length > 0;
  } catch {
    return false;
  }
}

/**
 * Reset catalog (delete all data) - use with caution
 */
export async function resetCatalog(): Promise<boolean> {
  try {
    // This would require delete functions in repositories
    // For now, just return false - implement if needed
    console.warn('Catalog reset not implemented - requires delete functions');
    return false;
  } catch (error) {
    console.error('Failed to reset catalog:', error);
    return false;
  }
}

