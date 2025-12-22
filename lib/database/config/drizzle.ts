import { drizzle } from 'drizzle-orm/expo-sqlite';
import { getDatabaseConnection } from './sqlite';
import { migrateAddLocationColumns } from '../migrations/0001_add_location_columns';

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