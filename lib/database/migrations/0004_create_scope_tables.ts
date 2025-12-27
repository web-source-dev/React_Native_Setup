import { getDb } from '../config/drizzle';

/**
 * Migration: Create scope-related tables
 * Creates tables for rooms, components, renovation options, scope items, and scope item photos
 */
export async function migrateCreateScopeTables(): Promise<void> {
  try {
    const db = getDb();

    console.log('Running migration: Create scope tables');

    // Create rooms table
    await db.run(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        display_order INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Create components table
    await db.run(`
      CREATE TABLE IF NOT EXISTS components (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_name TEXT NOT NULL,
        area TEXT NOT NULL,
        display_order INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Create renovation_options table
    await db.run(`
      CREATE TABLE IF NOT EXISTS renovation_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_name TEXT NOT NULL,
        component_area TEXT NOT NULL,
        option_name TEXT NOT NULL,
        typical_materials TEXT,
        default_complexity TEXT,
        default_permit_likely TEXT,
        primary_trades TEXT,
        display_order INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Create scope_items table
    await db.run(`
      CREATE TABLE IF NOT EXISTS scope_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id TEXT UNIQUE,
        property_id INTEGER,
        room_name TEXT NOT NULL,
        component_area TEXT NOT NULL,
        option_name TEXT NOT NULL,
        quantity REAL,
        unit TEXT,
        uom TEXT,
        notes TEXT,
        complexity TEXT NOT NULL DEFAULT 'Medium',
        permit_likely TEXT NOT NULL DEFAULT 'Maybe',
        primary_trades TEXT,
        is_skipped INTEGER NOT NULL DEFAULT 0,
        is_deleted INTEGER NOT NULL DEFAULT 0,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Create scope_item_photos junction table
    await db.run(`
      CREATE TABLE IF NOT EXISTS scope_item_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scope_item_id INTEGER NOT NULL,
        media_file_id INTEGER NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
      )
    `);

    // Create indexes for efficient queries
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_components_room_name ON components(room_name)
    `);
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_renovation_options_room_component ON renovation_options(room_name, component_area)
    `);
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_scope_items_remote_id ON scope_items(remote_id)
    `);
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_scope_items_property_id ON scope_items(property_id)
    `);
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_scope_items_room_name ON scope_items(room_name)
    `);
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_scope_items_is_deleted ON scope_items(is_deleted)
    `);
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_scope_item_photos_scope_item_id ON scope_item_photos(scope_item_id)
    `);
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_scope_item_photos_media_file_id ON scope_item_photos(media_file_id)
    `);

    console.log('Migration completed: Scope tables created successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    // Don't throw error as the app can still function without scope tables
  }
}

export { migrateCreateScopeTables as up };

