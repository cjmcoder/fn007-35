import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { matchesApi } from '@/lib/api-client';
import { useRealtime } from './useRealtime';

interface Match {
  id: string;
  game: string;
  platform: string;
  entryAmount: number;
  status: 'OPEN' | 'LOCKED' | 'RESOLVED' | 'CANCELLED' | 'DISPUTED';
  creator: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  opponent?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  winner?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
  rules?: any;
}

interface MatchesState {
  matches: Match[];
  myMatches: Match[];
  activeMatches: Match[];
  matchHistory: Match[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchMatches: (filters?: any) => Promise<void>;
  fetchMyMatches: () => Promise<void>;
  fetchMatchHistory: (page?: number) => Promise<void>;
  createMatch: (matchData: any) => Promise<Match>;
  joinMatch: (matchId: string, data?: any) => Promise<Match>;
  resolveMatch: (matchId: string, resolution: any) => Promise<Match>;
  cancelMatch: (matchId: string) => Promise<Match>;
  getMatch: (matchId: string) => Promise<Match>;
}

export const useMatches = create<MatchesState>()(
  subscribeWithSelector((set, get) => ({
    matches: [],
    myMatches: [],
    activeMatches: [],
    matchHistory: [],
    loading: false,
    error: null,
    
    fetchMatches: async (filters = {}) => {
      set({ loading: true, error: null });
      try {
        const matches = await matchesApi.getMatches(filters);
        set({ matches, loading: false });
      } catch (error: any) {
        set({ error: error.message, loading: false });
      }
    },
    
    fetchMyMatches: async () => {
      set({ loading: true, error: null });
      try {
        const [activeMatches, matchHistory] = await Promise.all([
          matchesApi.getMyActiveMatches(),
          matchesApi.getMyMatchHistory()
        ]);
        set({ 
          activeMatches, 
          matchHistory,
          loading: false 
        });
      } catch (error: any) {
        set({ error: error.message, loading: false });
      }
    },
    
    fetchMatchHistory: async (page = 1) => {
      set({ loading: true, error: null });
      try {
        const matchHistory = await matchesApi.getMyMatchHistory(page, 20);
        set({ matchHistory, loading: false });
      } catch (error: any) {
        set({ error: error.message, loading: false });
      }
    },
    
    createMatch: async (matchData) => {
      set({ loading: true, error: null });
      try {
        const match = await matchesApi.createMatch(matchData);
        const { matches } = get();
        set({ 
          matches: [match, ...matches],
          loading: false 
        });
        return match;
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },
    
    joinMatch: async (matchId, data) => {
      set({ loading: true, error: null });
      try {
        const match = await matchesApi.joinMatch(matchId, data);
        const { matches, activeMatches } = get();
        
        // Update matches list
        const updatedMatches = matches.map(m => 
          m.id === matchId ? match : m
        );
        
        // Add to active matches if not already there
        const isInActiveMatches = activeMatches.some(m => m.id === matchId);
        const updatedActiveMatches = isInActiveMatches 
          ? activeMatches.map(m => m.id === matchId ? match : m)
          : [match, ...activeMatches];
        
        set({ 
          matches: updatedMatches,
          activeMatches: updatedActiveMatches,
          loading: false 
        });
        return match;
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },
    
    resolveMatch: async (matchId, resolution) => {
      set({ loading: true, error: null });
      try {
        const match = await matchesApi.resolveMatch(matchId, resolution);
        const { matches, activeMatches, matchHistory } = get();
        
        // Update matches list
        const updatedMatches = matches.map(m => 
          m.id === matchId ? match : m
        );
        
        // Remove from active matches and add to history
        const updatedActiveMatches = activeMatches.filter(m => m.id !== matchId);
        const updatedMatchHistory = [match, ...matchHistory];
        
        set({ 
          matches: updatedMatches,
          activeMatches: updatedActiveMatches,
          matchHistory: updatedMatchHistory,
          loading: false 
        });
        return match;
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },
    
    cancelMatch: async (matchId) => {
      set({ loading: true, error: null });
      try {
        const match = await matchesApi.cancelMatch(matchId);
        const { matches, activeMatches } = get();
        
        // Update matches list
        const updatedMatches = matches.map(m => 
          m.id === matchId ? match : m
        );
        
        // Remove from active matches
        const updatedActiveMatches = activeMatches.filter(m => m.id !== matchId);
        
        set({ 
          matches: updatedMatches,
          activeMatches: updatedActiveMatches,
          loading: false 
        });
        return match;
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },
    
    getMatch: async (matchId) => {
      set({ loading: true, error: null });
      try {
        const match = await matchesApi.getMatch(matchId);
        set({ loading: false });
        return match;
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },
  }))
);

// Subscribe to real-time match updates
useMatches.subscribe(
  (state) => state,
  () => {
    const { subscribe } = useRealtime.getState();
    
    // Subscribe to match events
    subscribe('match.created', (data) => {
      const { matches } = useMatches.getState();
      useMatches.setState({ 
        matches: [data.match, ...matches] 
      });
    });
    
    subscribe('match.joined', (data) => {
      const { matches, activeMatches } = useMatches.getState();
      const updatedMatches = matches.map(m => 
        m.id === data.matchId ? { ...m, ...data.updates } : m
      );
      const updatedActiveMatches = activeMatches.map(m => 
        m.id === data.matchId ? { ...m, ...data.updates } : m
      );
      useMatches.setState({ 
        matches: updatedMatches,
        activeMatches: updatedActiveMatches
      });
    });
    
    subscribe('match.resolved', (data) => {
      const { matches, activeMatches, matchHistory } = useMatches.getState();
      const updatedMatches = matches.map(m => 
        m.id === data.matchId ? { ...m, ...data.updates } : m
      );
      const updatedActiveMatches = activeMatches.filter(m => m.id !== data.matchId);
      const updatedMatchHistory = [data.match, ...matchHistory];
      useMatches.setState({ 
        matches: updatedMatches,
        activeMatches: updatedActiveMatches,
        matchHistory: updatedMatchHistory
      });
    });
    
    subscribe('match.cancelled', (data) => {
      const { matches, activeMatches } = useMatches.getState();
      const updatedMatches = matches.map(m => 
        m.id === data.matchId ? { ...m, ...data.updates } : m
      );
      const updatedActiveMatches = activeMatches.filter(m => m.id !== data.matchId);
      useMatches.setState({ 
        matches: updatedMatches,
        activeMatches: updatedActiveMatches
      });
    });
  }
);























