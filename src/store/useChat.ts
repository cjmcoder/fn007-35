import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useRealtime } from './useRealtime';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  message: string;
  timestamp: string;
  type: 'message' | 'system' | 'match' | 'prop';
  channel: 'global' | 'match' | 'prop' | 'private';
  channelId?: string;
  metadata?: any;
}

interface ChatChannel {
  id: string;
  name: string;
  type: 'global' | 'match' | 'prop' | 'private';
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

interface ChatState {
  messages: ChatMessage[];
  channels: ChatChannel[];
  activeChannel: string;
  onlineUsers: string[];
  typingUsers: string[];
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (message: string, channel?: string) => Promise<void>;
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  setActiveChannel: (channelId: string) => void;
  markAsRead: (channelId: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
  clearMessages: (channelId?: string) => void;
}

export const useChat = create<ChatState>()(
  subscribeWithSelector((set, get) => ({
    messages: [],
    channels: [
      {
        id: 'global',
        name: 'Global Chat',
        type: 'global',
        participants: [],
        unreadCount: 0
      }
    ],
    activeChannel: 'global',
    onlineUsers: [],
    typingUsers: [],
    isConnected: false,
    loading: false,
    error: null,
    
    sendMessage: async (message, channel = 'global') => {
      const { activeChannel } = get();
      const targetChannel = channel || activeChannel;
      
      if (!message.trim()) return;
      
      set({ loading: true, error: null });
      
      try {
        // Send message via WebSocket
        const { subscribe } = useRealtime.getState();
        
        // Create message object
        const newMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          userId: localStorage.getItem('flocknode-user-id') || 'unknown',
          username: localStorage.getItem('flocknode-username') || 'Anonymous',
          avatarUrl: localStorage.getItem('flocknode-avatar') || undefined,
          message: message.trim(),
          timestamp: new Date().toISOString(),
          type: 'message',
          channel: targetChannel as any,
          channelId: targetChannel
        };
        
        // Add to local messages immediately for instant feedback
        const { messages } = get();
        set({ 
          messages: [...messages, newMessage],
          loading: false 
        });
        
        // Send via WebSocket
        subscribe('chat.message.sent', (data) => {
          if (data.messageId === newMessage.id) {
            // Update with real message ID from server
            const { messages } = get();
            const updatedMessages = messages.map(m => 
              m.id === newMessage.id ? { ...m, id: data.realId } : m
            );
            set({ messages: updatedMessages });
          }
        });
        
        // Send the message
        const ws = (window as any).flocknodeWS;
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'chat.message',
            payload: {
              message: newMessage.message,
              channel: targetChannel,
              channelId: targetChannel
            }
          }));
        }
        
      } catch (error: any) {
        set({ error: error.message, loading: false });
      }
    },
    
    joinChannel: (channelId) => {
      const { channels } = get();
      const existingChannel = channels.find(c => c.id === channelId);
      
      if (!existingChannel) {
        const newChannel: ChatChannel = {
          id: channelId,
          name: `Channel ${channelId}`,
          type: 'match',
          participants: [],
          unreadCount: 0
        };
        set({ channels: [...channels, newChannel] });
      }
    },
    
    leaveChannel: (channelId) => {
      const { channels, activeChannel } = get();
      const updatedChannels = channels.filter(c => c.id !== channelId);
      
      // Switch to global if leaving active channel
      const newActiveChannel = activeChannel === channelId ? 'global' : activeChannel;
      
      set({ 
        channels: updatedChannels,
        activeChannel: newActiveChannel
      });
    },
    
    setActiveChannel: (channelId) => {
      set({ activeChannel: channelId });
      get().markAsRead(channelId);
    },
    
    markAsRead: (channelId) => {
      const { channels } = get();
      const updatedChannels = channels.map(c => 
        c.id === channelId ? { ...c, unreadCount: 0 } : c
      );
      set({ channels: updatedChannels });
    },
    
    startTyping: () => {
      const ws = (window as any).flocknodeWS;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'chat.typing.start',
          payload: { channel: get().activeChannel }
        }));
      }
    },
    
    stopTyping: () => {
      const ws = (window as any).flocknodeWS;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'chat.typing.stop',
          payload: { channel: get().activeChannel }
        }));
      }
    },
    
    clearMessages: (channelId) => {
      const { messages, activeChannel } = get();
      const targetChannel = channelId || activeChannel;
      const updatedMessages = messages.filter(m => m.channelId !== targetChannel);
      set({ messages: updatedMessages });
    },
  }))
);

// Subscribe to real-time chat updates
useChat.subscribe(
  (state) => state,
  () => {
    const { subscribe } = useRealtime.getState();
    
    // Subscribe to chat events
    subscribe('chat.message', (data) => {
      const { messages, channels, activeChannel } = useChat.getState();
      
      // Add new message
      const newMessages = [...messages, data.message];
      
      // Update channel last message and unread count
      const updatedChannels = channels.map(c => {
        if (c.id === data.message.channelId) {
          const unreadCount = c.id === activeChannel ? 0 : c.unreadCount + 1;
          return {
            ...c,
            lastMessage: data.message,
            unreadCount
          };
        }
        return c;
      });
      
      useChat.setState({ 
        messages: newMessages,
        channels: updatedChannels
      });
    });
    
    subscribe('user.online', (data) => {
      const { onlineUsers } = useChat.getState();
      if (!onlineUsers.includes(data.userId)) {
        useChat.setState({ 
          onlineUsers: [...onlineUsers, data.userId] 
        });
      }
    });
    
    subscribe('user.offline', (data) => {
      const { onlineUsers } = useChat.getState();
      useChat.setState({ 
        onlineUsers: onlineUsers.filter(id => id !== data.userId) 
      });
    });
    
    subscribe('chat.typing', (data) => {
      const { typingUsers } = useChat.getState();
      if (data.isTyping && !typingUsers.includes(data.userId)) {
        useChat.setState({ 
          typingUsers: [...typingUsers, data.userId] 
        });
        
        // Remove from typing after 3 seconds
        setTimeout(() => {
          const { typingUsers } = useChat.getState();
          useChat.setState({ 
            typingUsers: typingUsers.filter(id => id !== data.userId) 
          });
        }, 3000);
      } else if (!data.isTyping) {
        useChat.setState({ 
          typingUsers: typingUsers.filter(id => id !== data.userId) 
        });
      }
    });
    
    subscribe('chat.channel.created', (data) => {
      const { channels } = useChat.getState();
      const existingChannel = channels.find(c => c.id === data.channel.id);
      if (!existingChannel) {
        useChat.setState({ 
          channels: [...channels, data.channel] 
        });
      }
    });
    
    subscribe('chat.channel.updated', (data) => {
      const { channels } = useChat.getState();
      const updatedChannels = channels.map(c => 
        c.id === data.channelId ? { ...c, ...data.updates } : c
      );
      useChat.setState({ channels: updatedChannels });
    });
  }
);























