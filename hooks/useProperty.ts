/**
 * useProperty Hook
 * 
 * React hook for accessing property functionality
 */

import { usePropertyContext } from '../context/PropertyContext';

/**
 * Hook to access property context
 * Provides access to properties, loading state, and property-related methods
 */
export function useProperty() {
  return usePropertyContext();
}

