import axios from 'axios';

// Simple idempotency key generator (replacement for @flocknode/shared)
function generateIdempotencyKey(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Create axios instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // Include cookies for JWT
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Add idempotency key for money-moving operations
    const moneyMovingMethods = ['POST', 'PUT', 'PATCH'];
    const moneyMovingPaths = ['/wallet/credit', '/wallet/withdraw', '/wager', '/prop'];
    
    if (
      moneyMovingMethods.includes(config.method?.toUpperCase() || '') &&
      moneyMovingPaths.some(path => config.url?.includes(path))
    ) {
      if (!config.headers['Idempotency-Key']) {
        config.headers['Idempotency-Key'] = generateIdempotencyKey('web');
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Typed API methods
export const api = {
  // Auth
  async login(provider: string) {
    return apiClient.post('/auth/login', { provider });
  },

  async logout() {
    return apiClient.post('/auth/logout');
  },

  async getSession() {
    return apiClient.get('/auth/session');
  },

  // Wallet
  async getWalletBalance() {
    return apiClient.get('/wallet/balance');
  },

  async withdrawFunds(data: {
    currency: string;
    amountMinor: string;
    chain: string;
    toAddress: string;
  }) {
    return apiClient.post('/wallet/withdraw', data);
  },

  async getWalletHistory(params?: {
    currency?: string;
    limit?: number;
    offset?: number;
  }) {
    return apiClient.get('/wallet/history', { params });
  },

  // Wagers
  async createWager(data: {
    matchId: string;
    entryMinor: string;
    currency: string;
  }) {
    return apiClient.post('/wager/create', data);
  },

  async joinWager(wagerId: string) {
    return apiClient.post(`/wager/${wagerId}/join`);
  },

  async getWagers(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    return apiClient.get('/wager', { params });
  },

  // Props
  async getProps(params?: {
    matchId?: string;
    game?: string;
    state?: string;
    limit?: number;
    offset?: number;
  }) {
    return apiClient.get('/prop', { params });
  },

  async stakeProp(data: {
    propId: string;
    side: string;
    entryMinor: string;
  }) {
    return apiClient.post('/prop/stake', data);
  },

  async getMyPropStakes(params?: {
    matchId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    return apiClient.get('/prop/my-stakes', { params });
  },

  // Payments
  async createDeposit(data: {
    currency: string;
    amountMinor: string;
    provider?: string;
  }) {
    return apiClient.post('/payment/deposit', data);
  },

  async getPaymentHistory(params?: {
    type?: 'deposit' | 'withdrawal';
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    return apiClient.get('/payment/history', { params });
  },

  // Health
  async getHealth() {
    return apiClient.get('/health');
  },
};
