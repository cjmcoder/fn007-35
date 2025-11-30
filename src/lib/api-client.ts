import { toast } from "@/hooks/use-toast";

// API Configuration - Production VPS backend via NGINX proxy
const API_BASE_URL = '/api';
const GAMING_API_URL = import.meta.env.VITE_GAMING_API_URL || 'https://gaming.flocknode.com';

// Types
export interface Match {
  id: string;
  hostId: string;
  oppId?: string;
  state: 'PENDING' | 'READY_CHECK' | 'READY' | 'ACTIVE' | 'COMPLETE' | 'CANCELLED' | 'DISPUTED';
  gameId: string;
  platform: string;
  entryFc: number;
  rulesetId?: string;
  bestOf: number;
  region: string;
  requireStream: boolean;
  startAt?: string;
  completeAt?: string;
  winnerId?: string;
  hostScore: number;
  oppScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMatchRequest {
  gameId: string;
  platform: string;
  entryFc: number;
  rulesetId?: string;
  bestOf?: 1 | 3 | 5;
  region?: string;
  requireStream?: boolean;
}

export interface JoinMatchRequest {
  matchId: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  roles: string[];
  trustScore: number;
  tfaEnabled: boolean;
  isBanned: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Match Operations
  async getMatches(params?: {
    cursor?: string;
    limit?: number;
    gameId?: string;
    platform?: string;
    region?: string;
    state?: string;
  }): Promise<{ matches: Match[]; nextCursor?: string; hasMore: boolean }> {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.gameId) searchParams.set('gameId', params.gameId);
    if (params?.platform) searchParams.set('platform', params.platform);
    if (params?.region) searchParams.set('region', params.region);
    if (params?.state) searchParams.set('state', params.state);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/match?${queryString}` : '/match';
    
    return this.request(endpoint);
  }

  async getActiveMatches(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<{ matches: Match[]; nextCursor?: string; hasMore: boolean }> {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/match/active?${queryString}` : '/api/match/active';
    
    return this.request(endpoint);
  }

  async createMatch(matchData: CreateMatchRequest): Promise<{
    matchId: string;
    state: string;
    escrowLocked: boolean;
    match: Match;
  }> {
    return this.request('/api/match/create', {
      method: 'POST',
      body: JSON.stringify(matchData),
    });
  }

  async joinMatch(matchId: string): Promise<{
    state: string;
    match: Match;
  }> {
    return this.request('/api/match/join', {
      method: 'POST',
      body: JSON.stringify({ matchId }),
    });
  }

  async getMatch(matchId: string): Promise<Match> {
    return this.request(`/api/match/${matchId}`);
  }

  // User Operations
  async getUser(userId: string): Promise<User> {
    return this.request(`/api/profile/${userId}`);
  }

  async getMyProfile(): Promise<User> {
    return this.request('/api/profile/me');
  }

  // Wallet Operations
  async getWalletBalance(): Promise<{
    balance: number;
    locked: number;
    available: number;
  }> {
    return this.request('/api/wallet/balance');
  }

