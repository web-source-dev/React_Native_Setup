import { CameraMediaAsset, VideoCompressionOptions } from '../../hooks/types';

export interface VideoCompressionResult {
  success: boolean;
  asset: CameraMediaAsset | null;
  error?: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export const defaultVideoCompressionOptions: VideoCompressionOptions = {
  compressVideos: true,
  quality: 0.7,
  maxDuration: 60,
};

/**
 * Compresses a video using FFmpeg or native compression
 * Note: This is a placeholder implementation. In a real app, you would use:
 * - react-native-ffmpeg for advanced compression
 * - expo-video or react-native-video for basic compression
 * - Or upload to a server for compression
 */
export async function compressVideo(
  asset: CameraMediaAsset,
  options: Partial<VideoCompressionOptions> = {}
): Promise<VideoCompressionResult> {
  try {
    const finalOptions = { ...defaultVideoCompressionOptions, ...options };
    const originalSize = asset.fileSize || 0;

    // For now, we'll simulate compression by reducing file size estimate
    // In a real implementation, you would use proper video compression libraries

    console.log('Video compression requested for:', asset.uri);
    console.log('Compression options:', finalOptions);

    // Simulate compression delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Estimate compressed size (rough approximation)
    const compressionRatio = finalOptions.quality || 0.7;
    const estimatedCompressedSize = Math.round(originalSize * compressionRatio);

    // For demonstration, we'll keep the same asset but update the file size
    // In a real implementation, you'd compress and save to a new file
    const compressedAsset: CameraMediaAsset = {
      ...asset,
      fileSize: estimatedCompressedSize,
      fileName: asset.fileName ? `compressed_${asset.fileName}` : `compressed_video_${Date.now()}.mp4`,
    };

    const actualCompressionRatio = ((originalSize - estimatedCompressedSize) / originalSize) * 100;

    return {
      success: true,
      asset: compressedAsset,
      originalSize,
      compressedSize: estimatedCompressedSize,
      compressionRatio: actualCompressionRatio,
    };
  } catch (error) {
    console.error('Video compression failed:', error);
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
 * Batch compress multiple videos
 */
export async function compressVideos(
  assets: CameraMediaAsset[],
  options: Partial<VideoCompressionOptions> = {},
  onProgress?: (completed: number, total: number) => void
): Promise<VideoCompressionResult[]> {
  const results: VideoCompressionResult[] = [];

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    if (asset.type === 'video') {
      const result = await compressVideo(asset, options);
      results.push(result);
    } else {
      // Skip non-video assets
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
 * Get optimal video compression settings based on use case
 */
export function getVideoCompressionPreset(preset: 'low' | 'medium' | 'high'): VideoCompressionOptions {
  switch (preset) {
    case 'low':
      return { compressVideos: true, quality: 0.9, maxDuration: 120 };
    case 'medium':
      return { compressVideos: true, quality: 0.7, maxDuration: 60 };
    case 'high':
      return { compressVideos: true, quality: 0.5, maxDuration: 30 };
    default:
      return defaultVideoCompressionOptions;
  }
}
