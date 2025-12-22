import React, { createContext, useContext, useState, useCallback } from 'react';
import { CameraMediaAsset, CameraMediaResult, MediaProcessingOptions, LocationWithAddress } from '../hooks/types';
import { useCameraMedia, useLocation } from '../hooks';
import {
  compressImage,
  compressVideo,
  saveMediaToStorage,
  getMediaDirectory,
  Directory,
} from '../utils';
import { createMediaFile } from '../lib/database/repositories/media';

interface MediaContextType {
  // Camera hook
  cameraMedia: ReturnType<typeof useCameraMedia>;

  // Location hook
  location: ReturnType<typeof useLocation>;

  // State
  selectedMedia: CameraMediaAsset[];
  processedMedia: CameraMediaAsset[];
  isProcessing: boolean;
  progress: number;

  // Actions
  handleCameraResult: (
    action: string,
    operation: () => Promise<CameraMediaResult>,
    compressionOptions?: MediaProcessingOptions['compression'],
    storageOptions?: MediaProcessingOptions['storage'],
    includeLocation?: boolean
  ) => Promise<void>;
  clearMedia: () => void;
  processMedia: (media: CameraMediaAsset[], options?: MediaProcessingOptions) => Promise<void>;
  attachLocationToMedia: (media: CameraMediaAsset[], location?: LocationWithAddress) => Promise<CameraMediaAsset[]>;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const cameraMedia = useCameraMedia();
  const location = useLocation();
  const [selectedMedia, setSelectedMedia] = useState<CameraMediaAsset[]>([]);
  const [processedMedia, setProcessedMedia] = useState<CameraMediaAsset[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const clearMedia = useCallback(() => {
    setSelectedMedia([]);
    setProcessedMedia([]);
    setProgress(0);
  }, []);

  const handleCameraResult = useCallback(async (
    action: string,
    operation: () => Promise<CameraMediaResult>,
    compressionOptions?: MediaProcessingOptions['compression'],
    storageOptions?: MediaProcessingOptions['storage'],
    includeLocation: boolean = false
  ) => {
    try {
      const result = await operation();

      if (result.success && result.assets) {
        let assetsToProcess = result.assets;

        // Attach location data if requested
        if (includeLocation) {
          assetsToProcess = await attachLocationToMedia(result.assets);
        }

        setSelectedMedia(assetsToProcess);

        // Process media automatically if options provided
        if (compressionOptions || storageOptions) {
          await processMedia(assetsToProcess, { compression: compressionOptions, storage: storageOptions });
        } else {
          setProcessedMedia(assetsToProcess);
        }

        console.log(`${action} completed:`, {
          count: assetsToProcess.length,
          assets: assetsToProcess.map(asset => ({
            type: asset.type,
            uri: asset.uri,
            size: asset.fileSize,
            dimensions: `${asset.width}x${asset.height}`,
            hasLocation: !!(asset as any).location,
          })),
        });
      }
    } catch (error) {
      console.error(`${action} failed:`, error);
      throw error;
    }
  }, []);

  const processMedia = useCallback(async (
    media: CameraMediaAsset[],
    options: MediaProcessingOptions = {}
  ) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const processedAssets: CameraMediaAsset[] = [];
      const totalItems = media.length;

      for (let i = 0; i < media.length; i++) {
        const asset = media[i];
        let processedAsset = { ...asset };

        // Apply compression if specified
        if (options.compression) {
          if (asset.type === 'image' && options.compression.images) {
            console.log(`Compressing image ${i + 1}/${totalItems}:`, asset.fileName || asset.uri);
            const compressionResult = await compressImage(asset, options.compression.images);

            if (compressionResult.success && compressionResult.asset) {
              processedAsset = compressionResult.asset;
              console.log(`Image compressed: ${compressionResult.compressionRatio.toFixed(1)}% reduction`, {
                originalSize: compressionResult.originalSize,
                compressedSize: compressionResult.compressedSize,
              });
            } else {
              console.warn('Image compression failed:', compressionResult.error);
            }
          } else if (asset.type === 'video' && options.compression.videos) {
            console.log(`Compressing video ${i + 1}/${totalItems}:`, asset.fileName || asset.uri);
            const compressionResult = await compressVideo(asset, options.compression.videos);

            if (compressionResult.success && compressionResult.asset) {
              processedAsset = compressionResult.asset;
              console.log(`Video compressed: ${compressionResult.compressionRatio.toFixed(1)}% reduction`, {
                originalSize: compressionResult.originalSize,
                compressedSize: compressionResult.compressedSize,
              });
            } else {
              console.warn('Video compression failed:', compressionResult.error);
            }
          }
        }

        // Save to storage if specified
        if (options.storage) {
          const storageResult = await saveMediaToStorage(processedAsset, {
            publicAccess: options.storage.publicAccess ?? false,
            publicDirectory: options.storage.publicDirectory,
            overwrite: options.storage.overwrite ?? true,
          });

          if (storageResult.success && storageResult.uri) {
            console.log(`Media saved to storage:`, storageResult.uri);
            processedAsset.uri = storageResult.uri;

            // Save metadata to database
            const dbResult = await createMediaFile({
              filename: processedAsset.fileName || `media_${Date.now()}.${processedAsset.type === 'image' ? 'jpg' : 'mp4'}`,
              originalFilename: processedAsset.fileName || processedAsset.filename || 'unknown',
              localUri: storageResult.uri,
              remoteUrl: undefined,
              type: processedAsset.type,
              mimeType: processedAsset.type === 'image' ? 'image/jpeg' : processedAsset.type === 'video' ? 'video/mp4' : 'application/octet-stream',
              size: processedAsset.fileSize || 0,
              width: processedAsset.width,
              height: processedAsset.height,
              duration: processedAsset.duration,
              // Location data
              latitude: (processedAsset as any).location?.latitude,
              longitude: (processedAsset as any).location?.longitude,
              altitude: (processedAsset as any).location?.altitude,
              locationAccuracy: (processedAsset as any).location?.accuracy,
              locationAddress: (processedAsset as any).location?.address?.formattedAddress,
              locationTimestamp: (processedAsset as any).location?.timestamp,
              userId: undefined,
              isPublic: true,
              syncStatus: 'pending',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });

            if (dbResult) {
              console.log(`Media metadata saved to database with ID:`, dbResult.id);
            }
          } else {
            console.warn('Storage save failed:', storageResult.error);
          }
        }

        processedAssets.push(processedAsset);
        setProgress(((i + 1) / totalItems) * 100);
      }

      setProcessedMedia(processedAssets);
      setProgress(100);

      console.log('Media processing completed:', {
        totalProcessed: processedAssets.length,
        totalSize: processedAssets.reduce((sum, asset) => sum + (asset.fileSize || 0), 0),
        storedPaths: processedAssets.map(asset => asset.uri),
      });

    } catch (error) {
      console.error('Media processing failed:', error);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const attachLocationToMedia = useCallback(async (
    media: CameraMediaAsset[],
    locationData?: LocationWithAddress
  ): Promise<CameraMediaAsset[]> => {
    try {
      let locationToAttach = locationData;

      // Get current location if not provided
      if (!locationToAttach) {
        const currentLocation = await location.getCurrentLocationWithAddress();
        locationToAttach = currentLocation || undefined;
      }

      if (!locationToAttach) {
        console.warn('No location available to attach to media');
        return media;
      }

      // Attach location data to each media asset
      const mediaWithLocation = media.map(asset => ({
        ...asset,
        location: {
          latitude: locationToAttach!.latitude,
          longitude: locationToAttach!.longitude,
          altitude: locationToAttach!.altitude,
          accuracy: locationToAttach!.accuracy,
          timestamp: locationToAttach!.timestamp,
          address: locationToAttach!.address,
        },
      }));

      console.log('Location attached to media:', {
        location: {
          latitude: locationToAttach.latitude,
          longitude: locationToAttach.longitude,
          address: locationToAttach.address?.formattedAddress,
        },
        mediaCount: mediaWithLocation.length,
      });

      return mediaWithLocation;
    } catch (error) {
      console.error('Failed to attach location to media:', error);
      return media;
    }
  }, [location]);

  const value: MediaContextType = {
    cameraMedia,
    location,
    selectedMedia,
    processedMedia,
    isProcessing,
    progress,
    handleCameraResult,
    clearMedia,
    processMedia,
    attachLocationToMedia,
  };

  return (
    <MediaContext.Provider value={value}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMediaContext(): MediaContextType {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMediaContext must be used within a MediaProvider');
  }
  return context;
}
