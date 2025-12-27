/**
 * Catalog Data Loader
 * 
 * Utility functions to load and parse the room-by-room renovation catalog JSON files
 */

// Type definitions for JSON structure
export interface RoomCatalogItem {
  Room: string;
}

export interface ComponentCatalogItem {
  Room: string;
  Component: {
    Area: string;
  };
}

export interface RenovationOptionCatalogItem {
  Room: string;
  Component: {
    Area: string;
  };
  'Renovation Option': string;
  'Typical Materials': {
    Specs: string;
  };
  'Complexity (Low': {
    Med: {
      'High)': string;
    };
  };
  'Permitting Likely (Yes': {
    No: {
      'Maybe)': string;
    };
  };
  'Primary Trades': string;
  Notes: string;
}

/**
 * Parse the complexity field from catalog JSON
 */
function parseComplexity(item: RenovationOptionCatalogItem): string {
  try {
    const complexityObj = item['Complexity (Low'];
    if (complexityObj && complexityObj.Med && complexityObj.Med['High)']) {
      return complexityObj.Med['High)'];
    }
    return 'Medium';
  } catch {
    return 'Medium';
  }
}

/**
 * Parse the permit likely field from catalog JSON
 */
function parsePermitLikely(item: RenovationOptionCatalogItem): string {
  try {
    const permitObj = item['Permitting Likely (Yes'];
    if (permitObj && permitObj.No && permitObj.No['Maybe)']) {
      return permitObj.No['Maybe)'];
    }
    return 'Maybe';
  } catch {
    return 'Maybe';
  }
}

/**
 * Load and parse rooms from JSON
 */
export async function loadRoomsCatalog(): Promise<RoomCatalogItem[]> {
  try {
    // In React Native, we need to use require or Asset.fromModule for static JSON
    // For now, we'll use a dynamic import approach
    const roomsData = require('../../../data/room-by-room-renovation-catalogue-rooms.json');
    return Array.isArray(roomsData) ? roomsData : [];
  } catch (error) {
    console.error('Failed to load rooms catalog:', error);
    return [];
  }
}

/**
 * Load and parse components from JSON
 */
export async function loadComponentsCatalog(): Promise<ComponentCatalogItem[]> {
  try {
    const componentsData = require('../../../data/room-by-room-renovation-catalogue-room-components.json');
    return Array.isArray(componentsData) ? componentsData : [];
  } catch (error) {
    console.error('Failed to load components catalog:', error);
    return [];
  }
}

/**
 * Load and parse renovation options from JSON
 */
export async function loadRenovationOptionsCatalog(): Promise<RenovationOptionCatalogItem[]> {
  try {
    const optionsData = require('../../../data/room-by-room-renovation-catalogue-catalog.json');
    return Array.isArray(optionsData) ? optionsData : [];
  } catch (error) {
    console.error('Failed to load renovation options catalog:', error);
    return [];
  }
}

/**
 * Transform catalog data for database insertion
 */
export function transformRoomForDb(room: RoomCatalogItem, index: number) {
  return {
    name: room.Room,
    displayOrder: index,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function transformComponentForDb(component: ComponentCatalogItem, index: number) {
  return {
    roomName: component.Room,
    area: component.Component.Area,
    displayOrder: index,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function transformRenovationOptionForDb(option: RenovationOptionCatalogItem, index: number) {
  return {
    roomName: option.Room,
    componentArea: option.Component.Area,
    optionName: option['Renovation Option'],
    typicalMaterials: option['Typical Materials']?.Specs || null,
    defaultComplexity: parseComplexity(option),
    defaultPermitLikely: parsePermitLikely(option),
    primaryTrades: option['Primary Trades'] || null,
    displayOrder: index,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

