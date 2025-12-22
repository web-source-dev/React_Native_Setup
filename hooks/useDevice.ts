import { useState, useEffect, useCallback } from 'react';
import {
  getDeviceInfo,
  getDeviceType,
  isRealDevice,
  getPlatformInfo,
  getAppInfo,
  getScreenInfo,
  DeviceInfo,
} from '../utils';

export interface DeviceHookReturn {
  // Device info
  deviceInfo: DeviceInfo | null;

  // Device operations
  refreshDeviceInfo: () => Promise<void>;

  // Utility getters
  deviceType: string;
  isRealDevice: boolean;
  platformInfo: ReturnType<typeof getPlatformInfo>;
  appInfo: ReturnType<typeof getAppInfo>;
  screenInfo: ReturnType<typeof getScreenInfo>;

  // State
  isLoading: boolean;
  error: string | null;
}

export function useDevice(): DeviceHookReturn {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [deviceType, setDeviceType] = useState<string>('Unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize device info on mount
  useEffect(() => {
    refreshDeviceInfo();
  }, []);

  const refreshDeviceInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [info, type] = await Promise.all([
        getDeviceInfo(),
        getDeviceType(),
      ]);

      setDeviceInfo(info);
      setDeviceType(type);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get device info';
      setError(errorMessage);
      console.error('Device info refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Computed properties
  const isRealDeviceValue = isRealDevice();
  const platformInfo = getPlatformInfo();
  const appInfo = getAppInfo();
  const screenInfo = getScreenInfo();

  return {
    // Device info
    deviceInfo,

    // Device operations
    refreshDeviceInfo,

    // Utility getters
    deviceType,
    isRealDevice: isRealDeviceValue,
    platformInfo,
    appInfo,
    screenInfo,

    // State
    isLoading,
    error,
  };
}
