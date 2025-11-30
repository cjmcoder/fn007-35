import { useState, useEffect, useCallback } from 'react';

export interface RealtimeWalletData {
  balances: {
    FC: {
      available: number;
      locked: number;
    };
  };
  lastUpdated: string;
}

export interface RealtimeMatchData {
  id: string;
  gameMode: 'console_stream' | 'cloud_gaming';
  gameName: string;
  status: 'waiting' | 'active' | 'completed';
  players: string[];
  entryFee: number;
  createdAt: string;
  streamKey?: string;
}

export interface RealtimeStats {
  activeMatches: number;
  waitingMatches: number;
  totalPlayers: number;
  consoleStreamMatches: number;
  cloudGamingMatches: number;
}

class RealtimeService {
  private walletCallbacks: Set<(data: RealtimeWalletData) => void> = new Set();
  private matchesCallbacks: Set<(data: RealtimeMatchData[]) => void> = new Set();
  private statsCallbacks: Set<(data: RealtimeStats) => void> = new Set();
  
  private walletInterval: NodeJS.Timeout | null = null;
  private matchesInterval: NodeJS.Timeout | null = null;
  private statsInterval: NodeJS.Timeout | null = null;
  
  private isRunning = false;

  // Wallet real-time updates
  subscribeToWallet(callback: (data: RealtimeWalletData) => void) {
    this.walletCallbacks.add(callback);
    
    if (!this.isRunning) {
      this.startWalletUpdates();
    }
    
    return () => {
      this.walletCallbacks.delete(callback);
      if (this.walletCallbacks.size === 0) {
        this.stopWalletUpdates();
      }
    };
  }

  // Matches real-time updates
  subscribeToMatches(callback: (data: RealtimeMatchData[]) => void) {
    this.matchesCallbacks.add(callback);
    
    if (!this.isRunning) {
      this.startMatchesUpdates();
    }
    
    return () => {
      this.matchesCallbacks.delete(callback);
      if (this.matchesCallbacks.size === 0) {
        this.stopMatchesUpdates();
      }
    };
  }

  // Stats real-time updates
  subscribeToStats(callback: (data: RealtimeStats) => void) {
    this.statsCallbacks.add(callback);
    
    if (!this.isRunning) {
      this.startStatsUpdates();
    }
    
    return () => {
      this.statsCallbacks.delete(callback);
      if (this.statsCallbacks.size === 0) {
        this.stopStatsUpdates();
      }
    };
  }

  private async fetchWalletData(): Promise<RealtimeWalletData | null> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;

      const response = await fetch('/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      return {
        balances: data.balances,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      return null;
    }
  }

  private async fetchMatchesData(): Promise<RealtimeMatchData[]> {
    try {
      const response = await fetch('/api/arcade/matches');
      if (!response.ok) return [];

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch matches data:', error);
      return [];
    }
  }

  private async fetchStatsData(): Promise<RealtimeStats | null> {
    try {
      const response = await fetch('/api/arcade/stats');
      if (!response.ok) return null;

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to fetch stats data:', error);
      return null;
    }
  }

  private startWalletUpdates() {
    if (this.walletInterval) return;
    
    this.walletInterval = setInterval(async () => {
      const data = await this.fetchWalletData();
      if (data) {
        this.walletCallbacks.forEach(callback => callback(data));
      }
    }, 5000); // Update every 5 seconds
  }

  private startMatchesUpdates() {
    if (this.matchesInterval) return;
    
    this.matchesInterval = setInterval(async () => {
      const data = await this.fetchMatchesData();
      this.matchesCallbacks.forEach(callback => callback(data));
    }, 3000); // Update every 3 seconds
  }

  private startStatsUpdates() {
    if (this.statsInterval) return;
    
    this.statsInterval = setInterval(async () => {
      const data = await this.fetchStatsData();
      if (data) {
        this.statsCallbacks.forEach(callback => callback(data));
      }
    }, 10000); // Update every 10 seconds
  }

  private stopWalletUpdates() {
    if (this.walletInterval) {
      clearInterval(this.walletInterval);
      this.walletInterval = null;
    }
  }

  private stopMatchesUpdates() {
    if (this.matchesInterval) {
      clearInterval(this.matchesInterval);
      this.matchesInterval = null;
    }
  }

  private stopStatsUpdates() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }

  // Manual refresh methods
  async refreshWallet(): Promise<RealtimeWalletData | null> {
    const data = await this.fetchWalletData();
    if (data) {
      this.walletCallbacks.forEach(callback => callback(data));
    }
    return data;
  }

  async refreshMatches(): Promise<RealtimeMatchData[]> {
    const data = await this.fetchMatchesData();
    this.matchesCallbacks.forEach(callback => callback(data));
    return data;
  }

  async refreshStats(): Promise<RealtimeStats | null> {
    const data = await this.fetchStatsData();
    if (data) {
      this.statsCallbacks.forEach(callback => callback(data));
    }
    return data;
  }

  // Cleanup
  destroy() {
    this.stopWalletUpdates();
    this.stopMatchesUpdates();
    this.stopStatsUpdates();
    this.walletCallbacks.clear();
    this.matchesCallbacks.clear();
    this.statsCallbacks.clear();
  }
}

// Singleton instance
export const realtimeService = new RealtimeService();

// React hooks for easy integration
export function useRealtimeWallet() {
  const [walletData, setWalletData] = useState<RealtimeWalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToWallet((data) => {
      setWalletData(data);
      setLoading(false);
      setError(null);
    });

    // Initial fetch
    realtimeService.refreshWallet();

    return unsubscribe;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await realtimeService.refreshWallet();
    if (!data) {
      setError('Failed to refresh wallet data');
    }
    setLoading(false);
  }, []);

  return { walletData, loading, error, refresh };
}

export function useRealtimeMatches() {
  const [matches, setMatches] = useState<RealtimeMatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToMatches((data) => {
      setMatches(data);
      setLoading(false);
      setError(null);
    });

    // Initial fetch
    realtimeService.refreshMatches();

    return unsubscribe;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await realtimeService.refreshMatches();
    setLoading(false);
  }, []);

  return { matches, loading, error, refresh };
}

export function useRealtimeStats() {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToStats((data) => {
      setStats(data);
      setLoading(false);
      setError(null);
    });

    // Initial fetch
    realtimeService.refreshStats();

    return unsubscribe;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await realtimeService.refreshStats();
    if (!data) {
      setError('Failed to refresh stats');
    }
    setLoading(false);
  }, []);

  return { stats, loading, error, refresh };
}
