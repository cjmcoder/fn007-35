import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { authApi } from '@/lib/api-client';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio?: string;
  region: string;
  preferredGame: string;
  gamingPlatforms: string[];
  avatarUrl?: string;
  socialLinks: {
    twitch?: string;
    youtube?: string;
    discord?: string;
    twitter?: string;
  };
  gamingIds: {
    psn?: string;
    xbox?: string;
    steam?: string;
    epic?: string;
  };
  preferences: {
    notifications: boolean;
    publicProfile: boolean;
    showStats: boolean;
  };
  trustScore: number;
  wins: number;
  losses: number;
  createdAt: string;
  lastLoginAt: string;
  verified: boolean;
}

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isSetupComplete: boolean;
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeSetup: (profile: UserProfile) => void;
  clearProfile: () => void;
}

export const useProfile = create<ProfileState>()(
  subscribeWithSelector((set, get) => ({
    profile: null,
    loading: false,
    error: null,
    isSetupComplete: false,
    
    fetchProfile: async () => {
      set({ loading: true, error: null });
      try {
        const profile = await authApi.getProfile();
        set({ 
          profile, 
          isSetupComplete: true,
          loading: false 
        });
      } catch (error: any) {
        set({ 
          error: error.message, 
          loading: false,
          isSetupComplete: false
        });
      }
    },
    
    updateProfile: async (updates) => {
      set({ loading: true, error: null });
      try {
        // For now, just update the local state since we don't have updateProfile in authApi
        const currentProfile = get().profile;
        if (currentProfile) {
          const updatedProfile = { ...currentProfile, ...updates };
          set({ 
            profile: updatedProfile,
            loading: false 
          });
        }
      } catch (error: any) {
        set({ 
          error: error.message, 
          loading: false 
        });
        throw error;
      }
    },
    
    completeSetup: (profile) => {
      set({ 
        profile, 
        isSetupComplete: true,
        error: null 
      });
    },
    
    clearProfile: () => {
      set({ 
        profile: null, 
        isSetupComplete: false,
        error: null 
      });
    },
  }))
);




