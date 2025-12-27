import { getDb } from '../config/drizzle';

/**
 * Migration: Create properties table
 * This migration creates the properties table to store property information synced from the server
 */
export async function migrateCreatePropertiesTable(): Promise<void> {
  try {
    const db = getDb();

    console.log('Running migration: Create properties table');

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

    // Create indexes for efficient queries
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

    console.log('Migration completed: Properties table created successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    // Don't throw error as app can still function without properties table (will be created on first use)
  }
}

export { migrateCreatePropertiesTable as up };

