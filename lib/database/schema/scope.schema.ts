import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Room catalog schema (preloaded rooms)
export const rooms = sqliteTable('rooms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  displayOrder: integer('display_order'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Component schema (components per room)
export const components = sqliteTable('components', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomName: text('room_name').notNull(),
  area: text('area').notNull(), // Component/Area name
  displayOrder: integer('display_order'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Renovation options schema (options per component)
export const renovationOptions = sqliteTable('renovation_options', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomName: text('room_name').notNull(),
  componentArea: text('component_area').notNull(),
  optionName: text('option_name').notNull(), // e.g., "Repair", "Replace", "Upgrade"
  typicalMaterials: text('typical_materials'), // JSON string of materials specs
  defaultComplexity: text('default_complexity'), // 'Low', 'Medium', 'High'
  defaultPermitLikely: text('default_permit_likely'), // 'Yes', 'No', 'Maybe'
  primaryTrades: text('primary_trades'), // Comma-separated trades
  displayOrder: integer('display_order'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Scope items schema (actual scope items captured during walkthrough)
export const scopeItems = sqliteTable('scope_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  remoteId: text('remote_id').unique(), // Server ID (MongoDB _id)
  propertyId: integer('property_id'), // Reference to property (if linked)
  roomName: text('room_name').notNull(),
  componentArea: text('component_area').notNull(),
  optionName: text('option_name').notNull(),
  quantity: real('quantity'),
  unit: text('unit'), // Unit of measure (e.g., "sq ft", "each", "linear ft")
  uom: text('uom'), // Unit of measure code
  notes: text('notes'),
  complexity: text('complexity').notNull().default('Medium'), // 'Low', 'Medium', 'High'
  permitLikely: text('permit_likely').notNull().default('Maybe'), // 'Yes', 'No', 'Maybe'
  primaryTrades: text('primary_trades'), // Comma-separated trades
  isSkipped: integer('is_skipped', { mode: 'boolean' }).default(false),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false),
  syncStatus: text('sync_status').notNull().default('pending'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Scope item photos junction table (many-to-many)
export const scopeItemPhotos = sqliteTable('scope_item_photos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  scopeItemId: integer('scope_item_id').notNull(),
  mediaFileId: integer('media_file_id').notNull(), // Reference to media_files table
  displayOrder: integer('display_order').default(0),
  createdAt: integer('created_at').notNull(),
});

// Type definitions
export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;

export type Component = typeof components.$inferSelect;
export type NewComponent = typeof components.$inferInsert;

export type RenovationOption = typeof renovationOptions.$inferSelect;
export type NewRenovationOption = typeof renovationOptions.$inferInsert;

export type ScopeItem = typeof scopeItems.$inferSelect;
export type NewScopeItem = typeof scopeItems.$inferInsert;

export type ScopeItemPhoto = typeof scopeItemPhotos.$inferSelect;
export type NewScopeItemPhoto = typeof scopeItemPhotos.$inferInsert;

