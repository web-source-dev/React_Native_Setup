import { drizzle } from 'drizzle-orm/expo-sqlite';
import { getDatabaseConnection } from './sqlite';
import { migrateAddLocationColumns } from '../migrations/0001_add_location_columns';
import { migrateAddSoftDelete } from '../migrations/0002_add_soft_delete';
import { migrateCreatePropertiesTable } from '../migrations/0003_create_properties_table';
import { migrateCreateScopeTables } from '../migrations/0004_create_scope_tables';

// Database instance type
export type Database = ReturnType<typeof drizzle>;

// Database initialization status
export interface DrizzleConfig {
  isInitialized: boolean;
  database: Database;
  connection: ReturnType<typeof getDatabaseConnection>;
}

let dbInstance: Database | null = null;

// Initialize Drizzle configuration
export const initializeDrizzle = async (): Promise<DrizzleConfig> => {
  try {
    const connection = getDatabaseConnection();

    if (!dbInstance) {
      dbInstance = drizzle(connection.database);
    }

    // Create tables if they don't exist
    await createTablesIfNeeded(dbInstance);

    // Run migrations
    await runMigrations(dbInstance);

    return {
      isInitialized: connection.isConnected,
      database: dbInstance,
      connection,
    };
  } catch (error) {
    console.error('Failed to initialize Drizzle:', error);
    throw error;
  }
};

// Get database instance
export const getDb = (): Database => {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDrizzle() first.');
  }
  return dbInstance;
};

// Create tables if they don't exist
async function createTablesIfNeeded(db: Database): Promise<void> {
  try {
    // Create media_files table
    await db.run(`
      CREATE TABLE IF NOT EXISTS media_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        local_uri TEXT NOT NULL,
        remote_url TEXT,
        type TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        width INTEGER,
        height INTEGER,
        duration REAL,
        latitude REAL,
        longitude REAL,
        altitude REAL,
        location_accuracy REAL,
        location_address TEXT,
        location_timestamp INTEGER,
        user_id TEXT,
        is_public INTEGER DEFAULT 1,
        sync_status TEXT DEFAULT 'pending',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Create properties table
    await db.run(`
      CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id TEXT UNIQUE,
        homeowner_id TEXT,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT NOT NULL,
        country TEXT DEFAULT 'USA',
        property_type TEXT NOT NULL,
        bedrooms INTEGER,
        bathrooms REAL,
        square_footage INTEGER,
        year_built INTEGER,
        lot_size REAL,
        assigned_aps_reno_id TEXT,
        assigned_aps_re_id TEXT,
        assigned_external_agent_id TEXT,
        assigned_aps_ops_id TEXT,
        target_start_date INTEGER,
        target_listing_date INTEGER,
        target_backstop_date INTEGER,
        permits_likely INTEGER DEFAULT 0,
        structural_risk INTEGER DEFAULT 0,
        occupancy TEXT DEFAULT 'Unknown',
        status TEXT NOT NULL DEFAULT 'new',
        phase TEXT NOT NULL DEFAULT 'inquiry',
        notes TEXT,
        goals TEXT,
        pain_points TEXT,
        budget_comfort TEXT,
        lead_source TEXT DEFAULT 'Homeowner',
        created_by_id TEXT,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        is_deleted INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Create indexes for properties table
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_properties_remote_id ON properties(remote_id)
    `);
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_properties_homeowner_id ON properties(homeowner_id)
    `);
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status)
    `);
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_properties_phase ON properties(phase)
    `);
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_properties_is_deleted ON properties(is_deleted)
    `);

    // Create scope-related tables
    await db.run(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        display_order INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

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

    await db.run(`
      CREATE TABLE IF NOT EXISTS scope_item_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scope_item_id INTEGER NOT NULL,
        media_file_id INTEGER NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
      )
    `);

    // Create indexes for scope tables
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

    console.log('Database tables created/verified successfully');
  } catch (error) {
    console.error('Failed to create database tables:', error);
    throw error;
  }
}

// Run database migrations
async function runMigrations(db: Database): Promise<void> {
  try {
    console.log('Running database migrations...');

    // Run location columns migration
    await migrateAddLocationColumns();

    // Run soft delete migration
    await migrateAddSoftDelete();

    // Run properties table migration
    await migrateCreatePropertiesTable();

    // Run scope tables migration
    await migrateCreateScopeTables();

    console.log('All migrations completed successfully');
  } catch (error) {
    // Migrations might fail if columns already exist, which is fine
    if (error instanceof Error && error.message.includes('duplicate column name')) {
      console.log('Migration skipped: Columns already exist');
    } else {
      console.error('Migration error:', error);
      // Don't throw here as the app can still function
    }
  }
}

// Check if Drizzle is properly configured
export const checkDrizzleHealth = async (): Promise<boolean> => {
  try {
    const db = getDb();
    // Simple query to test database connectivity
    await db.run('SELECT 1');
    return true;
  } catch (error) {
    console.error('Drizzle health check failed:', error);
    return false;
  }
};