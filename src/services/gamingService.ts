import { GAMING_API_URL } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';

// Gaming session types
export interface GamingSession {
  sessionId: string;
  gameId: string;
  userId: string;
  status: 'active' | 'ended' | 'paused';
  startedAt: string;
  endedAt?: string;
}

export interface Game {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'maintenance' | 'offline';
}

// Gaming API service
export const gamingService = {
  /**
   * Get list of available games
   */
  getGames: async (): Promise<Game[]> => {
    try {
      const response = await fetch(`${GAMING_API_URL}/api/gaming/games`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }

      const data = await response.json();
      return data.games || [];
    } catch (error) {
      console.error('Failed to fetch games:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available games',
        variant: 'destructive',
      });
      throw error;
    }
  },

  /**
   * Start a new gaming session
   */
  startSession: async (gameId: string, userId: string): Promise<GamingSession> => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${GAMING_API_URL}/api/gaming/sessions/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ gameId, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to start gaming session');
      }

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Session Started',
          description: `Your ${gameId} gaming session has started!`,
        });
        
        return {
          sessionId: data.sessionId,
          gameId: data.gameId,
          userId: data.userId,
          status: data.status,
          startedAt: new Date().toISOString(),
        };
      }

      throw new Error(data.message || 'Failed to start session');
    } catch (error) {
      console.error('Failed to start gaming session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start gaming session',
        variant: 'destructive',
      });
      throw error;
    }
  },

  /**
   * End a gaming session
   */
  endSession: async (sessionId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${GAMING_API_URL}/api/gaming/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to end gaming session');
      }

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Session Ended',
          description: 'Your gaming session has been ended',
        });
      }
    } catch (error) {
      console.error('Failed to end gaming session:', error);
      toast({
        title: 'Error',
        description: 'Failed to end gaming session',
        variant: 'destructive',
      });
      throw error;
    }
  },

  /**
   * Check gaming service health
   */
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${GAMING_API_URL}/health`, {
        method: 'GET',
      });

      return response.ok;
    } catch (error) {
      console.error('Gaming service health check failed:', error);
      return false;
    }
  },
};


