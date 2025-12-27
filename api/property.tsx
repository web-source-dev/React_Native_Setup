/**
 * Property API
 * 
 * All property-related API calls
 * Properties are read-only on mobile - they are only created/updated on the web version
 */

import { apiClient, ApiResponse } from './apibase';

// Property types matching backend model
export interface PropertyUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface Property {
  _id: string;
  homeowner: PropertyUser | string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  propertyType: 'Single Family' | 'Townhouse' | 'Condo' | 'Multi-Family' | 'Other';
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  yearBuilt?: number;
  lotSize?: number;
  assignedAPS_Reno?: PropertyUser | string;
  assignedAPS_RE?: PropertyUser | string;
  assignedExternalAgent?: PropertyUser | string;
  assignedAPS_Ops?: PropertyUser | string;
  targetStartDate?: string;
  targetListingDate?: string;
  targetBackstopDate?: string;
  permitsLikely?: boolean;
  structuralRisk?: boolean;
  occupancy?: 'Occupied' | 'Vacant' | 'Unknown';
  status: 'new' | 'contacted' | 'scheduled' | 'qualified' | 'disqualified' | 'in-contract' | 'in-progress' | 'listing' | 'on-market' | 'under-contract' | 'closing' | 'closed' | 'cancelled';
  phase: 'inquiry' | 'intake' | 'site-visit' | 'scoping' | 'pricing' | 'contract' | 'pre-construction' | 'construction' | 'listing-prep' | 'on-market' | 'backstop' | 'contract-to-close' | 'closing' | 'post-close';
  notes?: string;
  goals?: string;
  painPoints?: string;
  budgetComfort?: string;
  leadSource?: 'Homeowner' | 'External Agent';
  createdBy?: PropertyUser | string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertiesResponse {
  properties: Property[];
  count: number;
}

export interface PropertyResponse {
  property: Property;
}

export interface PropertyFilters {
  status?: string;
  phase?: string;
  homeowner?: string;
  assignedAPS_Reno?: string;
  assignedAPS_RE?: string;
  assignedExternalAgent?: string;
  city?: string;
  state?: string;
  search?: string;
}

/**
 * Property API functions
 */
export const propertyApi = {
  /**
   * Get all properties (with optional filters)
   * The backend handles role-based filtering automatically
   */
  getAll: async (filters?: PropertyFilters): Promise<ApiResponse<PropertiesResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiClient.get<PropertiesResponse>(endpoint);
  },

  /**
   * Get property by ID
   */
  getById: async (id: string): Promise<ApiResponse<PropertyResponse>> => {
    return await apiClient.get<PropertyResponse>(`/properties/${id}`);
  },
};

