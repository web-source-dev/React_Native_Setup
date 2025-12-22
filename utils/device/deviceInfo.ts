import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import { Dimensions, Platform } from 'react-native';

export interface DeviceInfo {
  // Basic device info
  brand: string;
  manufacturer: string;
  modelName: string;
  modelId: string;
  designName: string;
  productName: string;
  deviceName: string;

  // OS info
  osName: string;
  osVersion: string;
  osBuildId: string;
  osInternalBuildId: string;

  // Platform info
  platformApiLevel: number;
  deviceType: string;
  isDevice: boolean;

  // App info
  appName: string;
  appVersion: string;
  appBuildVersion: string;
  applicationId: string;

  // Hardware info
  screenWidth: number;
  screenHeight: number;
  screenScale: number;
  pixelRatio: number;

  // Memory and storage (estimated)
  totalMemory?: number;
  freeMemory?: number;
  totalDiskCapacity?: number;
  freeDiskStorage?: number;
}

/**
 * Get comprehensive device information
 */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  try {
    const { width, height, scale } = Dimensions.get('window');

    // Get device info
    const deviceInfo = {
      brand: Device.brand || 'Unknown',
      manufacturer: Device.manufacturer || 'Unknown',
      modelName: Device.modelName || 'Unknown',
      modelId: Device.modelId || 'Unknown',
      designName: Device.designName || 'Unknown',
      productName: Device.productName || 'Unknown',
      deviceName: await Device.getDeviceTypeAsync() === Device.DeviceType.PHONE ? 'Phone' :
                  await Device.getDeviceTypeAsync() === Device.DeviceType.TABLET ? 'Tablet' :
                  await Device.getDeviceTypeAsync() === Device.DeviceType.DESKTOP ? 'Desktop' :
                  await Device.getDeviceTypeAsync() === Device.DeviceType.TV ? 'TV' : 'Unknown',

      osName: Device.osName || Platform.OS,
      osVersion: Device.osVersion || 'Unknown',
      osBuildId: Device.osBuildId || 'Unknown',
      osInternalBuildId: Device.osInternalBuildId || 'Unknown',

      platformApiLevel: Device.platformApiLevel || 0,
      deviceType: await Device.getDeviceTypeAsync() === Device.DeviceType.PHONE ? 'phone' :
                  await Device.getDeviceTypeAsync() === Device.DeviceType.TABLET ? 'tablet' :
                  await Device.getDeviceTypeAsync() === Device.DeviceType.DESKTOP ? 'desktop' :
                  await Device.getDeviceTypeAsync() === Device.DeviceType.TV ? 'tv' : 'unknown',
      isDevice: Device.isDevice,
    };

    // Get app info
    const appInfo = {
      appName: Application.applicationName || Constants.expoConfig?.name || 'Unknown',
      appVersion: Application.nativeApplicationVersion || Constants.expoConfig?.version || 'Unknown',
      appBuildVersion: Application.nativeBuildVersion || 'Unknown',
      applicationId: Application.applicationId || Constants.expoConfig?.android?.package || 'Unknown',
    };

    // Get screen info
    const screenInfo = {
      screenWidth: width,
      screenHeight: height,
      screenScale: scale,
      pixelRatio: Dimensions.get('screen').scale || scale,
    };

    return {
      ...deviceInfo,
      ...appInfo,
      ...screenInfo,
    };
  } catch (error) {
    console.error('Failed to get device info:', error);
    return {
      brand: 'Unknown',
      manufacturer: 'Unknown',
      modelName: 'Unknown',
      modelId: 'Unknown',
      designName: 'Unknown',
      productName: 'Unknown',
      deviceName: 'Unknown',

      osName: Platform.OS,
      osVersion: 'Unknown',
      osBuildId: 'Unknown',
      osInternalBuildId: 'Unknown',

      platformApiLevel: 0,
      deviceType: 'unknown',
      isDevice: false,

      appName: 'Unknown',
      appVersion: 'Unknown',
      appBuildVersion: 'Unknown',
      applicationId: 'Unknown',

      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,
      screenScale: Dimensions.get('window').scale,
      pixelRatio: Dimensions.get('screen').scale || Dimensions.get('window').scale,
    };
  }
}

/**
 * Get device type string
 */
export async function getDeviceType(): Promise<string> {
  try {
    const deviceType = await Device.getDeviceTypeAsync();
    switch (deviceType) {
      case Device.DeviceType.PHONE:
        return 'Phone';
      case Device.DeviceType.TABLET:
        return 'Tablet';
      case Device.DeviceType.DESKTOP:
        return 'Desktop';
      case Device.DeviceType.TV:
        return 'TV';
      default:
        return 'Unknown';
    }
  } catch (error) {
    console.error('Failed to get device type:', error);
    return 'Unknown';
  }
}

/**
 * Check if device is a real device or emulator/simulator
 */
export function isRealDevice(): boolean {
  return Device.isDevice;
}

/**
 * Get device platform info
 */
export function getPlatformInfo(): {
  os: string;
  version: string;
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
} {
  return {
    os: Platform.OS,
    version: Platform.Version as string,
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    isWeb: Platform.OS === 'web',
  };
}

/**
 * Get app info
 */
export function getAppInfo(): {
  name: string;
  version: string;
  buildVersion: string;
  applicationId: string;
} {
  return {
    name: Application.applicationName || Constants.expoConfig?.name || 'Unknown',
    version: Application.nativeApplicationVersion || Constants.expoConfig?.version || 'Unknown',
    buildVersion: Application.nativeBuildVersion || 'Unknown',
    applicationId: Application.applicationId || Constants.expoConfig?.android?.package || 'Unknown',
  };
}

/**
 * Get screen dimensions
 */
export function getScreenInfo(): {
  width: number;
  height: number;
  scale: number;
  pixelRatio: number;
  isPortrait: boolean;
  isLandscape: boolean;
} {
  const { width, height, scale } = Dimensions.get('window');
  const pixelRatio = Dimensions.get('screen').scale || scale;

  return {
    width,
    height,
    scale,
    pixelRatio,
    isPortrait: height > width,
    isLandscape: width > height,
  };
}
