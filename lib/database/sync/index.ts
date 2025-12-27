/**
 * Global Sync System - Main Exports
 * 
 * This module exports all sync-related functionality.
 */

// Core types and interfaces
export * from './types';

// Sync service
export { syncService } from './SyncService';

// Base adapter
export { BaseSyncAdapter } from './SyncAdapter';

// Adapters
export { MediaSyncAdapter } from './adapters/MediaSyncAdapter';
export { PropertySyncAdapter } from './adapters/PropertySyncAdapter';
export { ScopeItemSyncAdapter } from './adapters/ScopeItemSyncAdapter';

// Hooks
export { useSync } from './hooks/useSync';
export type { UseSyncReturn } from './hooks/useSync';


