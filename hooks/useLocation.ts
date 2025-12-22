import { useState, useCallback, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import {
  LocationPermissions,
  LocationData,
  LocationWithAddress,
  LocationOptions,
  ReverseGeocodeOptions,
  LocationWatcherCallbacks,
  requestLocationPermissions,
  getLocationPermissions,
  getCurrentLocation,
  getCurrentLocationWithAddress,
  reverseGeocodeLocation,
  hasLocationServicesEnabled,
  watchLocation,
  LocationWatcher,
} from '../utils';
import { AddressData, LocationHookReturn } from './types';

export function useLocation(): LocationHookReturn {
  const [permissions, setPermissions] = useState<LocationPermissions>({
    granted: false,
    canAskAgain: true,
    status: 'denied' as any,
  });
  const [currentLocation, setCurrentLocation] = useState<LocationWithAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWatchingLocation, setIsWatchingLocation] = useState(false);

  const watcherRef = useRef<LocationWatcher | null>(null);

  // Initialize permissions on mount
  useEffect(() => {
    checkPermissions();

    return () => {
      if (watcherRef.current) {
        watcherRef.current.stopWatching();
      }
    };
  }, []);

  const checkPermissions = useCallback(async () => {
    try {
      const perms = await getLocationPermissions();
      setPermissions(perms);
      return perms;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check permissions';
      setError(errorMessage);
      return permissions;
    }
  }, [permissions]);

  const requestPermissionsHandler = useCallback(async (): Promise<LocationPermissions> => {
    setIsLoading(true);
    setError(null);

    try {
      const perms = await requestLocationPermissions();
      setPermissions(perms);
      return perms;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permissions';
      setError(errorMessage);
      return permissions;
    } finally {
      setIsLoading(false);
    }
  }, [permissions]);

  const checkLocationServices = useCallback(async (): Promise<boolean> => {
    try {
      return await hasLocationServicesEnabled();
    } catch (err) {
      console.error('Failed to check location services:', err);
      return false;
    }
  }, []);

  const getCurrentLocationHandler = useCallback(async (
    options?: LocationOptions
  ): Promise<LocationData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const location = await getCurrentLocation(options);
      return location;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentLocationWithAddressHandler = useCallback(async (
    options?: LocationOptions & ReverseGeocodeOptions
  ): Promise<LocationWithAddress | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const locationWithAddress = await getCurrentLocationWithAddress(options);
      if (locationWithAddress) {
        setCurrentLocation(locationWithAddress);
      }
      return locationWithAddress;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location with address';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reverseGeocodeLocationHandler = useCallback(async (
    latitude: number,
    longitude: number,
    options?: ReverseGeocodeOptions
  ): Promise<AddressData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const address = await reverseGeocodeLocation(latitude, longitude, options);
      return address;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reverse geocode location';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startWatchingLocationHandler = useCallback(async (
    callbacks: LocationWatcherCallbacks = {},
    options?: LocationOptions
  ): Promise<boolean> => {
    if (isWatchingLocation) {
      console.warn('Location watching is already active');
      return true;
    }

    try {
      const combinedCallbacks: LocationWatcherCallbacks = {
        onLocationUpdate: (location) => {
          setCurrentLocation(prev => prev ? { ...prev, ...location } : { ...location, address: undefined });
          callbacks.onLocationUpdate?.(location);
        },
        onLocationError: (errorMsg) => {
          setError(errorMsg);
          callbacks.onLocationError?.(errorMsg);
        },
        onStatusChange: (watching) => {
          setIsWatchingLocation(watching);
          callbacks.onStatusChange?.(watching);
        },
      };

      const watcher = await watchLocation(combinedCallbacks, options);
      if (watcher) {
        watcherRef.current = watcher;
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start location watching';
      setError(errorMessage);
      return false;
    }
  }, [isWatchingLocation]);

  const stopWatchingLocationHandler = useCallback(() => {
    if (watcherRef.current) {
      watcherRef.current.stopWatching();
      watcherRef.current = null;
    }
    setIsWatchingLocation(false);
  }, []);

  return {
    // Permissions
    permissions,
    requestPermissions: requestPermissionsHandler,
    hasLocationServicesEnabled: checkLocationServices,

    // Location operations
    getCurrentLocation: getCurrentLocationHandler,
    getCurrentLocationWithAddress: getCurrentLocationWithAddressHandler,
    reverseGeocodeLocation: reverseGeocodeLocationHandler,

    // Location watching
    startWatchingLocation: startWatchingLocationHandler,
    stopWatchingLocation: stopWatchingLocationHandler,
    isWatchingLocation,

    // State
    currentLocation,
    isLoading,
    error,
  };
}