  async getWalletHistory(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<{
    transactions: any[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/wallet/history?${queryString}` : '/api/wallet/history';
    
    return this.request(endpoint);
  }

  async lockFunds(amount: number, purpose: string): Promise<{
    lockId: string;
    amount: number;
    balance: number;
  }> {
    return this.request('/api/wallet/lock', {
      method: 'POST',
      body: JSON.stringify({ amount, purpose }),
    });
  }

  async unlockFunds(lockId: string): Promise<{
    amount: number;
    balance: number;
  }> {
    return this.request('/api/wallet/unlock', {
      method: 'POST',
      body: JSON.stringify({ lockId }),
    });
  }


  // Auth Operations
  async refreshToken(): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request('/auth/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    // Update stored tokens
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    this.token = response.accessToken;

    return response;
  }

  // Utility Methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Create and export singleton instances
export const apiClient = new ApiClient(API_BASE_URL);
export const gamingApiClient = new ApiClient(GAMING_API_URL);

// Export API URLs
export { API_BASE_URL, GAMING_API_URL };

// Helper functions for common operations
export const matchApi = {
  // Get pending matches (available to join)
  getPendingMatches: async (filters?: { gameId?: string; platform?: string; minFC?: number; maxFC?: number }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.gameId) params.set('gameId', filters.gameId);
      if (filters?.platform) params.set('platform', filters.platform);
      if (filters?.minFC) params.set('minFC', filters.minFC.toString());
      if (filters?.maxFC) params.set('maxFC', filters.maxFC.toString());

      const queryString = params.toString();
      const url = `${API_BASE_URL}/api/matches/pending${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch matches');
      
      const data = await response.json();
      return data.matches || [];
    } catch (error) {
      console.error('Failed to fetch pending matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  },

  // Get active matches for the arena (legacy - redirects to pending)
  getActiveMatches: async (limit = 20) => {
    return matchApi.getPendingMatches();
  },

  // Create a new match - REAL PRODUCTION
  createMatch: async (matchData: {
    gameId: string;
    gameName?: string;
    platform: string;
    entryFC: number;
    bestOf?: number;
    rules?: string[];
    requireStream?: boolean;
  }) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to create a match.",
          variant: "destructive",
        });
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/matches/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(matchData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create match');
      }

      const data = await response.json();
      
      toast({
        title: "Match Created!",
        description: data.message || "Your challenge has been posted. Waiting for opponents...",
      });

      return data;
    } catch (error) {
      console.error('Failed to create match:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create match. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Accept a match (join as opponent) - REAL PRODUCTION
  acceptMatch: async (matchId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to accept matches.",
          variant: "destructive",
        });
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept match');
      }

      const data = await response.json();
      
      toast({
        title: "Challenge Accepted!",
        description: data.message || "You've successfully joined the match. Get ready to compete!",
      });

      return data;
    } catch (error) {
      console.error('Failed to accept match:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept match. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Join a match (legacy alias)
  joinMatch: async (matchId: string) => {
    return matchApi.acceptMatch(matchId);
  },

  // Get user's active matches - REAL PRODUCTION
  getMyMatches: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return [];

      const response = await fetch(`${API_BASE_URL}/api/matches/my-matches`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch matches');
      
      const data = await response.json();
      return data.matches || [];
    } catch (error) {
      console.error('Failed to fetch my matches:', error);
      return [];
    }
  },

  // Get specific match details - REAL PRODUCTION
  getMatch: async (matchId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}`);
      if (!response.ok) throw new Error('Match not found');
      
      const data = await response.json();
      return data.match;
    } catch (error) {
      console.error('Failed to fetch match:', error);
      throw error;
    }
  },

  // Report match score - REAL PRODUCTION
  reportScore: async (matchId: string, scores: { hostScore?: number; oppScore?: number }) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/report-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(scores),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to report score');
      }

      const data = await response.json();
      
      if (data.resolved) {
        toast({
          title: "Match Completed!",
          description: data.message,
        });
      } else if (data.waiting) {
        toast({
          title: "Score Reported",
          description: data.message,
        });
      }

      return data;
    } catch (error) {
      console.error('Failed to report score:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to report score.",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Cancel match - REAL PRODUCTION
  cancelMatch: async (matchId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel match');
      }

      const data = await response.json();
      
      toast({
        title: "Match Cancelled",
        description: data.message,
      });

      return data;
    } catch (error) {
      console.error('Failed to cancel match:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel match.",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get match history - REAL PRODUCTION
  getMatchHistory: async (limit = 20) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return [];

      const response = await fetch(`${API_BASE_URL}/api/matches/history?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch history');
      
      const data = await response.json();
      return data.matches || [];
    } catch (error) {
      console.error('Failed to fetch match history:', error);
      return [];
    }
  },

  // Get match statistics - REAL PRODUCTION
  getMatchStats: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;

