import { getDb } from '../config/drizzle';
import { mediaFiles, type MediaFile, type NewMediaFile } from '../schema/media.schema';
import { eq } from 'drizzle-orm';

// Helper function to create media_files table
async function createMediaFilesTable(db: any): Promise<void> {
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
      user_id TEXT,
      is_public INTEGER DEFAULT 1,
      sync_status TEXT DEFAULT 'pending',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);
}

// Export types for use in hooks
export type { MediaFile, NewMediaFile };

// CREATE operations
export const createMediaFile = async (mediaData: NewMediaFile): Promise<MediaFile | null> => {
  let db: any;

  try {
    db = getDb();
    const result = await db.insert(mediaFiles).values(mediaData).returning();
    return result[0] || null;
  } catch (error) {
    console.error('Failed to create media file:', error);
    // If table doesn't exist, try to create it and retry
    if (error instanceof Error && error.message.includes('no such table')) {
      try {
        await createMediaFilesTable(db);
        const retryResult = await db.insert(mediaFiles).values(mediaData).returning();
        return retryResult[0] || null;
      } catch (retryError) {
        console.error('Failed to create table and retry:', retryError);
      }
    }
    return null;
  }
};

// READ operations
export const getMediaFileById = async (id: number): Promise<MediaFile | null> => {
  try {
    const db = getDb();
    const result = await db.select().from(mediaFiles).where(eq(mediaFiles.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Failed to get media file by ID:', error);
    return null;
  }
};

export const getAllMediaFiles = async (): Promise<MediaFile[]> => {
  try {
    const db = getDb();
    return await db.select().from(mediaFiles);
  } catch (error) {
    console.error('Failed to get all media files:', error);
    // If table doesn't exist, return empty array
    if (error instanceof Error && error.message.includes('no such table')) {
      return [];
    }
    return [];
  }
};

export const getMediaFilesByType = async (type: string): Promise<MediaFile[]> => {
  try {
    const db = getDb();
    return await db.select().from(mediaFiles).where(eq(mediaFiles.type, type));
  } catch (error) {
    console.error('Failed to get media files by type:', error);
    return [];
  }
};

export const getPendingSyncMediaFiles = async (): Promise<MediaFile[]> => {
  try {
    const db = getDb();
    return await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.syncStatus, 'pending'));
  } catch (error) {
    console.error('Failed to get pending sync media files:', error);
    return [];
  }
};

// UPDATE operations
export const updateMediaFile = async (
  id: number,
  updates: Partial<NewMediaFile>
): Promise<MediaFile | null> => {
  try {
    const db = getDb();
    const result = await db
      .update(mediaFiles)
      .set(updates)
      .where(eq(mediaFiles.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error('Failed to update media file:', error);
    return null;
  }
};

export const updateMediaSyncStatus = async (
  id: number,
  syncStatus: string,
  remoteUrl?: string
): Promise<boolean> => {
  try {
    const db = getDb();
    const updates: Partial<NewMediaFile> = { syncStatus };
    if (remoteUrl) {
      updates.remoteUrl = remoteUrl;
    }

    await db
      .update(mediaFiles)
      .set(updates)
      .where(eq(mediaFiles.id, id));

    return true;
  } catch (error) {
    console.error('Failed to update media sync status:', error);
    return false;
  }
};

// DELETE operations
export const deleteMediaFile = async (id: number): Promise<boolean> => {
  try {
    const db = getDb();
    await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
    return true;
  } catch (error) {
    console.error('Failed to delete media file:', error);
    return false;
  }
};

// BATCH operations
export const createMediaFiles = async (mediaDataArray: NewMediaFile[]): Promise<MediaFile[]> => {
  try {
    const results: MediaFile[] = [];
    for (const mediaData of mediaDataArray) {
      const result = await createMediaFile(mediaData);
      if (result) {
        results.push(result);
      }
    }
    return results;
  } catch (error) {
    console.error('Failed to create media files batch:', error);
    return [];
  }
};

export const deleteMediaFilesByIds = async (ids: number[]): Promise<number> => {
  try {
    let deletedCount = 0;
    for (const id of ids) {
      if (await deleteMediaFile(id)) {
        deletedCount++;
      }
    }
    return deletedCount;
  } catch (error) {
    console.error('Failed to delete media files batch:', error);
    return 0;
  }
};

// UTILITY operations
export const getMediaStats = async () => {
  try {
    const allFiles = await getAllMediaFiles();

    const stats = {
      total: allFiles.length,
      images: allFiles.filter(f => f.type === 'image').length,
      videos: allFiles.filter(f => f.type === 'video').length,
      documents: allFiles.filter(f => f.type === 'document').length,
      pdfs: allFiles.filter(f => f.type === 'pdf').length,
      withLocation: allFiles.filter(f => f.latitude && f.longitude).length,
      pendingSync: allFiles.filter(f => f.syncStatus === 'pending').length,
      synced: allFiles.filter(f => f.syncStatus === 'synced').length,
      totalSize: allFiles.reduce((sum, f) => sum + f.size, 0),
    };

    return stats;
  } catch (error) {
    console.error('Failed to get media stats:', error);
    return {
      total: 0,
      images: 0,
      videos: 0,
      documents: 0,
      pdfs: 0,
      pendingSync: 0,
      synced: 0,
      totalSize: 0,
    };
  }
};
