import { File, Directory, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { CameraMediaAsset } from '../../hooks/types';
import { Platform } from 'react-native';

export interface StorageOptions {
  directory?: Directory;
  fileName?: string;
  overwrite?: boolean;
  publicAccess?: boolean;
  publicDirectory?: 'photos' | 'videos' | 'documents' | 'downloads';
}

export interface StorageResult {
  success: boolean;
  uri: string | null;
  path: string | null;
  error?: string;
  size: number;
}

/**
 * Get the app's document directory
 */
export function getAppDirectory(): Directory {
  return new Directory(Paths.document);
}

/**
 * Get media-specific directories
 */
export function getMediaDirectory(type: 'photos' | 'videos' | 'documents'): Directory {
  const baseDir = getAppDirectory();
  return new Directory(baseDir, type);
}

/**
 * Ensure a directory exists
 */
export async function ensureDirectoryExists(directory: Directory): Promise<boolean> {
  try {
    await directory.create();
    return true;
  } catch (error) {
    console.error('Failed to create directory:', error);
    return false;
  }
}

/**
 * Save a media asset to device storage (private or public)
 */
export async function saveMediaToStorage(
  asset: CameraMediaAsset,
  options: StorageOptions = {}
): Promise<StorageResult> {
  const { publicAccess = false } = options;

  if (publicAccess) {
    return saveToPublicStorage(asset, options);
  } else {
    return saveToPrivateStorage(asset, options);
  }
}

/**
 * Save media to app-private storage
 */
async function saveToPrivateStorage(
  asset: CameraMediaAsset,
  options: StorageOptions = {}
): Promise<StorageResult> {
  try {
    const {
      directory = getMediaDirectory(asset.type === 'video' ? 'videos' : 'photos'),
      fileName,
      overwrite = true
    } = options;

    // Ensure directory exists
    const dirExists = await ensureDirectoryExists(directory);
    if (!dirExists) {
      return {
        success: false,
        uri: null,
        path: null,
        error: 'Failed to create storage directory',
        size: 0,
      };
    }

    // Generate filename if not provided
    const finalFileName = fileName || asset.fileName || `media_${Date.now()}.${getFileExtension(asset)}`;
    const file = new File(directory.uri, finalFileName);

    // Check if file exists and handle overwrite
    if (!overwrite) {
      const exists = await file.exists;
      if (exists) {
        return {
          success: false,
          uri: null,
          path: null,
          error: 'File already exists and overwrite is disabled',
          size: 0,
        };
      }
    }

    // Copy file to storage
    const sourceFile = new File(asset.uri);
    await sourceFile.copy(file);

    // Get file info
    const size = file.size;

    console.log('Media saved to private storage:', {
      originalUri: asset.uri,
      storedPath: file.uri,
      size,
      type: asset.type,
    });

    return {
      success: true,
      uri: file.uri,
      path: file.uri,
      size,
    };
  } catch (error) {
    console.error('Failed to save to private storage:', error);
    return {
      success: false,
      uri: null,
      path: null,
      error: `Private storage save failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      size: 0,
    };
  }
}

/**
 * Save media to public storage (accessible by other apps)
 */
async function saveToPublicStorage(
  asset: CameraMediaAsset,
  options: StorageOptions = {}
): Promise<StorageResult> {
  const { publicDirectory = 'documents', fileName } = options;

  if (Platform.OS === 'android') {
    return saveToAndroidPublicStorage(asset, publicDirectory, fileName);
  } else if (Platform.OS === 'ios') {
    return saveToIosPublicStorage(asset, publicDirectory, fileName);
  } else {
    return {
      success: false,
      uri: null,
      path: null,
      error: 'Public storage not supported on this platform',
      size: 0,
    };
  }
}

/**
 * Save to Android public storage using Media Store API
 */
async function saveToAndroidPublicStorage(
  asset: CameraMediaAsset,
  directory: string,
  fileName?: string
): Promise<StorageResult> {
  try {
    // Request media library permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      return {
        success: false,
        uri: null,
        path: null,
        error: 'Media library permission required for public storage',
        size: 0,
      };
    }

    // Generate filename
    const finalFileName = fileName || asset.fileName || `media_${Date.now()}.${getFileExtension(asset)}`;

    // Create asset in media library
    const assetResult = await MediaLibrary.createAssetAsync(asset.uri);

    if (!assetResult) {
      return {
        success: false,
        uri: null,
        path: null,
        error: 'Failed to create media asset',
        size: 0,
      };
    }

    // Get asset info
    const assetInfo = await MediaLibrary.getAssetInfoAsync(assetResult);

    console.log('Media saved to Android public storage:', {
      originalUri: asset.uri,
      publicUri: assetInfo.uri,
      localUri: assetInfo.localUri,
      filename: assetInfo.filename,
      size: asset.fileSize,
      type: asset.type,
    });

    return {
      success: true,
      uri: assetInfo.uri,
      path: assetInfo.localUri || assetInfo.uri,
      size: asset.fileSize || 0,
    };
  } catch (error) {
    console.error('Failed to save to Android public storage:', error);
    return {
      success: false,
      uri: null,
      path: null,
      error: `Android public storage save failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      size: 0,
    };
  }
}

/**
 * Save to iOS public storage using Photos Library
 */
async function saveToIosPublicStorage(
  asset: CameraMediaAsset,
  directory: string,
  fileName?: string
): Promise<StorageResult> {
  try {
    // Request media library permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      return {
        success: false,
        uri: null,
        path: null,
        error: 'Media library permission required for public storage',
        size: 0,
      };
    }

    // For iOS, save to Photos Library (most accessible public storage)
    const assetResult = await MediaLibrary.createAssetAsync(asset.uri);

    if (!assetResult) {
      return {
        success: false,
        uri: null,
        path: null,
        error: 'Failed to create media asset',
        size: 0,
      };
    }

    // Get asset info
    const assetInfo = await MediaLibrary.getAssetInfoAsync(assetResult);

    console.log('Media saved to iOS public storage:', {
      originalUri: asset.uri,
      publicUri: assetInfo.uri,
      localUri: assetInfo.localUri,
      filename: assetInfo.filename,
      size: asset.fileSize,
      type: asset.type,
    });

    return {
      success: true,
      uri: assetInfo.uri,
      path: assetInfo.localUri || assetInfo.uri,
      size: asset.fileSize || 0,
    };
  } catch (error) {
    console.error('Failed to save to iOS public storage:', error);
    return {
      success: false,
      uri: null,
      path: null,
      error: `iOS public storage save failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      size: 0,
    };
  }
}

/**
 * Get file extension from asset
 */
function getFileExtension(asset: CameraMediaAsset): string {
  if (asset.fileName) {
    const ext = asset.fileName.split('.').pop();
    if (ext) return ext.toLowerCase();
  }

  // Fallback based on type
  return asset.type === 'video' ? 'mp4' : 'jpg';
}

/**
 * Delete a file from storage
 */
export async function deleteFromStorage(fileUri: string): Promise<boolean> {
  try {
    const file = new File(fileUri);
    await file.delete();
    return true;
  } catch (error) {
    console.error('Failed to delete file from storage:', error);
    return false;
  }
}

/**
 * Get storage info
 * Note: Storage info methods are not available in the new filesystem API
 */
export async function getStorageInfo(): Promise<{
  totalSpace: number;
  freeSpace: number;
  usedSpace: number;
} | null> {
  try {
    // Storage info methods are not available in the new filesystem API
    // You might need to use platform-specific APIs or legacy filesystem API
    console.warn('Storage info not available in new filesystem API');
    return null;
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return null;
  }
}

/**
 * List files in a directory
 */
export async function listDirectory(directory: Directory): Promise<string[]> {
  try {
    const files = await directory.list();
    return files.map(file => file.name || file.uri);
  } catch (error) {
    console.error('Failed to list directory:', error);
    return [];
  }
}

/**
 * Clean up old files from storage (optional utility)
 */
export async function cleanupStorage(directory: Directory, maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
  try {
    const files = await directory.list();
    let deletedCount = 0;

    for (const file of files) {
      try {
        // Note: lastModified is not available in the new filesystem API
        // For now, we'll skip age-based cleanup
        // In a real implementation, you might need to track timestamps separately
        console.warn('Age-based cleanup not available in new filesystem API');
        // await file.delete(); // Uncomment when age checking is implemented
        // deletedCount++;
      } catch (error) {
        console.warn('Failed to cleanup file:', error);
      }
    }

    return deletedCount;
  } catch (error) {
    console.error('Failed to cleanup storage:', error);
    return 0;
  }
}
