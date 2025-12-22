import React, { createContext, useContext, useState, useCallback } from 'react';
import { useLocation, LocationWithAddress, LocationOptions, ReverseGeocodeOptions, LocationWatcherCallbacks } from '../hooks';

interface LocationContextType {
  // Location hook
  location: ReturnType<typeof useLocation>;

  // Enhanced state
  savedLocations: LocationWithAddress[];
  locationHistory: LocationWithAddress[];

  // Actions
  saveCurrentLocation: () => Promise<void>;
  clearLocationHistory: () => void;
  getLocationForMedia: (mediaId?: string) => Promise<LocationWithAddress | null>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [savedLocations, setSavedLocations] = useState<LocationWithAddress[]>([]);
  const [locationHistory, setLocationHistory] = useState<LocationWithAddress[]>([]);

  const saveCurrentLocation = useCallback(async () => {
    if (location.currentLocation) {
      const locationToSave = { ...location.currentLocation, timestamp: Date.now() };
      setSavedLocations(prev => [locationToSave, ...prev.slice(0, 9)]); // Keep last 10
      setLocationHistory(prev => [locationToSave, ...prev.slice(0, 49)]); // Keep last 50

      console.log('Location saved:', {
        latitude: locationToSave.latitude,
        longitude: locationToSave.longitude,
        address: locationToSave.address?.formattedAddress,
      });
    }
  }, [location.currentLocation]);

  const clearLocationHistory = useCallback(() => {
    setLocationHistory([]);
    setSavedLocations([]);
  }, []);

  const getLocationForMedia = useCallback(async (
    mediaId?: string
  ): Promise<LocationWithAddress | null> => {
    try {
      // Try to get current location
      const current = await location.getCurrentLocationWithAddress();
      if (current) {
        return current;
      }

      // Fallback to last saved location
      return locationHistory[0] || null;
    } catch (error) {
      console.error('Failed to get location for media:', error);
      return null;
    }
  }, [location, locationHistory]);

  const value: LocationContextType = {
    location,
    savedLocations,
    locationHistory,
    saveCurrentLocation,
    clearLocationHistory,
    getLocationForMedia,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext(): LocationContextType {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}
