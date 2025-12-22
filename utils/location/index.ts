// Location permissions
export {
  requestLocationPermissions,
  getLocationPermissions,
  requestBackgroundLocationPermissions,
  type LocationPermissions,
  type LocationPermissionOptions,
} from './locationPermissions';

// Location services
export {
  getCurrentLocation,
  getCurrentLocationWithAddress,
  reverseGeocodeLocation,
  calculateDistance,
  hasLocationServicesEnabled,
  openLocationSettings,
  formatAddress,
  type LocationData,
  type AddressData,
  type LocationWithAddress,
  type LocationOptions,
  type ReverseGeocodeOptions,
} from './locationService';

// Location watcher
export {
  LocationWatcher,
  watchLocation,
  watchLocationOnce,
  type LocationWatcherOptions,
  type LocationSubscription,
  type LocationWatcherCallbacks,
} from './locationWatcher';
