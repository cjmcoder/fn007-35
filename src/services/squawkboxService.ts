// FLOCKNODE Squawkbox Service
// Real-time messaging, chat, and activity feed service

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface SquawkboxMessage {
  id: string;
  channelId: string;
  userId: string;
  username: string;
  displayName: string;
  rating: number;
  level: number;
  message: string;
  timestamp: string;
  type: 'message' | 'system' | 'announcement';
  badges?: string[];
}

export interface SquawkboxChannel {
  id: string;
  name: string;
  game: string;
  active: boolean;
  online?: number;
}

export interface PlatformActivity {
  id: string;
  type: string;
  user?: string;
  winner?: string;
  loser?: string;
  game?: string;
  tournament?: string;
  message: string;
  amount?: number;
  entryFee?: number;
  earnings?: number;
  timestamp: string;
}

export interface OnlineStats {
  online: number;
  channels: Array<{
    id: string;
    name: string;
    online: number;
  }>;
}

class SquawkboxService {
  private baseUrl = '/api/squawkbox';
  private messageInterval: NodeJS.Timeout | null = null;
  private activityInterval: NodeJS.Timeout | null = null;
  private onlineInterval: NodeJS.Timeout | null = null;
  
  private messageCallbacks: Set<(messages: SquawkboxMessage[]) => void> = new Set();
  private activityCallbacks: Set<(activities: PlatformActivity[]) => void> = new Set();
  private onlineCallbacks: Set<(stats: OnlineStats) => void> = new Set();

  // Get all channels
  async getChannels(): Promise<SquawkboxChannel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/channels`);
      if (!response.ok) throw new Error('Failed to fetch channels');
      
      const data = await response.json();
      return data.channels || [];
    } catch (error) {
      console.error('Error fetching channels:', error);
      return [];
    }
  }

  // Get messages for a channel
  async getMessages(channelId: string, limit: number = 50): Promise<SquawkboxMessage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/${channelId}?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  // Send a message
  async sendMessage(channelId: string, message: string): Promise<{ success: boolean; message?: SquawkboxMessage; error?: string }> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelId, message })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to send message' };
      }

      toast({
        title: "Message Sent",
        description: "Your message has been posted to the channel.",
      });

      return { success: true, message: data.message };
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: 'Network error' };
    }
  }

  // Get platform activity
  async getActivity(limit: number = 10): Promise<PlatformActivity[]> {
    try {
      const response = await fetch(`${this.baseUrl}/activity?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch activity');
      
