import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getNetworkState,
  getNetworkStatus,
  isDeviceOnline,
  NetworkState,
  NetworkStatus,
  NetworkWatcher,
  NetworkWatcherCallbacks,
} from '../utils';

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

export function useNetwork(): NetworkHookReturn {
  const [networkState, setNetworkState] = useState<NetworkState | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWatchingNetwork, setIsWatchingNetwork] = useState(false);

  const watcherRef = useRef<NetworkWatcher | null>(null);

  // Initialize network state on mount
  useEffect(() => {
    refreshNetworkState();

    return () => {
      if (watcherRef.current) {
        watcherRef.current.stopWatching();
      }
    };
  }, []);

  const refreshNetworkState = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [state, status, online] = await Promise.all([
        getNetworkState(),
        getNetworkStatus(),
        isDeviceOnline(),
      ]);

      setNetworkState(state);
      setNetworkStatus(status);
      setIsOnline(online);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get network state';
      setError(errorMessage);
      console.error('Network state refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkOnlineStatus = useCallback(async (): Promise<boolean> => {
    try {
      const online = await isDeviceOnline();
      setIsOnline(online);
      return online;
    } catch (err) {
      console.error('Online status check failed:', err);
      return false;
    }
  }, []);

  const startWatchingNetwork = useCallback((callbacks: NetworkWatcherCallbacks = {}) => {
    if (isWatchingNetwork) {
      console.warn('Network watching is already active');
      return;
    }

    const combinedCallbacks: NetworkWatcherCallbacks = {
      onNetworkChange: (state) => {
        setNetworkState(state);
        setIsOnline(state.isConnected && state.isInternetReachable === true);
        callbacks.onNetworkChange?.(state);
      },
      onConnectionLost: () => {
        setIsOnline(false);
        callbacks.onConnectionLost?.();
      },
      onConnectionRestored: (connectionType) => {
        setIsOnline(true);
        callbacks.onConnectionRestored?.(connectionType);
      },
      onStatusChange: (connected) => {
        setIsOnline(connected);
        callbacks.onStatusChange?.(connected);
      },
    };

    watcherRef.current = new NetworkWatcher(combinedCallbacks);
    watcherRef.current.startWatching();
    setIsWatchingNetwork(true);
  }, [isWatchingNetwork]);

  const stopWatchingNetwork = useCallback(() => {
    if (watcherRef.current) {
      watcherRef.current.stopWatching();
      watcherRef.current = null;
    }
    setIsWatchingNetwork(false);
  }, []);

  return {
    // Network state
    networkState,
    networkStatus,
    isOnline,

    // Network operations
    refreshNetworkState,
    checkOnlineStatus,

    // Network watching
    startWatchingNetwork,
    stopWatchingNetwork,
    isWatchingNetwork,

    // State
    isLoading,
    error,
  };
}
