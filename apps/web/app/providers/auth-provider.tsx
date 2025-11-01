'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, SessionInfo } from '../lib/shared-types';
import { apiClient } from '../lib/api-client';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (provider: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = async () => {
    try {
      // Check if we have a token in localStorage
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
          // Try to get user profile using the token
          try {
            const response = await apiClient.get<any>('/auth/me');
            const profileData = response.data?.user || response.data;
            if (profileData && profileData.email) {
              // Map the profile data to AuthUser format
              setUser({
                id: profileData.id,
                email: profileData.email,
                username: profileData.username || profileData.email.split('@')[0],
                kycStatus: profileData.kycStatus,
              });
              return;
            }
          } catch (e) {
            // If profile fetch fails, try session endpoint
            console.error('Profile fetch failed:', e);
          }
        }
      }

      const response = await apiClient.get<SessionInfo>('/auth/session');
      if (response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      setUser(null);
    }
  };

  const login = async (provider: string) => {
    // Redirect to OAuth provider
    const redirectUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/${provider}`;
    window.location.href = redirectUrl;
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always clear local state and storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      await refreshSession();
      setIsLoading(false);
    };

    initializeAuth();

    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      // Remove auth params from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Refresh session to get user data
      refreshSession();
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
