// Compression utilities
export {
  compressImage,
  compressImages,
  getCompressionPreset,
  type CompressionResult,
} from './compression/imageCompression';

export {
  compressVideo,
  compressVideos,
  getVideoCompressionPreset,
  type VideoCompressionResult,
} from './compression/videoCompression';

// Storage utilities
export {
  saveMediaToStorage,
  deleteFromStorage,
  getStorageInfo,
  listDirectory,
  cleanupStorage,
  getAppDirectory,
  getMediaDirectory,
  ensureDirectoryExists,
  type StorageResult,
  type StorageOptions,
} from './storage/deviceStorage';

// Location utilities
export {
  requestLocationPermissions,
  getLocationPermissions,
  requestBackgroundLocationPermissions,
  getCurrentLocation,
  getCurrentLocationWithAddress,
  reverseGeocodeLocation,
  calculateDistance,
  hasLocationServicesEnabled,
  openLocationSettings,
  formatAddress,
  LocationWatcher,
  watchLocation,
  watchLocationOnce,
  type LocationPermissions,
  type LocationPermissionOptions,
  type LocationData,
  type AddressData,
  type LocationWithAddress,
  type LocationOptions,
  type ReverseGeocodeOptions,
  type LocationWatcherOptions,
  type LocationSubscription,
  type LocationWatcherCallbacks,
} from './location';

// Network utilities
export {
  getNetworkState,
  isDeviceOnline,
  getNetworkStatus,
  isNetworkMetered,
  getConnectionQuality,
  NetworkWatcher,
  watchNetwork,
  getNetworkStateAndWatch,
  type NetworkState,
  type NetworkStatus,
  type NetworkWatcherCallbacks,
  type NetworkSubscription,
} from './network';

// Device utilities
export {
  getDeviceInfo,
  getDeviceType,
  isRealDevice,
  getPlatformInfo,
  getAppInfo,
  getScreenInfo,
  type DeviceInfo,
} from './device';

// Re-export expo-file-system classes for convenience
export { File, Directory, Paths } from 'expo-file-system';
