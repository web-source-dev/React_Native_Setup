/**
 * Property Context
 * 
 * Provides property state and methods throughout the app
 * Properties are read-only on mobile - they are synced from the server
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { propertyApi, Property, PropertyFilters } from '../api/property';
import { apiClient, ApiError } from '../api/apibase';
import { getAllProperties, getPropertyById, getPropertiesByStatus, getPropertiesByPhase } from '../lib/database/repositories/property';
import { useSync } from '../lib/database/sync/hooks/useSync';
import { useDatabaseContext } from '../lib/database/DatabaseProvider';

interface PropertyContextType {
  // State
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  lastSyncTime: number | null;

  // Actions
  refreshProperties: (filters?: PropertyFilters) => Promise<void>;
  getPropertyById: (id: number) => Promise<Property | null>;
  getPropertiesByStatus: (status: string) => Promise<Property[]>;
  getPropertiesByPhase: (phase: string) => Promise<Property[]>;
  syncProperties: () => Promise<void>;
  clearError: () => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const { syncModel } = useSync();
  const { isInitialized: dbInitialized } = useDatabaseContext();

  /**
   * Load properties from local database
   */
  const loadPropertiesFromLocal = useCallback(async (filters?: PropertyFilters) => {
    if (!dbInitialized) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get properties from local database
      let localProperties = await getAllProperties();

      // Apply filters if provided
      if (filters) {
        if (filters.status) {
          localProperties = await getPropertiesByStatus(filters.status);
        }
        if (filters.phase) {
          localProperties = await getPropertiesByPhase(filters.phase);
        }
      }

      // Convert local properties to Property format (with populated user objects if needed)
      // Include local database ID for navigation
      const convertedProperties = localProperties.map(prop => ({
        _id: prop.remoteId || prop.id.toString(),
        id: prop.id, // Include local database ID
        homeowner: prop.homeownerId || '',
        address: prop.address,
        city: prop.city,
        state: prop.state,
        zipCode: prop.zipCode,
        country: prop.country || 'USA',
        propertyType: prop.propertyType as Property['propertyType'],
        bedrooms: prop.bedrooms || undefined,
        bathrooms: prop.bathrooms || undefined,
        squareFootage: prop.squareFootage || undefined,
        yearBuilt: prop.yearBuilt || undefined,
        lotSize: prop.lotSize || undefined,
        assignedAPS_Reno: prop.assignedAPS_RenoId || undefined,
        assignedAPS_RE: prop.assignedAPS_REId || undefined,
        assignedExternalAgent: prop.assignedExternalAgentId || undefined,
        assignedAPS_Ops: prop.assignedAPS_OpsId || undefined,
        targetStartDate: prop.targetStartDate ? new Date(prop.targetStartDate).toISOString() : undefined,
        targetListingDate: prop.targetListingDate ? new Date(prop.targetListingDate).toISOString() : undefined,
        targetBackstopDate: prop.targetBackstopDate ? new Date(prop.targetBackstopDate).toISOString() : undefined,
        permitsLikely: prop.permitsLikely || undefined,
        structuralRisk: prop.structuralRisk || undefined,
        occupancy: prop.occupancy as Property['occupancy'],
        status: prop.status as Property['status'],
        phase: prop.phase as Property['phase'],
        notes: prop.notes || undefined,
        goals: prop.goals || undefined,
        painPoints: prop.painPoints || undefined,
        budgetComfort: prop.budgetComfort || undefined,
        leadSource: prop.leadSource as Property['leadSource'],
        createdBy: prop.createdById || undefined,
        isDeleted: prop.isDeleted || false,
        createdAt: new Date(prop.createdAt).toISOString(),
        updatedAt: new Date(prop.updatedAt).toISOString(),
      } as Property & { id: number }));

      setProperties(convertedProperties);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load properties';
      setError(errorMessage);
      console.error('Failed to load properties from local database:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dbInitialized]);

  /**
   * Refresh properties from local database
   */
  const refreshProperties = useCallback(async (filters?: PropertyFilters) => {
    await loadPropertiesFromLocal(filters);
  }, [loadPropertiesFromLocal]);

  /**
   * Sync properties from server
   */
  const syncProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use sync system to sync properties
      const result = await syncModel('property', { pullOnly: true });
      
      if (result.success) {
        setLastSyncTime(Date.now());
        // Reload properties from local database after sync
        await loadPropertiesFromLocal();
      } else {
        throw new Error(result.errors?.join(', ') || 'Sync failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync properties';
      setError(errorMessage);
      console.error('Failed to sync properties:', err);
    } finally {
      setIsLoading(false);
    }
  }, [syncModel, loadPropertiesFromLocal]);

  /**
   * Get property by ID from local database
   */
  const getPropertyByIdLocal = useCallback(async (id: number): Promise<Property | null> => {
    if (!dbInitialized) return null;

    try {
      const localProperty = await getPropertyById(id);
      if (!localProperty) return null;

      // Convert to Property format
      return {
        _id: localProperty.remoteId || localProperty.id.toString(),
        id: localProperty.id, // Include local database ID
        homeowner: localProperty.homeownerId || '',
        address: localProperty.address,
        city: localProperty.city,
        state: localProperty.state,
        zipCode: localProperty.zipCode,
        country: localProperty.country || 'USA',
        propertyType: localProperty.propertyType as Property['propertyType'],
        bedrooms: localProperty.bedrooms || undefined,
        bathrooms: localProperty.bathrooms || undefined,
        squareFootage: localProperty.squareFootage || undefined,
        yearBuilt: localProperty.yearBuilt || undefined,
        lotSize: localProperty.lotSize || undefined,
        assignedAPS_Reno: localProperty.assignedAPS_RenoId || undefined,
        assignedAPS_RE: localProperty.assignedAPS_REId || undefined,
        assignedExternalAgent: localProperty.assignedExternalAgentId || undefined,
        assignedAPS_Ops: localProperty.assignedAPS_OpsId || undefined,
        targetStartDate: localProperty.targetStartDate ? new Date(localProperty.targetStartDate).toISOString() : undefined,
        targetListingDate: localProperty.targetListingDate ? new Date(localProperty.targetListingDate).toISOString() : undefined,
        targetBackstopDate: localProperty.targetBackstopDate ? new Date(localProperty.targetBackstopDate).toISOString() : undefined,
        permitsLikely: localProperty.permitsLikely || undefined,
        structuralRisk: localProperty.structuralRisk || undefined,
        occupancy: localProperty.occupancy as Property['occupancy'],
        status: localProperty.status as Property['status'],
        phase: localProperty.phase as Property['phase'],
        notes: localProperty.notes || undefined,
        goals: localProperty.goals || undefined,
        painPoints: localProperty.painPoints || undefined,
        budgetComfort: localProperty.budgetComfort || undefined,
        leadSource: localProperty.leadSource as Property['leadSource'],
        createdBy: localProperty.createdById || undefined,
        isDeleted: localProperty.isDeleted || false,
        createdAt: new Date(localProperty.createdAt).toISOString(),
        updatedAt: new Date(localProperty.updatedAt).toISOString(),
      } as Property & { id: number };
    } catch (err) {
      console.error('Failed to get property by ID:', err);
      return null;
    }
  }, [dbInitialized]);

  /**
   * Get properties by status from local database
   */
  const getPropertiesByStatusLocal = useCallback(async (status: string): Promise<Property[]> => {
    if (!dbInitialized) return [];

    try {
      const localProperties = await getPropertiesByStatus(status);
      // Convert to Property format (similar to getPropertyByIdLocal)
      return localProperties.map(prop => ({
        _id: prop.remoteId || prop.id.toString(),
        homeowner: prop.homeownerId || '',
        address: prop.address,
        city: prop.city,
        state: prop.state,
        zipCode: prop.zipCode,
        country: prop.country || 'USA',
        propertyType: prop.propertyType as Property['propertyType'],
        bedrooms: prop.bedrooms || undefined,
        bathrooms: prop.bathrooms || undefined,
        squareFootage: prop.squareFootage || undefined,
        yearBuilt: prop.yearBuilt || undefined,
        lotSize: prop.lotSize || undefined,
        assignedAPS_Reno: prop.assignedAPS_RenoId || undefined,
        assignedAPS_RE: prop.assignedAPS_REId || undefined,
        assignedExternalAgent: prop.assignedExternalAgentId || undefined,
        assignedAPS_Ops: prop.assignedAPS_OpsId || undefined,
        targetStartDate: prop.targetStartDate ? new Date(prop.targetStartDate).toISOString() : undefined,
        targetListingDate: prop.targetListingDate ? new Date(prop.targetListingDate).toISOString() : undefined,
        targetBackstopDate: prop.targetBackstopDate ? new Date(prop.targetBackstopDate).toISOString() : undefined,
        permitsLikely: prop.permitsLikely || undefined,
        structuralRisk: prop.structuralRisk || undefined,
        occupancy: prop.occupancy as Property['occupancy'],
        status: prop.status as Property['status'],
        phase: prop.phase as Property['phase'],
        notes: prop.notes || undefined,
        goals: prop.goals || undefined,
        painPoints: prop.painPoints || undefined,
        budgetComfort: prop.budgetComfort || undefined,
        leadSource: prop.leadSource as Property['leadSource'],
        createdBy: prop.createdById || undefined,
        isDeleted: prop.isDeleted || false,
        createdAt: new Date(prop.createdAt).toISOString(),
        updatedAt: new Date(prop.updatedAt).toISOString(),
      } as Property));
    } catch (err) {
      console.error('Failed to get properties by status:', err);
      return [];
    }
  }, [dbInitialized]);

  /**
   * Get properties by phase from local database
   */
  const getPropertiesByPhaseLocal = useCallback(async (phase: string): Promise<Property[]> => {
    if (!dbInitialized) return [];

    try {
      const localProperties = await getPropertiesByPhase(phase);
      // Convert to Property format (similar to getPropertyByIdLocal)
      return localProperties.map(prop => ({
        _id: prop.remoteId || prop.id.toString(),
        id: prop.id, // Include local database ID
        homeowner: prop.homeownerId || '',
        address: prop.address,
        city: prop.city,
        state: prop.state,
        zipCode: prop.zipCode,
        country: prop.country || 'USA',
        propertyType: prop.propertyType as Property['propertyType'],
        bedrooms: prop.bedrooms || undefined,
        bathrooms: prop.bathrooms || undefined,
        squareFootage: prop.squareFootage || undefined,
        yearBuilt: prop.yearBuilt || undefined,
        lotSize: prop.lotSize || undefined,
        assignedAPS_Reno: prop.assignedAPS_RenoId || undefined,
        assignedAPS_RE: prop.assignedAPS_REId || undefined,
        assignedExternalAgent: prop.assignedExternalAgentId || undefined,
        assignedAPS_Ops: prop.assignedAPS_OpsId || undefined,
        targetStartDate: prop.targetStartDate ? new Date(prop.targetStartDate).toISOString() : undefined,
        targetListingDate: prop.targetListingDate ? new Date(prop.targetListingDate).toISOString() : undefined,
        targetBackstopDate: prop.targetBackstopDate ? new Date(prop.targetBackstopDate).toISOString() : undefined,
        permitsLikely: prop.permitsLikely || undefined,
        structuralRisk: prop.structuralRisk || undefined,
        occupancy: prop.occupancy as Property['occupancy'],
        status: prop.status as Property['status'],
        phase: prop.phase as Property['phase'],
        notes: prop.notes || undefined,
        goals: prop.goals || undefined,
        painPoints: prop.painPoints || undefined,
        budgetComfort: prop.budgetComfort || undefined,
        leadSource: prop.leadSource as Property['leadSource'],
        createdBy: prop.createdById || undefined,
        isDeleted: prop.isDeleted || false,
        createdAt: new Date(prop.createdAt).toISOString(),
        updatedAt: new Date(prop.updatedAt).toISOString(),
      } as Property));
    } catch (err) {
      console.error('Failed to get properties by phase:', err);
      return [];
    }
  }, [dbInitialized]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load properties on mount, but only when database is initialized
  useEffect(() => {
    if (dbInitialized) {
      loadPropertiesFromLocal();
    }
  }, [dbInitialized, loadPropertiesFromLocal]);

  const value: PropertyContextType = {
    properties,
    isLoading,
    error,
    lastSyncTime,
    refreshProperties,
    getPropertyById: getPropertyByIdLocal,
    getPropertiesByStatus: getPropertiesByStatusLocal,
    getPropertiesByPhase: getPropertiesByPhaseLocal,
    syncProperties,
    clearError,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

/**
 * Hook to use property context
 */
export function usePropertyContext(): PropertyContextType {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('usePropertyContext must be used within a PropertyProvider');
  }
  return context;
}

