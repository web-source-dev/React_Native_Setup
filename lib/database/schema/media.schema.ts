import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Media file storage schema
export const mediaFiles = sqliteTable('media_files', {
  // Primary key
  id: integer('id').primaryKey({ autoIncrement: true }),

  // File identification
  filename: text('filename').notNull(), // Current filename with compression
  originalFilename: text('original_filename').notNull(), // Original filename from camera/gallery

  // File paths and URLs
  localUri: text('local_uri').notNull(), // Local file:// path (PRIMARY REFERENCE)
  remoteUrl: text('remote_url'), // Server URL after sync (optional)

  // File metadata
  type: text('type').notNull(), // 'image', 'video', 'document', 'pdf'
  mimeType: text('mime_type').notNull(), // MIME type (image/jpeg, video/mp4, etc.)
  size: integer('size').notNull(), // File size in bytes

  // Image/Video dimensions
  width: integer('width'), // Image/video width in pixels
  height: integer('height'), // Image/video height in pixels

  // Video-specific metadata
  duration: real('duration'), // Video duration in seconds

  // Location data
  latitude: real('latitude'), // Latitude where media was captured
  longitude: real('longitude'), // Longitude where media was captured
  altitude: real('altitude'), // Altitude in meters
  locationAccuracy: real('location_accuracy'), // Location accuracy in meters
  locationAddress: text('location_address'), // Formatted address string
  locationTimestamp: integer('location_timestamp'), // When location was captured

  // Sync and ownership
  userId: text('user_id'), // User ID when authentication is added
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(true), // Public access flag

  // Sync status
  syncStatus: text('sync_status').notNull().default('pending'), // 'pending', 'syncing', 'synced', 'failed'

  // Soft delete flag
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false), // Soft delete flag

  // Timestamps (epoch milliseconds)
  createdAt: integer('created_at').notNull(), // Creation timestamp (epoch ms)
  updatedAt: integer('updated_at').notNull(), // Last update timestamp (epoch ms)
});

// Type definitions for TypeScript
export type MediaFile = typeof mediaFiles.$inferSelect;
export type NewMediaFile = typeof mediaFiles.$inferInsert;

// Sync status enum for type safety
export const SyncStatus = {
  PENDING: 'pending',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  FAILED: 'failed',
} as const;

export type SyncStatusType = typeof SyncStatus[keyof typeof SyncStatus];

// Media type enum for type safety
export const MediaType = {
  IMAGE: 'image',
  VIDEO: 'video',
  DOCUMENT: 'document',
  PDF: 'pdf',
} as const;

export type MediaTypeType = typeof MediaType[keyof typeof MediaType];
