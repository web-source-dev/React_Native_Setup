import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from './useDatabase';
import {
  createMediaFile,
  getMediaFileById,
  getAllMediaFiles,
  getMediaFilesByType,
  getPendingSyncMediaFiles,
  updateMediaFile,
  updateMediaSyncStatus,
  deleteMediaFile,
  type MediaFile,
  type NewMediaFile,
} from '../repositories/media';
import { getMediaStatistics } from '../services/databaseHealth.service';

export interface MediaHookReturn {
  // State
  mediaFiles: MediaFile[];
  isLoading: boolean;
  error: string | null;

  // CRUD operations
  createMedia: (mediaData: NewMediaFile) => Promise<MediaFile | null>;
  getMediaById: (id: number) => Promise<MediaFile | null>;
  getAllMedia: () => Promise<void>;
  getMediaByType: (type: string) => Promise<MediaFile[]>;
  getPendingSync: () => Promise<MediaFile[]>;
  updateMedia: (id: number, updates: Partial<NewMediaFile>) => Promise<MediaFile | null>;
  updateSyncStatus: (id: number, syncStatus: string, remoteUrl?: string) => Promise<boolean>;
  deleteMedia: (id: number) => Promise<boolean>;

  // Utility operations
  getStats: () => Promise<any>;
  refresh: () => Promise<void>;
}

export function useMedia(): MediaHookReturn {
  const { db, isInitialized } = useDatabase();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMedia = useCallback(async (mediaData: NewMediaFile): Promise<MediaFile | null> => {
    if (!isInitialized) {
      setError('Database not initialized');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await createMediaFile(mediaData);
      if (result) {
        setMediaFiles(prev => [...prev, result]);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create media';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const getMediaById = useCallback(async (id: number): Promise<MediaFile | null> => {
    if (!isInitialized) return null;

    try {
      return await getMediaFileById(id);
    } catch (err) {
      console.error('Failed to get media by ID:', err);
      return null;
    }
  }, [isInitialized]);

  const getAllMedia = useCallback(async (): Promise<void> => {
    if (!isInitialized) return;

    try {
      setIsLoading(true);
      setError(null);

      const files = await getAllMediaFiles();
      setMediaFiles(files);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load media files';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const getMediaByType = useCallback(async (type: string): Promise<MediaFile[]> => {
    if (!isInitialized) return [];

    try {
      return await getMediaFilesByType(type);
    } catch (err) {
      console.error('Failed to get media by type:', err);
      return [];
    }
  }, [isInitialized]);

  const getPendingSync = useCallback(async (): Promise<MediaFile[]> => {
    if (!isInitialized) return [];

    try {
      return await getPendingSyncMediaFiles();
    } catch (err) {
      console.error('Failed to get pending sync media:', err);
      return [];
    }
  }, [isInitialized]);

  const updateMedia = useCallback(async (
    id: number,
    updates: Partial<NewMediaFile>
  ): Promise<MediaFile | null> => {
    if (!isInitialized) return null;

    try {
      setIsLoading(true);
      setError(null);

      const result = await updateMediaFile(id, updates);
      if (result) {
        setMediaFiles(prev => prev.map(file =>
          file.id === id ? result : file
        ));
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update media';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const updateSyncStatus = useCallback(async (
    id: number,
    syncStatus: string,
    remoteUrl?: string
  ): Promise<boolean> => {
    if (!isInitialized) return false;

    try {
      const success = await updateMediaSyncStatus(id, syncStatus, remoteUrl);
      if (success) {
        // Update local state
        setMediaFiles(prev => prev.map(file =>
          file.id === id
            ? { ...file, syncStatus, remoteUrl: remoteUrl || file.remoteUrl }
            : file
        ));
      }
      return success;
    } catch (err) {
      console.error('Failed to update sync status:', err);
      return false;
    }
  }, [isInitialized]);

  const deleteMedia = useCallback(async (id: number): Promise<boolean> => {
    if (!isInitialized) return false;

    try {
      setIsLoading(true);
      setError(null);

      // Soft delete - marks as deleted and sets sync status to pending
      const success = await deleteMediaFile(id);
      if (success) {
        // Remove from local state (soft deleted items are filtered out)
        setMediaFiles(prev => prev.filter(file => file.id !== id));
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete media';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const getStats = useCallback(async () => {
    if (!isInitialized) return null;

    try {
      return await getMediaStatistics();
    } catch (err) {
      console.error('Failed to get media stats:', err);
      return null;
    }
  }, [isInitialized]);

  const refresh = useCallback(async (): Promise<void> => {
    await getAllMedia();
  }, [getAllMedia]);

  // Load media files on mount
  useEffect(() => {
    if (isInitialized) {
      getAllMedia();
    }
  }, [isInitialized, getAllMedia]);

  return {
    mediaFiles,
    isLoading,
    error,
    createMedia,
    getMediaById,
    getAllMedia,
    getMediaByType,
    getPendingSync,
    updateMedia,
    updateSyncStatus,
    deleteMedia,
    getStats,
    refresh,
  };
}
