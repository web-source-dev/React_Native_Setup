// Type definitions for camera system

interface ImagePickerAsset {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  [key: string]: any;
}

export interface CameraMediaAsset extends ImagePickerAsset {
  type: 'image' | 'video' | 'livePhoto' | 'pairedVideo';
  duration?: number;
}

export interface CameraMediaResult {
  success: boolean;
  assets?: CameraMediaAsset[];
  error?: string;
}

export interface CameraMediaOptions {
  quality?: number; // 0-1 for images
  allowsEditing?: boolean;
  aspect?: [number, number];
  allowsMultipleSelection?: boolean;
  videoMaxDuration?: number;
  videoQuality?: 'low' | 'medium' | 'high';
}

export interface ImageCompressionOptions {
  quality?: number; // 0-1 for compression
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png';
}

export interface VideoCompressionOptions {
  compressVideos?: boolean;
  quality?: number; // 0-1 for compression
  maxDuration?: number;
}

import { Directory } from 'expo-file-system';

export interface MediaProcessingOptions {
  compression?: {
    images?: ImageCompressionOptions;
    videos?: VideoCompressionOptions;
  };
  storage?: {
    directory?: string | Directory;
    overwrite?: boolean;
    publicAccess?: boolean; // Save to public storage (gallery/documents)
    publicDirectory?: 'photos' | 'videos' | 'documents' | 'downloads';
  };
}

export interface PermissionStatus {
  camera: boolean;
  mediaLibrary: boolean;
}

export interface CameraMediaHookReturn {
  permissions: PermissionStatus;
  requestPermissions: () => Promise<PermissionStatus>;
  takePhoto: (options?: CameraMediaOptions) => Promise<CameraMediaResult>;
  pickPhoto: (options?: CameraMediaOptions) => Promise<CameraMediaResult>;
  takeVideo: (options?: CameraMediaOptions) => Promise<CameraMediaResult>;
  pickVideo: (options?: CameraMediaOptions) => Promise<CameraMediaResult>;
  pickMultiplePhotos: (options?: CameraMediaOptions) => Promise<CameraMediaResult>;
  pickMultipleVideos: (options?: CameraMediaOptions) => Promise<CameraMediaResult>;
  pickAnyMedia: (options?: CameraMediaOptions) => Promise<CameraMediaResult>;
  getMediaDirectory: (type: 'photos' | 'videos' | 'documents') => string;
  isLoading: boolean;
}

// Location types
export interface LocationPermissions {
  granted: boolean;
  canAskAgain: boolean;
  status: any; // Location.PermissionStatus
}

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface AddressData {
  street?: string;
  streetNumber?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  name?: string;
  formattedAddress?: string;
}

export interface LocationWithAddress extends LocationData {
  address?: AddressData;
}

export interface LocationOptions {
  accuracy?: any; // Location.Accuracy
  maximumAge?: number;
  timeout?: number;
  enableHighAccuracy?: boolean;
  distanceInterval?: number;
}

export interface ReverseGeocodeOptions {
  maxResults?: number;
  useGoogleMaps?: boolean;
}

export interface LocationWatcherCallbacks {
  onLocationUpdate?: (location: LocationData) => void;
  onLocationError?: (error: string) => void;
  onStatusChange?: (isWatching: boolean) => void;
}

export interface LocationHookReturn {
  // Permissions
  permissions: LocationPermissions;
  requestPermissions: () => Promise<LocationPermissions>;
  hasLocationServicesEnabled: () => Promise<boolean>;

  // Location operations
  getCurrentLocation: (options?: LocationOptions) => Promise<LocationData | null>;
  getCurrentLocationWithAddress: (options?: LocationOptions & ReverseGeocodeOptions) => Promise<LocationWithAddress | null>;
  reverseGeocodeLocation: (latitude: number, longitude: number, options?: ReverseGeocodeOptions) => Promise<AddressData | null>;

  // Location watching
  startWatchingLocation: (callbacks?: LocationWatcherCallbacks, options?: LocationOptions) => Promise<boolean>;
  stopWatchingLocation: () => void;
  isWatchingLocation: boolean;

  // State
  currentLocation: LocationWithAddress | null;
  isLoading: boolean;
  error: string | null;
}

// Network types
export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: any; // NetInfoStateType
  isWifi: boolean;
  isCellular: boolean;
  details: any;
}

export interface NetworkStatus {
  isOnline: boolean;
  connectionType: string;
  isWifiEnabled: boolean;
  isCellularEnabled: boolean;
  strength?: number;
  carrier?: string;
}

export interface NetworkWatcherCallbacks {
  onNetworkChange?: (state: NetworkState) => void;
  onConnectionLost?: () => void;
  onConnectionRestored?: (connectionType: string) => void;
  onStatusChange?: (isConnected: boolean) => void;
}

export interface NetworkHookReturn {
  // Network state
  networkState: NetworkState | null;
  networkStatus: NetworkStatus | null;
  isOnline: boolean;

  // Network operations
  refreshNetworkState: () => Promise<void>;
  checkOnlineStatus: () => Promise<boolean>;

  // Network watching
  startWatchingNetwork: (callbacks?: NetworkWatcherCallbacks) => void;
  stopWatchingNetwork: () => void;
  isWatchingNetwork: boolean;

  // State
  isLoading: boolean;
  error: string | null;
}

// Device types
export interface DeviceInfo {
  // Basic device info
  brand: string;
  manufacturer: string;
  modelName: string;
  modelId: string;
  designName: string;
  productName: string;
  deviceName: string;

  // OS info
  osName: string;
  osVersion: string;
  osBuildId: string;
  osInternalBuildId: string;

  // Platform info
  platformApiLevel: number;
  deviceType: string;
  isDevice: boolean;

  // App info
  appName: string;
  appVersion: string;
  appBuildVersion: string;
  applicationId: string;

  // Hardware info
  screenWidth: number;
  screenHeight: number;
  screenScale: number;
  pixelRatio: number;

  // Memory and storage (estimated)
  totalMemory?: number;
  freeMemory?: number;
  totalDiskCapacity?: number;
  freeDiskStorage?: number;
}

export interface DeviceHookReturn {
  // Device info
  deviceInfo: DeviceInfo | null;

  // Device operations
  refreshDeviceInfo: () => Promise<void>;

  // Utility getters
  deviceType: string;
  isRealDevice: boolean;
  platformInfo: any;
  appInfo: any;
  screenInfo: any;

  // State
  isLoading: boolean;
  error: string | null;
}