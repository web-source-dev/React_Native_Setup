/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, User, LoginCredentials, RegisterData, ForgotPasswordData, ResetPasswordData, VerifyOTPData } from '../api/auth';
import { apiClient, ApiError } from '../api/apibase';

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  verifyOTP: (data: VerifyOTPData) => Promise<{ token: string }>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user from storage on mount
   */
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await authApi.getStoredUser();
        const hasToken = await authApi.isAuthenticated();

        if (storedUser && hasToken) {
          setUser(storedUser);
          setIsAuthenticated(true);

          // Verify token is still valid by fetching profile
          try {
            const profileResponse = await authApi.getProfile();
            if (profileResponse.success && profileResponse.data) {
              setUser(profileResponse.data.user);
            } else {
              // Token invalid, clear auth
              await authApi.logout();
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (err) {
            // Token invalid, clear auth
            await authApi.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('Failed to load stored user:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.login(credentials);

      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Login failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.register(data);

      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Registration failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Clear state even if logout fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request password reset
   */
  const forgotPassword = useCallback(async (data: ForgotPasswordData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.forgotPassword(data);

      if (!response.success) {
        throw new Error(response.message || 'Failed to send password reset email');
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to send password reset email';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verify OTP for password reset
   */
  const verifyOTP = useCallback(async (data: VerifyOTPData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.verifyOTP(data);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'OTP verification failed');
      }

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : err instanceof Error
        ? err.message
        : 'OTP verification failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset password
   */
  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.resetPassword(data);

      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || 'Password reset failed');
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Password reset failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.updateProfile(data);

      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Profile update failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh user data from server
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getProfile();
      if (response.success && response.data) {
        setUser(response.data.user);
        await apiClient.setUser(response.data.user);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    verifyOTP,
    resetPassword,
    updateProfile,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

