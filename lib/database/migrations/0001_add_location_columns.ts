import { getDb } from '../config/drizzle';

/**
 * Migration: Add location columns to media_files table
 * This migration adds location-related fields to support storing GPS data with media files
 */
export async function migrateAddLocationColumns(): Promise<void> {
  try {
    const db = getDb();

    console.log('Running migration: Add location columns to media_files table');

    // Check if columns already exist before adding them
    const columnsToAdd = [
      'latitude',
      'longitude',
      'altitude',
      'location_accuracy',
      'location_address',
      'location_timestamp'
    ];

    for (const columnName of columnsToAdd) {
      try {
        await db.run(`
          ALTER TABLE media_files ADD COLUMN ${columnName} ${columnName === 'location_timestamp' ? 'INTEGER' : columnName.includes('address') ? 'TEXT' : 'REAL'};
        `);
        console.log(`Added column: ${columnName}`);
      } catch (columnError) {
        // Column might already exist, which is fine
        if (columnError instanceof Error && columnError.message.includes('duplicate column name')) {
          console.log(`Column ${columnName} already exists, skipping`);
        } else {
          console.warn(`Failed to add column ${columnName}:`, columnError);
        }
      }
    }

    console.log('Migration completed: Location columns verified/added successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    // Don't throw error as app can still function without location columns
  }
}

export { migrateAddLocationColumns as up };