      const data = await response.json();
      return data.activities || [];
    } catch (error) {
      console.error('Error fetching activity:', error);
      return [];
    }
  }

  // Get online users stats
  async getOnlineStats(): Promise<OnlineStats | null> {
    try {
      const response = await fetch(`${this.baseUrl}/online`);
      if (!response.ok) throw new Error('Failed to fetch online stats');
      
      const data = await response.json();
      return {
        online: data.online,
        channels: data.channels || []
      };
    } catch (error) {
      console.error('Error fetching online stats:', error);
      return null;
    }
  }

  // Subscribe to message updates
  subscribeToMessages(channelId: string, callback: (messages: SquawkboxMessage[]) => void) {
    this.messageCallbacks.add(callback);
    
    if (!this.messageInterval) {
      this.startMessageUpdates(channelId);
    }
    
    return () => {
      this.messageCallbacks.delete(callback);
      if (this.messageCallbacks.size === 0) {
        this.stopMessageUpdates();
      }
    };
  }

  // Subscribe to activity updates
  subscribeToActivity(callback: (activities: PlatformActivity[]) => void) {
    this.activityCallbacks.add(callback);
    
    if (!this.activityInterval) {
      this.startActivityUpdates();
    }
    
    return () => {
      this.activityCallbacks.delete(callback);
      if (this.activityCallbacks.size === 0) {
        this.stopActivityUpdates();
      }
    };
  }

  // Subscribe to online stats updates
  subscribeToOnline(callback: (stats: OnlineStats) => void) {
    this.onlineCallbacks.add(callback);
    
    if (!this.onlineInterval) {
      this.startOnlineUpdates();
    }
    
    return () => {
      this.onlineCallbacks.delete(callback);
      if (this.onlineCallbacks.size === 0) {
        this.stopOnlineUpdates();
      }
    };
  }

  // Start message updates
  private startMessageUpdates(channelId: string) {
    this.messageInterval = setInterval(async () => {
      const messages = await this.getMessages(channelId);
      this.messageCallbacks.forEach(callback => callback(messages));
    }, 3000); // Update every 3 seconds
  }

  // Start activity updates
  private startActivityUpdates() {
    this.activityInterval = setInterval(async () => {
      const activities = await this.getActivity();
      this.activityCallbacks.forEach(callback => callback(activities));
    }, 5000); // Update every 5 seconds
  }

  // Start online stats updates
  private startOnlineUpdates() {
    this.onlineInterval = setInterval(async () => {
      const stats = await this.getOnlineStats();
      if (stats) {
        this.onlineCallbacks.forEach(callback => callback(stats));
      }
    }, 10000); // Update every 10 seconds
  }

  // Stop message updates
  private stopMessageUpdates() {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
      this.messageInterval = null;
    }
  }

  // Stop activity updates
  private stopActivityUpdates() {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }
  }

  // Stop online stats updates
  private stopOnlineUpdates() {
    if (this.onlineInterval) {
      clearInterval(this.onlineInterval);
      this.onlineInterval = null;
    }
  }

  // Refresh messages manually
  async refreshMessages(channelId: string): Promise<SquawkboxMessage[]> {
    const messages = await this.getMessages(channelId);
    this.messageCallbacks.forEach(callback => callback(messages));
    return messages;
  }

  // Refresh activity manually
  async refreshActivity(): Promise<PlatformActivity[]> {
    const activities = await this.getActivity();
    this.activityCallbacks.forEach(callback => callback(activities));
    return activities;
  }

  // Refresh online stats manually
  async refreshOnline(): Promise<OnlineStats | null> {
    const stats = await this.getOnlineStats();
    if (stats) {
      this.onlineCallbacks.forEach(callback => callback(stats));
    }
    return stats;
  }
}

export const squawkboxService = new SquawkboxService();

// React hooks for Squawkbox

export function useSquawkboxMessages(channelId: string) {
  const [messages, setMessages] = useState<SquawkboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!channelId) {
      setLoading(false);
      return;
    }

    const unsubscribe = squawkboxService.subscribeToMessages(channelId, (data) => {
      setMessages(data);
      setLoading(false);
      setError(null);
    });

    // Initial fetch
    squawkboxService.refreshMessages(channelId);

    return unsubscribe;
  }, [channelId]);

  const sendMessage = useCallback(async (message: string) => {
    return await squawkboxService.sendMessage(channelId, message);
  }, [channelId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await squawkboxService.refreshMessages(channelId);
    setLoading(false);
  }, [channelId]);

  return { messages, loading, error, sendMessage, refresh };
}

export function useSquawkboxActivity() {
  const [activities, setActivities] = useState<PlatformActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = squawkboxService.subscribeToActivity((data) => {
      setActivities(data);
      setLoading(false);
      setError(null);
    });

    // Initial fetch
    squawkboxService.refreshActivity();

    return unsubscribe;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await squawkboxService.refreshActivity();
    setLoading(false);
  }, []);

  return { activities, loading, error, refresh };
}

export function useSquawkboxOnline() {
  const [stats, setStats] = useState<OnlineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = squawkboxService.subscribeToOnline((data) => {
      setStats(data);
      setLoading(false);
      setError(null);
    });

    // Initial fetch
    squawkboxService.refreshOnline();

    return unsubscribe;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await squawkboxService.refreshOnline();
    setLoading(false);
  }, []);

  return { stats, loading, error, refresh };
}

export function useSquawkboxChannels() {
  const [channels, setChannels] = useState<SquawkboxChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await squawkboxService.getChannels();
        setChannels(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch channels');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  return { channels, loading, error };
}

export default squawkboxService;





