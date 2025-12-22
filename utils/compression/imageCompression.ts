import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { CameraMediaAsset, ImageCompressionOptions } from '../../hooks/types';

export interface CompressionResult {
  success: boolean;
  asset: CameraMediaAsset | null;
  error?: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export const defaultImageCompressionOptions: ImageCompressionOptions = {
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080,
  format: 'jpeg',
};

/**
 * Compresses an image using expo-image-manipulator
 */
export async function compressImage(
  asset: CameraMediaAsset,
  options: Partial<ImageCompressionOptions> = {}
): Promise<CompressionResult> {
  try {
    const finalOptions = { ...defaultImageCompressionOptions, ...options };
    const originalSize = asset.fileSize || 0;

    // Calculate resize dimensions while maintaining aspect ratio
    let resizeWidth = asset.width;
    let resizeHeight = asset.height;

    if (finalOptions.maxWidth && asset.width > finalOptions.maxWidth) {
      const ratio = finalOptions.maxWidth / asset.width;
      resizeWidth = finalOptions.maxWidth;
      resizeHeight = Math.round(asset.height * ratio);
    }

    if (finalOptions.maxHeight && resizeHeight > finalOptions.maxHeight) {
      const ratio = finalOptions.maxHeight / resizeHeight;
      resizeHeight = finalOptions.maxHeight;
      resizeWidth = Math.round(resizeWidth * ratio);
    }

    // Perform image manipulation
    const manipulatedImage = await manipulateAsync(
      asset.uri,
      [
        {
          resize: {
            width: resizeWidth,
            height: resizeHeight,
          },
        },
      ],
      {
        compress: finalOptions.quality,
        format: finalOptions.format === 'png' ? SaveFormat.PNG : SaveFormat.JPEG,
      }
    );

    // Get file info for the compressed image
    const response = await fetch(manipulatedImage.uri);
    const blob = await response.blob();
    const compressedSize = blob.size;

    // Create updated asset
    const compressedAsset: CameraMediaAsset = {
      ...asset,
      uri: manipulatedImage.uri,
      width: manipulatedImage.width,
      height: manipulatedImage.height,
      fileSize: compressedSize,
      fileName: asset.fileName ? `compressed_${asset.fileName}` : `compressed_image_${Date.now()}.jpg`,
    };

    const compressionRatio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize) * 100 : 0;

    return {
      success: true,
      asset: compressedAsset,
      originalSize,
      compressedSize,
      compressionRatio,
    };
  } catch (error) {
    console.error('Image compression failed:', error);
    return {
      success: false,
      asset: null,
      error: `Compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      originalSize: asset.fileSize || 0,
      compressedSize: 0,
      compressionRatio: 0,
    };
  }
}

/**
 * Batch compress multiple images
 */
export async function compressImages(
  assets: CameraMediaAsset[],
  options: Partial<ImageCompressionOptions> = {},
  onProgress?: (completed: number, total: number) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    if (asset.type === 'image') {
      const result = await compressImage(asset, options);
      results.push(result);
    } else {
      // Skip non-image assets
      results.push({
        success: true,
        asset,
        originalSize: asset.fileSize || 0,
        compressedSize: asset.fileSize || 0,
        compressionRatio: 0,
      });
    }

    if (onProgress) {
      onProgress(i + 1, assets.length);
    }
  }

  return results;
}

/**
 * Get optimal compression settings based on use case
 */
export function getCompressionPreset(preset: 'low' | 'medium' | 'high' | 'maximum'): ImageCompressionOptions {
  switch (preset) {
    case 'low':
      return { quality: 0.9, maxWidth: 2048, maxHeight: 2048, format: 'jpeg' };
    case 'medium':
      return { quality: 0.8, maxWidth: 1920, maxHeight: 1080, format: 'jpeg' };
    case 'high':
      return { quality: 0.7, maxWidth: 1600, maxHeight: 900, format: 'jpeg' };
    case 'maximum':
      return { quality: 0.6, maxWidth: 1280, maxHeight: 720, format: 'jpeg' };
    default:
      return defaultImageCompressionOptions;
  }
}
