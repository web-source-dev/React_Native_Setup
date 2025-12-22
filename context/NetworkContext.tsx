import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNetwork, NetworkState, NetworkStatus, NetworkWatcherCallbacks } from '../hooks';

interface NetworkContextType {
  // Network hook
  network: ReturnType<typeof useNetwork>;

  // Enhanced state
  connectionHistory: Array<{
    timestamp: number;
    state: NetworkState;
    status: NetworkStatus;
  }>;

  // Actions
  logNetworkChange: (state: NetworkState, status: NetworkStatus) => void;
  clearConnectionHistory: () => void;
  getConnectionQuality: () => 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  isNetworkMetered: () => boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const network = useNetwork();
  const [connectionHistory, setConnectionHistory] = useState<Array<{
    timestamp: number;
    state: NetworkState;
    status: NetworkStatus;
  }>>([]);

  const logNetworkChange = useCallback((state: NetworkState, status: NetworkStatus) => {
    const entry = {
      timestamp: Date.now(),
      state,
      status,
    };

    setConnectionHistory(prev => [entry, ...prev.slice(0, 19)]); // Keep last 20 entries
  }, []);

  const clearConnectionHistory = useCallback(() => {
    setConnectionHistory([]);
  }, []);

  const getConnectionQuality = useCallback((): 'excellent' | 'good' | 'fair' | 'poor' | 'offline' => {
    if (!network.networkState) return 'offline';

    const { getConnectionQuality } = require('../utils/network');
    return getConnectionQuality(network.networkState);
  }, [network.networkState]);

  const isNetworkMeteredValue = useCallback((): boolean => {
    if (!network.networkState) return false;

    const { isNetworkMetered } = require('../utils/network');
    return isNetworkMetered(network.networkState);
  }, [network.networkState]);

  const value: NetworkContextType = {
    network,
    connectionHistory,
    logNetworkChange,
    clearConnectionHistory,
    getConnectionQuality,
    isNetworkMetered: isNetworkMeteredValue,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetworkContext(): NetworkContextType {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetworkContext must be used within a NetworkProvider');
  }
  return context;
}
