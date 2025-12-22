import * as Location from 'expo-location';

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
  accuracy?: Location.Accuracy;
  timeout?: number;
  enableHighAccuracy?: boolean;
  distanceInterval?: number;
}

export interface ReverseGeocodeOptions {
  maxResults?: number;
  useGoogleMaps?: boolean;
}

/**
 * Get current location
 */
export async function getCurrentLocation(
  options: LocationOptions = {}
): Promise<LocationData | null> {
  try {
    const defaultOptions: Location.LocationOptions = {
      accuracy: options.accuracy || Location.Accuracy.High,
      distanceInterval: options.distanceInterval || 0,
    };

    const location = await Location.getCurrentPositionAsync(defaultOptions);

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude ?? undefined,
      accuracy: location.coords.accuracy ?? undefined,
      altitudeAccuracy: location.coords.altitudeAccuracy ?? undefined,
      heading: location.coords.heading ?? undefined,
      speed: location.coords.speed ?? undefined,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error('Failed to get current location:', error);
    return null;
  }
}

/**
 * Get location with reverse geocoding
 */
export async function getCurrentLocationWithAddress(
  options: LocationOptions & ReverseGeocodeOptions = {}
): Promise<LocationWithAddress | null> {
  try {
    const location = await getCurrentLocation(options);
    if (!location) return null;

    const address = await reverseGeocodeLocation(
      location.latitude,
      location.longitude,
      options
    );

    return {
      ...location,
      address: address || undefined,
    };
  } catch (error) {
    console.error('Failed to get location with address:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocodeLocation(
  latitude: number,
  longitude: number,
  options: ReverseGeocodeOptions = {}
): Promise<AddressData | null> {
  try {
    const addresses = await Location.reverseGeocodeAsync(
      { latitude, longitude }
    );

    if (addresses.length === 0) return null;

    const address = addresses[0];

    return {
      street: address.street ?? undefined,
      streetNumber: address.streetNumber ?? undefined,
      city: address.city ?? undefined,
      region: address.region ?? undefined,
      postalCode: address.postalCode ?? undefined,
      country: address.country ?? undefined,
      name: address.name ?? undefined,
      formattedAddress: formatAddress(address),
    };
  } catch (error) {
    console.error('Failed to reverse geocode location:', error);
    return null;
  }
}

/**
 * Format address object into readable string
 */
export function formatAddress(address: Location.LocationGeocodedAddress): string {
  const parts = [
    address.streetNumber,
    address.street,
    address.city,
    address.region,
    address.postalCode,
    address.country,
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * Calculate distance between two locations in meters
 */
export function calculateDistance(
  location1: LocationData,
  location2: LocationData
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (location1.latitude * Math.PI) / 180;
  const φ2 = (location2.latitude * Math.PI) / 180;
  const Δφ = ((location2.latitude - location1.latitude) * Math.PI) / 180;
  const Δλ = ((location2.longitude - location1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if location services are enabled
 */
export async function hasLocationServicesEnabled(): Promise<boolean> {
  try {
    return await Location.hasServicesEnabledAsync();
  } catch (error) {
    console.error('Failed to check location services:', error);
    return false;
  }
}

/**
 * Open location settings
 */
export async function openLocationSettings(): Promise<void> {
  try {
    await Location.enableNetworkProviderAsync();
  } catch (error) {
    console.error('Failed to open location settings:', error);
  }
}
