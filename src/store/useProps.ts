import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { propsApi } from '@/lib/api-client';
import { useRealtime } from './useRealtime';

interface PropTemplate {
  id: string;
  game: string;
  type: 'THRESHOLD' | 'BINARY' | 'RANGE';
  label: string;
  conditionJson: any;
  minEntryMinor: number;
  maxEntryMinor: number;
  feeBps: number;
  cutoffPolicy: string;
  enabled: boolean;
}

interface LiveProp {
  id: string;
  templateId: string;
  game: string;
  label: string;
  type: string;
  condition: any;
  stakes: {
    side: string;
    amount: number;
    userId: string;
    username: string;
  }[];
  totalStaked: number;
  status: 'ACTIVE' | 'LOCKED' | 'RESOLVED' | 'CANCELLED';
  cutoffAt: string;
  resolvedAt?: string;
  winner?: string;
  createdAt: string;
}

interface PropsState {
  templates: PropTemplate[];
  liveProps: LiveProp[];
  myProps: LiveProp[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchTemplates: () => Promise<void>;
  fetchLiveProps: (limit?: number) => Promise<void>;
  fetchMyProps: () => Promise<void>;
  stakeProp: (propId: string, side: string, amount: number) => Promise<LiveProp>;
  getProp: (propId: string) => Promise<LiveProp>;
}

export const useProps = create<PropsState>()(
  subscribeWithSelector((set, get) => ({
    templates: [],
    liveProps: [],
    myProps: [],
    loading: false,
    error: null,
    
    fetchTemplates: async () => {
      set({ loading: true, error: null });
      try {
        const templates = await propsApi.getTemplates();
        set({ templates, loading: false });
      } catch (error: any) {
        set({ error: error.message, loading: false });
      }
    },
    
    fetchLiveProps: async (limit = 50) => {
      set({ loading: true, error: null });
      try {
        const liveProps = await propsApi.getLiveProps(limit);
        set({ liveProps, loading: false });
      } catch (error: any) {
        set({ error: error.message, loading: false });
      }
    },
    
    fetchMyProps: async () => {
      set({ loading: true, error: null });
      try {
        const myProps = await propsApi.getMyProps();
        set({ myProps, loading: false });
      } catch (error: any) {
        set({ error: error.message, loading: false });
      }
    },
    
    stakeProp: async (propId, side, amount) => {
      set({ loading: true, error: null });
      try {
        const prop = await propsApi.stakeProp(propId, side, amount);
        const { liveProps, myProps } = get();
        
        // Update live props
        const updatedLiveProps = liveProps.map(p => 
          p.id === propId ? prop : p
        );
        
        // Add to my props if not already there
        const isInMyProps = myProps.some(p => p.id === propId);
        const updatedMyProps = isInMyProps 
          ? myProps.map(p => p.id === propId ? prop : p)
          : [prop, ...myProps];
        
        set({ 
          liveProps: updatedLiveProps,
          myProps: updatedMyProps,
          loading: false 
        });
        return prop;
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },
    
    getProp: async (propId) => {
      set({ loading: true, error: null });
      try {
        const prop = await propsApi.getProp(propId);
        set({ loading: false });
        return prop;
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },
  }))
);

// Subscribe to real-time prop updates
useProps.subscribe(
  (state) => state,
  () => {
    const { subscribe } = useRealtime.getState();
    
    // Subscribe to prop events
    subscribe('prop.created', (data) => {
      const { liveProps } = useProps.getState();
      useProps.setState({ 
        liveProps: [data.prop, ...liveProps] 
      });
    });
    
    subscribe('prop.staked', (data) => {
      const { liveProps, myProps } = useProps.getState();
      const updatedLiveProps = liveProps.map(p => 
        p.id === data.propId 
          ? { 
              ...p, 
              stakes: [...p.stakes, data.stake],
              totalStaked: p.totalStaked + data.stake.amount
            }
          : p
      );
      
      // Update my props if this is my stake
      const updatedMyProps = myProps.map(p => 
        p.id === data.propId 
          ? { 
              ...p, 
              stakes: [...p.stakes, data.stake],
              totalStaked: p.totalStaked + data.stake.amount
            }
          : p
      );
      
      useProps.setState({ 
        liveProps: updatedLiveProps,
        myProps: updatedMyProps
      });
    });
    
    subscribe('prop.resolved', (data) => {
      const { liveProps, myProps } = useProps.getState();
      const updatedLiveProps = liveProps.map(p => 
        p.id === data.propId ? { ...p, ...data.updates } : p
      );
      const updatedMyProps = myProps.map(p => 
        p.id === data.propId ? { ...p, ...data.updates } : p
      );
      useProps.setState({ 
        liveProps: updatedLiveProps,
        myProps: updatedMyProps
      });
    });
    
    subscribe('prop.cancelled', (data) => {
      const { liveProps, myProps } = useProps.getState();
      const updatedLiveProps = liveProps.filter(p => p.id !== data.propId);
      const updatedMyProps = myProps.filter(p => p.id !== data.propId);
      useProps.setState({ 
        liveProps: updatedLiveProps,
        myProps: updatedMyProps
      });
    });
  }
);























