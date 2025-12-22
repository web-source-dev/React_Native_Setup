import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetInfoStateType;
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

/**
 * Get current network state
 */
export async function getNetworkState(): Promise<NetworkState> {
  try {
    const state = await NetInfo.fetch();

    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isWifi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
      details: state.details,
    };
  } catch (error) {
    console.error('Failed to get network state:', error);
    return {
      isConnected: false,
      isInternetReachable: null,
      type: 'unknown' as NetInfoStateType,
      isWifi: false,
      isCellular: false,
      details: null,
    };
  }
}

/**
 * Check if device is online (has internet connectivity)
 */
export async function isDeviceOnline(): Promise<boolean> {
  try {
    const state = await getNetworkState();
    return state.isConnected && state.isInternetReachable === true;
  } catch (error) {
    console.error('Failed to check online status:', error);
    return false;
  }
}

/**
 * Get network status information
 */
export async function getNetworkStatus(): Promise<NetworkStatus> {
  try {
    const state = await getNetworkState();

    return {
      isOnline: state.isConnected && state.isInternetReachable === true,
      connectionType: state.type,
      isWifiEnabled: state.isWifi,
      isCellularEnabled: state.isCellular,
      strength: state.details?.strength,
      carrier: state.details?.carrier,
    };
  } catch (error) {
    console.error('Failed to get network status:', error);
    return {
      isOnline: false,
      connectionType: 'unknown',
      isWifiEnabled: false,
      isCellularEnabled: false,
    };
  }
}

/**
 * Check if network is metered (limited data)
 */
export function isNetworkMetered(networkState: NetworkState): boolean {
  // Consider cellular networks as metered by default
  if (networkState.isCellular) {
    return true;
  }

  // Check if wifi details indicate metered connection
  if (networkState.details?.isConnectionExpensive) {
    return true;
  }

  return false;
}

/**
 * Get connection quality description
 */
export function getConnectionQuality(networkState: NetworkState): 'excellent' | 'good' | 'fair' | 'poor' | 'offline' {
  if (!networkState.isConnected || !networkState.isInternetReachable) {
    return 'offline';
  }

  if (networkState.isWifi) {
    return 'excellent';
  }

  if (networkState.isCellular) {
    const strength = networkState.details?.strength;
    if (strength >= 75) return 'excellent';
    if (strength >= 50) return 'good';
    if (strength >= 25) return 'fair';
    return 'poor';
  }

  return 'good';
}
