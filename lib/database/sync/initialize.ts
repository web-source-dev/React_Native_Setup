/**
 * Sync System Initialization
 * 
 * This file initializes the sync system and registers all model adapters.
 * Import this file in your app initialization to set up syncing.
 * 
 * Note: The sync system now uses the centralized API base client (apiClient)
 * from apibase.tsx, which automatically handles authentication tokens.
 */

import { syncService } from './SyncService';
import { MediaSyncAdapter } from './adapters/MediaSyncAdapter';
import { PropertySyncAdapter } from './adapters/PropertySyncAdapter';
import { ScopeItemSyncAdapter } from './adapters/ScopeItemSyncAdapter';

/**
 * Initialize the sync system
 * Registers all model adapters.
 * 
 * The sync service automatically uses apiClient from apibase.tsx,
 * which handles all authentication tokens centrally.
 */
export function initializeSync() {
  // Register Media adapter
  const mediaAdapter = new MediaSyncAdapter();
  syncService.registerAdapter(mediaAdapter);

  // Register Property adapter
  const propertyAdapter = new PropertySyncAdapter();
  syncService.registerAdapter(propertyAdapter);

  // Register ScopeItem adapter
  const scopeItemAdapter = new ScopeItemSyncAdapter();
  syncService.registerAdapter(scopeItemAdapter);

  // Register more adapters here as you add new models

  console.log('Sync system initialized');
  console.log('Registered models:', syncService.getRegisteredModels());
  console.log('Using centralized API base client for all requests');
}

/**
 * Get sync service instance
 */
export function getSyncService() {
  return syncService;
}


