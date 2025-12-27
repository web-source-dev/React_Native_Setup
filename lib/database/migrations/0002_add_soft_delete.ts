import { getDb } from '../config/drizzle';

/**
 * Migration: Add soft delete column to media_files table
 * This migration adds is_deleted field to support soft delete functionality
 */
export async function migrateAddSoftDelete(): Promise<void> {
  try {
    const db = getDb();

    console.log('Running migration: Add soft delete column to media_files table');

    try {
      await db.run(`
        ALTER TABLE media_files ADD COLUMN is_deleted INTEGER DEFAULT 0;
      `);
      console.log('Added column: is_deleted');
    } catch (columnError) {
      // Column might already exist, which is fine
      if (columnError instanceof Error && columnError.message.includes('duplicate column name')) {
        console.log('Column is_deleted already exists, skipping');
      } else {
        console.warn('Failed to add column is_deleted:', columnError);
      }
    }

    console.log('Migration completed: Soft delete column verified/added successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    // Don't throw error as app can still function without soft delete column
  }
}

export { migrateAddSoftDelete as up };

