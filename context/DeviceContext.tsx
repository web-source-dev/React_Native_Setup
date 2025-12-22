import React, { createContext, useContext, useState, useCallback } from 'react';
import { useDevice, DeviceInfo } from '../hooks';

interface DeviceContextType {
  // Device hook
  device: ReturnType<typeof useDevice>;

  // Enhanced state
  deviceCapabilities: {
    hasLocation: boolean;
    hasCamera: boolean;
    hasMicrophone: boolean;
    hasBiometric: boolean;
    hasNFC: boolean;
    hasBluetooth: boolean;
  };

  // Actions
  updateDeviceCapabilities: (capabilities: Partial<DeviceContextType['deviceCapabilities']>) => void;
  getDeviceSummary: () => string;
  isLowEndDevice: () => boolean;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const device = useDevice();
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceContextType['deviceCapabilities']>({
    hasLocation: false,
    hasCamera: false,
    hasMicrophone: false,
    hasBiometric: false,
    hasNFC: false,
    hasBluetooth: false,
  });

  const updateDeviceCapabilities = useCallback((capabilities: Partial<DeviceContextType['deviceCapabilities']>) => {
    setDeviceCapabilities(prev => ({ ...prev, ...capabilities }));
  }, []);

  const getDeviceSummary = useCallback((): string => {
    if (!device.deviceInfo) return 'Device info not available';

    const { deviceInfo, deviceType, platformInfo } = device;
    return `${deviceInfo.brand} ${deviceInfo.modelName} (${deviceType}) - ${platformInfo.os} ${platformInfo.version}`;
  }, [device]);

  const isLowEndDevice = useCallback((): boolean => {
    if (!device.deviceInfo) return false;

    // Consider devices with small screens or old OS versions as low-end
    const { screenInfo, platformInfo } = device;

    // Small screen
    if (screenInfo.width * screenInfo.height < 1000000) { // Less than ~1M pixels
      return true;
    }

    // Old Android version
    if (platformInfo.isAndroid) {
      const majorVersion = parseInt(platformInfo.version.split('.')[0]);
      if (majorVersion < 8) { // Android 8.0+
        return true;
      }
    }

    return false;
  }, [device]);

  const value: DeviceContextType = {
    device,
    deviceCapabilities,
    updateDeviceCapabilities,
    getDeviceSummary,
    isLowEndDevice,
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDeviceContext(): DeviceContextType {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDeviceContext must be used within a DeviceProvider');
  }
  return context;
}
