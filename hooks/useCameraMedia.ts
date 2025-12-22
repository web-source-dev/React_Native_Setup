import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'expo-camera';
import { Alert, Platform } from 'react-native';
import {
  CameraMediaAsset,
  CameraMediaResult,
  CameraMediaOptions,
  PermissionStatus,
  CameraMediaHookReturn
} from './types';
import { getMediaDirectory } from '../utils';

const DEFAULT_OPTIONS: Required<CameraMediaOptions> = {
  quality: 0.8,
  allowsEditing: false,
  aspect: [4, 3],
  allowsMultipleSelection: false,
  videoMaxDuration: 60,
  videoQuality: 'medium',
};

export function useCameraMedia(): CameraMediaHookReturn {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: false,
    mediaLibrary: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async (): Promise<PermissionStatus> => {
    try {
      const [cameraStatus, mediaLibraryStatus] = await Promise.all([
        Camera.getCameraPermissionsAsync(),
        MediaLibrary.getPermissionsAsync(),
      ]);

      const newPermissions: PermissionStatus = {
        camera: cameraStatus.granted,
        mediaLibrary: mediaLibraryStatus.granted,
      };

      setPermissions(newPermissions);
      return newPermissions;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return { camera: false, mediaLibrary: false };
    }
  };

  const requestPermissions = async (): Promise<PermissionStatus> => {
    try {
      setIsLoading(true);

      const [cameraStatus, mediaLibraryStatus] = await Promise.all([
        Camera.requestCameraPermissionsAsync(),
        MediaLibrary.requestPermissionsAsync(),
      ]);

      const newPermissions: PermissionStatus = {
        camera: cameraStatus.granted,
        mediaLibrary: mediaLibraryStatus.granted,
      };

      setPermissions(newPermissions);
      return newPermissions;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions');
      return { camera: false, mediaLibrary: false };
    } finally {
      setIsLoading(false);
    }
  };

  const handleResult = (result: ImagePicker.ImagePickerResult): CameraMediaResult => {
    if (result.canceled) {
      return { success: false, error: 'User cancelled' };
    }

    const assets: CameraMediaAsset[] = result.assets.map(asset => ({
      ...asset,
      type: asset.type || (asset.duration ? 'video' : 'image'),
    })) as CameraMediaAsset[];

    return { success: true, assets };
  };

  const takePhoto = async (options: CameraMediaOptions = {}): Promise<CameraMediaResult> => {
    try {
      setIsLoading(true);

      // Check permissions first
      if (!permissions.camera) {
        const newPermissions = await requestPermissions();
        if (!newPermissions.camera) {
          return { success: false, error: 'Camera permission required' };
        }
      }

      const finalOptions = { ...DEFAULT_OPTIONS, ...options };

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: finalOptions.quality,
        allowsEditing: finalOptions.allowsEditing,
        aspect: finalOptions.aspect,
        allowsMultipleSelection: false,
      });

      return handleResult(result);
    } catch (error) {
      console.error('Error taking photo:', error);
      return { success: false, error: 'Failed to take photo' };
    } finally {
      setIsLoading(false);
    }
  };

  const pickPhoto = async (options: CameraMediaOptions = {}): Promise<CameraMediaResult> => {
    try {
      setIsLoading(true);

      // Check permissions first
      if (!permissions.mediaLibrary) {
        const newPermissions = await requestPermissions();
        if (!newPermissions.mediaLibrary) {
          return { success: false, error: 'Media library permission required' };
        }
      }

      const finalOptions = { ...DEFAULT_OPTIONS, ...options };

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: finalOptions.quality,
        allowsEditing: finalOptions.allowsEditing,
        aspect: finalOptions.aspect,
        allowsMultipleSelection: false,
      });

      return handleResult(result);
    } catch (error) {
      console.error('Error picking photo:', error);
      return { success: false, error: 'Failed to pick photo' };
    } finally {
      setIsLoading(false);
    }
  };

  const takeVideo = async (options: CameraMediaOptions = {}): Promise<CameraMediaResult> => {
    try {
      setIsLoading(true);

      // Check permissions first
      if (!permissions.camera) {
        const newPermissions = await requestPermissions();
        if (!newPermissions.camera) {
          return { success: false, error: 'Camera permission required' };
        }
      }

      const finalOptions = { ...DEFAULT_OPTIONS, ...options };

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: finalOptions.quality,
        allowsEditing: finalOptions.allowsEditing,
        aspect: finalOptions.aspect,
        allowsMultipleSelection: false,
        videoMaxDuration: finalOptions.videoMaxDuration,
        videoQuality: finalOptions.videoQuality === 'low'
          ? ImagePicker.UIImagePickerControllerQualityType.Low
          : finalOptions.videoQuality === 'high'
          ? ImagePicker.UIImagePickerControllerQualityType.High
          : ImagePicker.UIImagePickerControllerQualityType.Medium,
      });

      return handleResult(result);
    } catch (error) {
      console.error('Error taking video:', error);
      return { success: false, error: 'Failed to take video' };
    } finally {
      setIsLoading(false);
    }
  };

  const pickVideo = async (options: CameraMediaOptions = {}): Promise<CameraMediaResult> => {
    try {
      setIsLoading(true);

      // Check permissions first
      if (!permissions.mediaLibrary) {
        const newPermissions = await requestPermissions();
        if (!newPermissions.mediaLibrary) {
          return { success: false, error: 'Media library permission required' };
        }
      }

      const finalOptions = { ...DEFAULT_OPTIONS, ...options };

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: finalOptions.quality,
        allowsEditing: finalOptions.allowsEditing,
        aspect: finalOptions.aspect,
        allowsMultipleSelection: false,
        videoMaxDuration: finalOptions.videoMaxDuration,
      });

      return handleResult(result);
    } catch (error) {
      console.error('Error picking video:', error);
      return { success: false, error: 'Failed to pick video' };
    } finally {
      setIsLoading(false);
    }
  };

  const pickMultiplePhotos = async (options: CameraMediaOptions = {}): Promise<CameraMediaResult> => {
    try {
      setIsLoading(true);

      // Check permissions first
      if (!permissions.mediaLibrary) {
        const newPermissions = await requestPermissions();
        if (!newPermissions.mediaLibrary) {
          return { success: false, error: 'Media library permission required' };
        }
      }

      const finalOptions = { ...DEFAULT_OPTIONS, allowsMultipleSelection: true, ...options };

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: finalOptions.quality,
        allowsEditing: false, // Multiple selection doesn't work with editing
        allowsMultipleSelection: true,
      });

      return handleResult(result);
    } catch (error) {
      console.error('Error picking multiple photos:', error);
      return { success: false, error: 'Failed to pick multiple photos' };
    } finally {
      setIsLoading(false);
    }
  };

  const pickMultipleVideos = async (options: CameraMediaOptions = {}): Promise<CameraMediaResult> => {
    try {
      setIsLoading(true);

      // Check permissions first
      if (!permissions.mediaLibrary) {
        const newPermissions = await requestPermissions();
        if (!newPermissions.mediaLibrary) {
          return { success: false, error: 'Media library permission required' };
        }
      }

      const finalOptions = { ...DEFAULT_OPTIONS, allowsMultipleSelection: true, ...options };

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: finalOptions.quality,
        allowsEditing: false, // Multiple selection doesn't work with editing
        allowsMultipleSelection: true,
        videoMaxDuration: finalOptions.videoMaxDuration,
      });

      return handleResult(result);
    } catch (error) {
      console.error('Error picking multiple videos:', error);
      return { success: false, error: 'Failed to pick multiple videos' };
    } finally {
      setIsLoading(false);
    }
  };

  const pickAnyMedia = async (options: CameraMediaOptions = {}): Promise<CameraMediaResult> => {
    try {
      setIsLoading(true);

      // Check permissions first
      if (!permissions.mediaLibrary) {
        const newPermissions = await requestPermissions();
        if (!newPermissions.mediaLibrary) {
          return { success: false, error: 'Media library permission required' };
        }
      }

      const finalOptions = { ...DEFAULT_OPTIONS, ...options };

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: finalOptions.quality,
        allowsEditing: finalOptions.allowsEditing,
        aspect: finalOptions.aspect,
        allowsMultipleSelection: finalOptions.allowsMultipleSelection,
        videoMaxDuration: finalOptions.videoMaxDuration,
      });

      return handleResult(result);
    } catch (error) {
      console.error('Error picking media:', error);
      return { success: false, error: 'Failed to pick media' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    permissions,
    requestPermissions,
    takePhoto,
    pickPhoto,
    takeVideo,
    pickVideo,
    pickMultiplePhotos,
    pickMultipleVideos,
    pickAnyMedia,
    getMediaDirectory: (type: 'photos' | 'videos' | 'documents') => getMediaDirectory(type).uri,
    isLoading,
  };
}
