/**
 * Authentication API
 * 
 * All authentication-related API calls
 */

import { apiClient, ApiResponse } from './apibase';

// User types
export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  profilePicture?: string;
  role: 'Homeowner' | 'externalAgent' | 'APS-RE' | 'APS-Reno' | 'APS-Ops' | 'Admin';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

/**
 * Authentication API functions
 */
export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    if (response.success && response.data) {
      // Store token and user
      await apiClient.setAuthToken(response.data.token);
      await apiClient.setUser(response.data.user);
    }
    
    return response;
  },

  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      // Store token and user
      await apiClient.setAuthToken(response.data.token);
      await apiClient.setUser(response.data.user);
    }
    
    return response;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await apiClient.removeAuthToken();
  },

  /**
   * Request password reset (sends OTP to email)
   */
  forgotPassword: async (data: ForgotPasswordData): Promise<ApiResponse> => {
    return await apiClient.post('/auth/forgot-password', data);
  },

  /**
   * Verify OTP for password reset
   */
  verifyOTP: async (data: VerifyOTPData): Promise<ApiResponse<{ token: string }>> => {
    // Note: This endpoint needs to be added to backend
    // For now, we'll use a workaround with the reset-password endpoint
    return await apiClient.post('/auth/verify-otp', data);
  },

  /**
   * Reset password with token/OTP
   */
  resetPassword: async (data: ResetPasswordData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<AuthResponse>('/auth/reset-password', data);
    
    if (response.success && response.data) {
      // Store new token and user
      await apiClient.setAuthToken(response.data.token);
      await apiClient.setUser(response.data.user);
    }
    
    return response;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    return await apiClient.get<{ user: User }>('/auth/profile');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.put<{ user: User }>('/auth/profile', data);
    
    if (response.success && response.data) {
      // Update stored user
      await apiClient.setUser(response.data.user);
    }
    
    return response;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await apiClient.getAuthToken();
    return !!token;
  },

  /**
   * Get stored user
   */
  getStoredUser: async (): Promise<User | null> => {
    return await apiClient.getUser();
  },
};

