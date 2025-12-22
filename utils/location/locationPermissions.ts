import * as Location from 'expo-location';

export interface LocationPermissions {
  granted: boolean;
  canAskAgain: boolean;
  status: Location.PermissionStatus;
}

export interface LocationPermissionOptions {
  accuracy?: Location.Accuracy;
  purpose?: string;
}

/**
 * Request location permissions
 */
export async function requestLocationPermissions(
  options: LocationPermissionOptions = {}
): Promise<LocationPermissions> {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

    return {
      granted: status === Location.PermissionStatus.GRANTED,
      canAskAgain,
      status,
    };
  } catch (error) {
    console.error('Failed to request location permissions:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: Location.PermissionStatus.DENIED,
    };
  }
}

/**
 * Check current location permissions status
 */
export async function getLocationPermissions(): Promise<LocationPermissions> {
  try {
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();

    return {
      granted: status === Location.PermissionStatus.GRANTED,
      canAskAgain,
      status,
    };
  } catch (error) {
    console.error('Failed to get location permissions:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: Location.PermissionStatus.DENIED,
    };
  }
}

/**
 * Request background location permissions
 */
export async function requestBackgroundLocationPermissions(): Promise<LocationPermissions> {
  try {
    const { status, canAskAgain } = await Location.requestBackgroundPermissionsAsync();

    return {
      granted: status === Location.PermissionStatus.GRANTED,
      canAskAgain,
      status,
    };
  } catch (error) {
    console.error('Failed to request background location permissions:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: Location.PermissionStatus.DENIED,
    };
  }
}
