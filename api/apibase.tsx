/**
 * API Base Configuration
 * 
 * Centralized API client that handles all backend communication.
 * Automatically includes authentication tokens in all requests.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.2:5000/api';
const TOKEN_KEY = '@apex_auth_token';
const USER_KEY = '@apex_user';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

// API Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API Client Class
 * Handles all HTTP requests with automatic token injection
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Get stored authentication token
   */
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  /**
   * Set authentication token
   */
  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to save auth token:', error);
      throw error;
    }
  }

  /**
   * Remove authentication token
   */
  async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Failed to remove auth token:', error);
    }
  }

  /**
   * Get stored user data
   */
  async getUser(): Promise<any | null> {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  /**
   * Set user data
   */
  async setUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user:', error);
      throw error;
    }
  }

  /**
   * Make HTTP request with automatic token injection
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const token = await this.getAuthToken();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      // Add auth token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const config: RequestInit = {
        ...options,
        headers,
      };

      console.log(`[API] ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Handle 401 Unauthorized - token might be expired
        if (response.status === 401) {
          await this.removeAuthToken();
          throw new ApiError(
            data.message || 'Authentication failed. Please login again.',
            response.status,
            data
          );
        }

        throw new ApiError(
          data.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data
        );
      }

      return {
        success: data.success !== false,
        message: data.message || 'Request successful',
        data: data.data !== undefined ? data.data : data,
        errors: data.errors,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new ApiError(
          'Network request failed - check your connection and server URL',
          0
        );
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export token management functions for convenience
export const getAuthToken = () => apiClient.getAuthToken();
export const setAuthToken = (token: string) => apiClient.setAuthToken(token);
export const removeAuthToken = () => apiClient.removeAuthToken();
export const getUser = () => apiClient.getUser();
export const setUser = (user: any) => apiClient.setUser(user);