      const response = await fetch(`${API_BASE_URL}/api/matches/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('Failed to fetch match stats:', error);
      return null;
    }
  },
};

export const userApi = {
  // Get user profile
  getUser: async (userId: string) => {
    try {
      return await apiClient.getUser(userId);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile.",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get current user profile
  getMyProfile: async () => {
    try {
      return await apiClient.getMyProfile();
    } catch (error) {
      console.error('Failed to fetch my profile:', error);
      toast({
        title: "Error",
        description: "Failed to load your profile.",
        variant: "destructive",
      });
      throw error;
    }
  },
};

export const walletApi = {
  // Get wallet balance
  getBalance: async () => {
    try {
      return await apiClient.getWalletBalance();
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet balance.",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get wallet history
  getHistory: async (params?: { cursor?: string; limit?: number }) => {
    try {
      return await apiClient.getWalletHistory(params);
    } catch (error) {
      console.error('Failed to fetch wallet history:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet history.",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Lock funds for match
  lockFunds: async (amount: number, purpose: string) => {
    try {
      const response = await apiClient.lockFunds(amount, purpose);
      toast({
        title: "Funds Locked",
        description: `$${amount} locked for ${purpose}`,
      });
      return response;
    } catch (error) {
      console.error('Failed to lock funds:', error);
      toast({
        title: "Error",
        description: "Failed to lock funds. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Unlock funds
  unlockFunds: async (lockId: string) => {
    try {
      const response = await apiClient.unlockFunds(lockId);
      toast({
        title: "Funds Unlocked",
        description: `$${response.amount} has been unlocked`,
      });
      return response;
    } catch (error) {
      console.error('Failed to unlock funds:', error);
      toast({
        title: "Error",
        description: "Failed to unlock funds. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },
};

export const authApi = {
  // Register a new user
  register: async (userData: {
    email: string;
    username: string;
    displayName?: string;
    password: string;
    marketingConsent?: boolean;
  }) => {
    try {
      // Remove displayName since backend uses username as displayName
      const { displayName, ...registrationData } = userData;
      
      console.log('🔍 Registration Debug:', {
        url: `${API_BASE_URL}/api/auth/register`,
        data: registrationData
      });
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });
      
      console.log('🔍 Response Debug:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      console.log('🔍 Response Data:', data);
      
      // Store tokens
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('refreshToken', data.token); // Using same token for now
      apiClient.setToken(data.token);

      // Show success message with email verification notice
      toast({
        title: "Account Created!",
        description: data.message || "Welcome to FLOCKNODE! Please check your email to verify your account.",
      });

      return {
        user: data.user,
        token: data.token,
        refreshToken: data.token,
      };
    } catch (error) {
      console.error('🔍 Registration Error Details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to create account. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store tokens
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('refreshToken', data.token); // Using same token for now
      apiClient.setToken(data.token);

      return {
        user: data.user,
        token: data.token,
        refreshToken: data.token,
      };
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          await authApi.refreshToken();
          return authApi.getProfile(); // Retry with new token
        }
        throw new Error('Failed to fetch profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  },

  // Refresh access token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        apiClient.clearToken();
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();
      
      // Update stored tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      apiClient.setToken(data.accessToken);

      return {
        user: data.user,
        token: data.accessToken,
        refreshToken: data.refreshToken,
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Always clear local tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      apiClient.clearToken();
    }
  },
};

// Props API - Removed placeholder implementations
// Use real backend endpoints when available
export const propsApi = {
  getProps: async () => {
    const response = await fetch(`${API_BASE_URL}/props`);
    if (!response.ok) throw new Error('Failed to fetch props');
    return response.json();
  },
  createProp: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/props`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create prop');
    return response.json();
  },
  updateProp: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/props/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update prop');
    return response.json();
  },
  deleteProp: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/props/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete prop');
    return response.json();
  },
};

// Realtime connection - Removed placeholder implementations
// Use real WebSocket/SSE connection when backend supports it
export const realtimeConnection = {
  connect: () => {
    console.warn('Realtime connection not yet implemented');
  },
  disconnect: () => {
    console.warn('Realtime connection not yet implemented');
  },
  on: () => {
    console.warn('Realtime connection not yet implemented');
  },
  off: () => {
    console.warn('Realtime connection not yet implemented');
  },
  emit: () => {
    console.warn('Realtime connection not yet implemented');
  },
};

export const REALTIME_EVENTS = {
  MATCH_UPDATE: 'match_update',
  MATCH_CREATED: 'match_created',
  MATCH_JOINED: 'match_joined',
  MATCH_COMPLETED: 'match_completed',
  MATCH_CANCELLED: 'match_cancelled',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  CHAT_MESSAGE: 'chat_message',
  NOTIFICATION: 'notification',
};

export interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: string;
}