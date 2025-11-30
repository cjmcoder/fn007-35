import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { realtimeConnection, REALTIME_EVENTS, type RealtimeEvent } from '@/lib/api-client';

interface RealtimeState {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: any;
  messageCount: number;
  
  // Real-time data
  onlineUsers: string[];
  activeMatches: any[];
  liveProps: any[];
  systemNotifications: any[];
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  subscribe: (event: RealtimeEvent, callback: (data: any) => void) => () => void;
  sendMessage: (message: any) => void;
}

export const useRealtime = create<RealtimeState>()(
  subscribeWithSelector((set, get) => ({
    isConnected: false,
    connectionStatus: 'disconnected',
    lastMessage: null,
    messageCount: 0,
    
    onlineUsers: [],
    activeMatches: [],
    liveProps: [],
    systemNotifications: [],
    
    connect: () => {
      const { connectionStatus } = get();
      if (connectionStatus === 'connected' || connectionStatus === 'connecting') {
        return;
      }
      
      set({ connectionStatus: 'connecting' });
      
      // Subscribe to connection events
      realtimeConnection.subscribe('connected', () => {
        set({ 
          isConnected: true, 
          connectionStatus: 'connected' 
        });
      });
      
      realtimeConnection.subscribe('disconnected', () => {
        set({ 
          isConnected: false, 
          connectionStatus: 'disconnected' 
        });
      });
      
      realtimeConnection.subscribe('error', () => {
        set({ 
          isConnected: false, 
          connectionStatus: 'error' 
        });
      });
      
      // Subscribe to real-time events
      realtimeConnection.subscribe(REALTIME_EVENTS.USER_ONLINE, (data) => {
        const { onlineUsers } = get();
        if (!onlineUsers.includes(data.userId)) {
          set({ onlineUsers: [...onlineUsers, data.userId] });
        }
      });
      
      realtimeConnection.subscribe(REALTIME_EVENTS.USER_OFFLINE, (data) => {
        const { onlineUsers } = get();
        set({ 
          onlineUsers: onlineUsers.filter(id => id !== data.userId) 
        });
      });
      
      realtimeConnection.subscribe(REALTIME_EVENTS.MATCH_CREATED, (data) => {
        const { activeMatches } = get();
        set({ 
          activeMatches: [...activeMatches, data.match] 
        });
      });
      
      realtimeConnection.subscribe(REALTIME_EVENTS.MATCH_RESOLVED, (data) => {
        const { activeMatches } = get();
        set({ 
          activeMatches: activeMatches.filter(match => match.id !== data.matchId) 
        });
      });
      
      realtimeConnection.subscribe(REALTIME_EVENTS.PROP_STAKED, (data) => {
        const { liveProps } = get();
        const updatedProps = liveProps.map(prop => 
          prop.id === data.propId 
            ? { ...prop, stakes: [...(prop.stakes || []), data.stake] }
            : prop
        );
        set({ liveProps: updatedProps });
      });
      
      realtimeConnection.subscribe(REALTIME_EVENTS.SYSTEM_NOTIFICATION, (data) => {
        const { systemNotifications } = get();
        set({ 
          systemNotifications: [data.notification, ...systemNotifications] 
        });
      });
      
      realtimeConnection.subscribe(REALTIME_EVENTS.CHAT_MESSAGE, (data) => {
        set({ 
          lastMessage: data.message,
          messageCount: get().messageCount + 1
        });
      });
      
      // Connect to WebSocket
      realtimeConnection.connect();
    },
    
    disconnect: () => {
      realtimeConnection.disconnect();
      set({ 
        isConnected: false, 
        connectionStatus: 'disconnected' 
      });
    },
    
    subscribe: (event, callback) => {
      return realtimeConnection.subscribe(event, callback);
    },
    
    sendMessage: (message) => {
      if (get().isConnected) {
        // Send message via WebSocket
        realtimeConnection.subscribe(REALTIME_EVENTS.CHAT_MESSAGE, (data) => {
          // Handle outgoing message
        });
      }
    },
  }))
);























