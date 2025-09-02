import { create } from 'zustand';
import { Platform, GameTitle, Rank } from '@/lib/types';

interface Filters {
  platform: Platform | 'All';
  game: GameTitle | 'All';
  rank: Rank;
  prizeSort: 'high-to-low' | 'low-to-high';
  sort: 'newest' | 'prize';
  search: string;
}

interface UIState {
  // Modal states
  createChallengeOpen: boolean;
  addFCModalOpen: boolean;
  
  // Current tab
  activeTab: 'challenges' | 'players' | 'tournaments' | 'props';
  
  // Filters
  filters: Filters;
  
  // Mobile states
  rightRailOpen: boolean;
  leftNavOpen: boolean;
  
  // Actions
  setCreateChallengeOpen: (open: boolean) => void;
  setAddFCModalOpen: (open: boolean) => void;
  setActiveTab: (tab: 'challenges' | 'players' | 'tournaments' | 'props') => void;
  updateFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  setRightRailOpen: (open: boolean) => void;
  setLeftNavOpen: (open: boolean) => void;
}

const defaultFilters: Filters = {
  platform: 'All',
  game: 'All',
  rank: 'All',
  prizeSort: 'high-to-low',
  sort: 'newest',
  search: ''
};

export const useUI = create<UIState>((set) => ({
  createChallengeOpen: false,
  addFCModalOpen: false,
  activeTab: 'challenges',
  filters: defaultFilters,
  rightRailOpen: false,
  leftNavOpen: false,
  
  setCreateChallengeOpen: (open) => set({ createChallengeOpen: open }),
  setAddFCModalOpen: (open) => set({ addFCModalOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  updateFilters: (newFilters) => 
    set((state) => ({ 
      filters: { ...state.filters, ...newFilters } 
    })),
    
  resetFilters: () => set({ filters: defaultFilters }),
  setRightRailOpen: (open) => set({ rightRailOpen: open }),
  setLeftNavOpen: (open) => set({ leftNavOpen: open }),
}));