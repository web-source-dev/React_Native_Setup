import * as Location from 'expo-location';
import { LocationData, LocationOptions } from './locationService';

export interface LocationWatcherOptions extends LocationOptions {
  timeInterval?: number;
  distanceInterval?: number;
}

export interface LocationSubscription {
  remove: () => void;
}

export interface LocationWatcherCallbacks {
  onLocationUpdate?: (location: LocationData) => void;
  onLocationError?: (error: string) => void;
  onStatusChange?: (isWatching: boolean) => void;
}

/**
 * Watch location changes with callbacks
 */
export class LocationWatcher {
  private subscription: LocationSubscription | null = null;
  private isWatching = false;
  private callbacks: LocationWatcherCallbacks;

  constructor(callbacks: LocationWatcherCallbacks = {}) {
    this.callbacks = callbacks;
  }

  /**
   * Start watching location
   */
  async startWatching(options: LocationWatcherOptions = {}): Promise<boolean> {
    try {
      if (this.isWatching) {
        console.warn('Location watcher is already running');
        return true;
      }

      const watchOptions: Location.LocationOptions = {
        accuracy: options.accuracy || Location.Accuracy.High,
        timeInterval: options.timeInterval || 5000, // 5 seconds
        distanceInterval: options.distanceInterval || 10, // 10 meters
      };

      this.subscription = await Location.watchPositionAsync(
        watchOptions,
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude ?? undefined,
            accuracy: location.coords.accuracy ?? undefined,
            altitudeAccuracy: location.coords.altitudeAccuracy ?? undefined,
            heading: location.coords.heading ?? undefined,
            speed: location.coords.speed ?? undefined,
            timestamp: location.timestamp,
          };

          this.callbacks.onLocationUpdate?.(locationData);
        }
      );

      this.isWatching = true;
      this.callbacks.onStatusChange?.(true);

      return true;
    } catch (error) {
      console.error('Failed to start location watching:', error);
      this.callbacks.onLocationError?.(error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Stop watching location
   */
  stopWatching(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.isWatching = false;
    this.callbacks.onStatusChange?.(false);
  }

  /**
   * Get current watching status
   */
  getIsWatching(): boolean {
    return this.isWatching;
  }

  /**
   * Update callbacks
   */
  setCallbacks(callbacks: LocationWatcherCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }
}

/**
 * Create and start a location watcher (convenience function)
 */
export async function watchLocation(
  callbacks: LocationWatcherCallbacks,
  options: LocationWatcherOptions = {}
): Promise<LocationWatcher | null> {
  const watcher = new LocationWatcher(callbacks);
  const started = await watcher.startWatching(options);

  if (started) {
    return watcher;
  }

  return null;
}

/**
 * Watch location once and stop
 */
export async function watchLocationOnce(
  options: LocationOptions = {}
): Promise<LocationData | null> {
  return new Promise((resolve) => {
    let watcher: LocationWatcher | null = null;

    const callbacks: LocationWatcherCallbacks = {
      onLocationUpdate: (location) => {
        watcher?.stopWatching();
        resolve(location);
      },
      onLocationError: () => {
        watcher?.stopWatching();
        resolve(null);
      },
    };

    watcher = new LocationWatcher(callbacks);
    watcher.startWatching({ ...options, timeInterval: 1000, distanceInterval: 1 });
  });
}
