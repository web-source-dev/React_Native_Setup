import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';
import { NetworkState } from './networkStatus';

export interface NetworkWatcherCallbacks {
  onNetworkChange?: (state: NetworkState) => void;
  onConnectionLost?: () => void;
  onConnectionRestored?: (connectionType: string) => void;
  onStatusChange?: (isConnected: boolean) => void;
}

export interface NetworkSubscription {
  remove: () => void;
}

/**
 * Network watcher class for monitoring network changes
 */
export class NetworkWatcher {
  private subscription: NetInfoSubscription | null = null;
  private callbacks: NetworkWatcherCallbacks;
  private lastConnectionState: boolean = false;

  constructor(callbacks: NetworkWatcherCallbacks = {}) {
    this.callbacks = callbacks;
  }

  /**
   * Start watching network changes
   */
  startWatching(): void {
    if (this.subscription) {
      console.warn('Network watcher is already running');
      return;
    }

    this.subscription = NetInfo.addEventListener(state => {
      const networkState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
        details: state.details,
      };

      // Check for connection state changes
      const isCurrentlyConnected = networkState.isConnected && networkState.isInternetReachable === true;

      if (isCurrentlyConnected !== this.lastConnectionState) {
        if (isCurrentlyConnected) {
          this.callbacks.onConnectionRestored?.(networkState.type);
        } else {
          this.callbacks.onConnectionLost?.();
        }
        this.callbacks.onStatusChange?.(isCurrentlyConnected);
        this.lastConnectionState = isCurrentlyConnected;
      }

      // Always call the network change callback
      this.callbacks.onNetworkChange?.(networkState);
    });
  }

  /**
   * Stop watching network changes
   */
  stopWatching(): void {
    if (this.subscription) {
      this.subscription();
      this.subscription = null;
    }
  }

  /**
   * Update callbacks
   */
  setCallbacks(callbacks: NetworkWatcherCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Check if watcher is active
   */
  isWatching(): boolean {
    return this.subscription !== null;
  }
}

/**
 * Create and start a network watcher (convenience function)
 */
export function watchNetwork(callbacks: NetworkWatcherCallbacks = {}): NetworkWatcher {
  const watcher = new NetworkWatcher(callbacks);
  watcher.startWatching();
  return watcher;
}

/**
 * Get current network state and watch for changes
 */
export async function getNetworkStateAndWatch(
  callbacks: NetworkWatcherCallbacks = {}
): Promise<{ state: NetworkState; watcher: NetworkWatcher }> {
  const watcher = new NetworkWatcher(callbacks);
  watcher.startWatching();

  // Get initial state
  const { getNetworkState } = await import('./networkStatus');
  const state = await getNetworkState();

  return { state, watcher };
}
