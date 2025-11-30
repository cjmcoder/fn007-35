import { useState, useEffect, useCallback } from 'react';

export interface LeaderboardEntry {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  rank: number;
  score: number;
  level: number;
  gamesPlayed: number;
  winRate: number;
  totalEarnings: number;
  streak: number;
  badges: string[];
  lastActive: string;
  gameMode: 'console_stream' | 'cloud_gaming' | 'all';
}

export interface LeaderboardCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  timeRange: 'daily' | 'weekly' | 'monthly' | 'all_time';
  gameMode?: 'console_stream' | 'cloud_gaming' | 'all';
}

export interface UserStats {
  rank: number;
  score: number;
  level: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  totalEarnings: number;
  currentStreak: number;
  bestStreak: number;
  badges: string[];
  achievements: string[];
  lastGamePlayed: string;
  favoriteGame: string;
  averageMatchDuration: number;
}

class LeaderboardService {
  private leaderboardCallbacks: Set<(data: LeaderboardEntry[]) => void> = new Set();
  private userStatsCallbacks: Set<(data: UserStats) => void> = new Set();
  
  private leaderboardInterval: NodeJS.Timeout | null = null;
  private userStatsInterval: NodeJS.Timeout | null = null;

  // Leaderboard categories
  getCategories(): LeaderboardCategory[] {
    return [
      {
        id: 'overall',
        name: 'Overall Leaderboard',
        description: 'Top players across all game modes',
        icon: '🏆',
        timeRange: 'all_time',
        gameMode: 'all'
      },
      {
        id: 'console_stream',
        name: 'Console Stream Champions',
        description: 'Best console stream players',
        icon: '🎮',
        timeRange: 'all_time',
        gameMode: 'console_stream'
      },
      {
        id: 'cloud_gaming',
        name: 'Cloud Gaming Masters',
        description: 'Top cloud gaming players',
        icon: '☁️',
        timeRange: 'all_time',
        gameMode: 'cloud_gaming'
      },
      {
        id: 'daily',
        name: 'Daily Champions',
        description: 'Today\'s top performers',
        icon: '📅',
        timeRange: 'daily',
        gameMode: 'all'
      },
      {
        id: 'weekly',
        name: 'Weekly Warriors',
        description: 'This week\'s leaders',
        icon: '🗓️',
        timeRange: 'weekly',
        gameMode: 'all'
      },
      {
        id: 'monthly',
        name: 'Monthly Legends',
        description: 'This month\'s top players',
        icon: '📊',
        timeRange: 'monthly',
        gameMode: 'all'
      }
    ];
  }

  // Subscribe to leaderboard updates
  subscribeToLeaderboard(categoryId: string, callback: (data: LeaderboardEntry[]) => void) {
    this.leaderboardCallbacks.add(callback);
    
    if (!this.leaderboardInterval) {
      this.startLeaderboardUpdates(categoryId);
    }
    
    return () => {
      this.leaderboardCallbacks.delete(callback);
      if (this.leaderboardCallbacks.size === 0) {
        this.stopLeaderboardUpdates();
      }
    };
  }

  // Subscribe to user stats updates
  subscribeToUserStats(userId: string, callback: (data: UserStats) => void) {
    this.userStatsCallbacks.add(callback);
    
    if (!this.userStatsInterval) {
      this.startUserStatsUpdates(userId);
    }
    
    return () => {
      this.userStatsCallbacks.delete(callback);
      if (this.userStatsCallbacks.size === 0) {
        this.stopUserStatsUpdates();
      }
    };
  }

  // Fetch leaderboard data
  private async fetchLeaderboardData(categoryId: string): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(`/api/leaderboard/${categoryId}`);
      if (!response.ok) return [];

      const data = await response.json();
      return data.entries || [];
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
      return [];
    }
  }

  // Fetch user stats
  private async fetchUserStats(userId: string): Promise<UserStats | null> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;

      const response = await fetch(`/api/leaderboard/user/${userId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      return null;
    }
  }

  // Start leaderboard updates
  private startLeaderboardUpdates(categoryId: string) {
    if (this.leaderboardInterval) return;
    
    this.leaderboardInterval = setInterval(async () => {
      const data = await this.fetchLeaderboardData(categoryId);
      this.leaderboardCallbacks.forEach(callback => callback(data));
    }, 10000); // Update every 10 seconds
  }

  // Start user stats updates
  private startUserStatsUpdates(userId: string) {
    if (this.userStatsInterval) return;
    
    this.userStatsInterval = setInterval(async () => {
      const data = await this.fetchUserStats(userId);
      if (data) {
        this.userStatsCallbacks.forEach(callback => callback(data));
      }
    }, 15000); // Update every 15 seconds
  }

  // Stop updates
  private stopLeaderboardUpdates() {
    if (this.leaderboardInterval) {
      clearInterval(this.leaderboardInterval);
      this.leaderboardInterval = null;
    }
  }

  private stopUserStatsUpdates() {
    if (this.userStatsInterval) {
      clearInterval(this.userStatsInterval);
      this.userStatsInterval = null;
    }
  }

  // Manual refresh methods
  async refreshLeaderboard(categoryId: string): Promise<LeaderboardEntry[]> {
    const data = await this.fetchLeaderboardData(categoryId);
    this.leaderboardCallbacks.forEach(callback => callback(data));
    return data;
  }

  async refreshUserStats(userId: string): Promise<UserStats | null> {
    const data = await this.fetchUserStats(userId);
    if (data) {
      this.userStatsCallbacks.forEach(callback => callback(data));
    }
    return data;
  }

  // Create new user entry in leaderboard
  async createUserEntry(userId: string, username: string, displayName: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return false;

      const response = await fetch('/api/leaderboard/user/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          username,
          displayName,
          initialScore: 0,
          level: 1,
          badges: ['newcomer']
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to create user leaderboard entry:', error);
      return false;
    }
  }

  // Update user score after match
  async updateUserScore(userId: string, matchResult: {
    won: boolean;
    score: number;
    gameMode: 'console_stream' | 'cloud_gaming';
    earnings: number;
  }): Promise<boolean> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return false;

      const response = await fetch('/api/leaderboard/user/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...matchResult
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to update user score:', error);
      return false;
    }
  }

  // Cleanup
  destroy() {
    this.stopLeaderboardUpdates();
    this.stopUserStatsUpdates();
    this.leaderboardCallbacks.clear();
    this.userStatsCallbacks.clear();
  }
}

// Singleton instance
export const leaderboardService = new LeaderboardService();

// React hooks for easy integration
export function useLeaderboard(categoryId: string) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = leaderboardService.subscribeToLeaderboard(categoryId, (data) => {
      setEntries(data);
      setLoading(false);
      setError(null);
    });

    // Initial fetch
    leaderboardService.refreshLeaderboard(categoryId);

    return unsubscribe;
  }, [categoryId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await leaderboardService.refreshLeaderboard(categoryId);
    setLoading(false);
  }, [categoryId]);

  return { entries, loading, error, refresh };
}

export function useUserStats(userId: string) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = leaderboardService.subscribeToUserStats(userId, (data) => {
      setStats(data);
      setLoading(false);
      setError(null);
    });

    // Initial fetch
    leaderboardService.refreshUserStats(userId);

    return unsubscribe;
  }, [userId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await leaderboardService.refreshUserStats(userId);
    if (!data) {
      setError('Failed to refresh user stats');
    }
    setLoading(false);
  }, [userId]);

  return { stats, loading, error, refresh };
}
