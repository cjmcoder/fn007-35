import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api-client';
import { useProfile } from './useProfile';

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: string; // Changed from roles to role to match server response
  trustScore: number;
  tfaEnabled: boolean;
  isBanned: boolean;
  createdAt: string;
  lastLoginAt?: string;
  // Additional fields from server response
  kycStatus?: string;
  isAdmin?: boolean;
  reputation?: number;
  level?: number;
  experience?: number;
  walletBalance?: {
    fc: number;
    lockedFC: number;
  };
  profile?: {
    bio: string;
    location: string;
    timezone: string;
    avatarUrl: string;
  };
  stats?: {
    totalMatches: number;
    totalWins: number;
    totalLosses: number;
    winRate: number;
    totalEarnings: number;
    totalDeposits: number;
    totalWithdrawals: number;
  };
  flags?: {
    isHighRisk: boolean;
    isVip: boolean;
    hasViolations: boolean;
    isTrustedTrader: boolean;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { username: string; email: string; displayName: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  initialize: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false, // Always start as false
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.login({ email, password });
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          // Store token in localStorage for API calls
          localStorage.setItem('accessToken', response.token);
          
          // Fetch user profile after login
          try {
            await useProfile.getState().fetchProfile();
          } catch (profileError) {
            console.warn('Failed to fetch profile after login:', profileError);
          }
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Login failed'
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.register(userData);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          // Store token in localStorage for API calls
          localStorage.setItem('accessToken', response.token);
          
          // Fetch user profile after registration
          try {
            await useProfile.getState().fetchProfile();
          } catch (profileError) {
            console.warn('Failed to fetch profile after registration:', profileError);
          }
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Registration failed'
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });

        // Clear token from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Clear profile data
        useProfile.getState().clearProfile();
      },

      refreshToken: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const response = await authApi.refreshToken();
          set({
            token: response.token,
            user: response.user
          });
          localStorage.setItem('accessToken', response.token);
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
        }
      },

      clearError: () => {
        set({ error: null });
      },

      initialize: () => {
        // Check for existing token and user data in localStorage
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            // If token and user data exist, set as authenticated
            set({ 
              token, 
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } catch (error) {
            console.warn('Failed to parse user data from localStorage:', error);
            // Clear invalid data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
          }
        } else {
          // Ensure we start as not authenticated
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false 
          });
        }
      }
    }),
    {
      name: 'flocknode-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
