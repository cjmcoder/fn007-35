// Simple API client without axios for now
const API_BASE_URL = '/api';

// Simple fetch wrapper
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return response.json();
}

// Auth API
export const authApi = {
  getMe: () => apiCall('/auth/me'),
  loginGoogle: () => window.location.href = `${API_BASE_URL}/auth/google`,
  loginDiscord: () => window.location.href = `${API_BASE_URL}/auth/discord`,
  loginTwitch: () => window.location.href = `${API_BASE_URL}/auth/twitch`,
  logout: () => {
    localStorage.removeItem('flocknode-token');
    window.location.href = '/';
  }
};

// Wallet API
export const walletApi = {
  getBalance: () => apiCall('/wallet/balance'),
  deposit: (amount: number, method: string) => apiCall('/wallet/deposit', {
    method: 'POST',
    body: JSON.stringify({ amount, method }),
  }),
  withdraw: (amount: number, method: string, address?: string) => 
    apiCall('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, method, address }),
    }),
};

// Props API
export const propsApi = {
  getProps: () => apiCall('/props'),
  createProp: (data: any) => apiCall('/props', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  stakeProp: (propId: string, amount: number) => apiCall(`/props/${propId}/stake`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  }),
  joinProp: (propId: string) => apiCall(`/props/${propId}/join`, {
    method: 'POST',
  }),
};

// Challenges API
export const challengesApi = {
  getChallenges: () => apiCall('/challenges'),
  createChallenge: (data: any) => apiCall('/challenges', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  joinChallenge: (challengeId: string) => apiCall(`/challenges/${challengeId}/join`, {
    method: 'POST',
  }),
  cancelChallenge: (challengeId: string) => apiCall(`/challenges/${challengeId}`, {
    method: 'DELETE',
  }),
};

export default { authApi, walletApi, propsApi, challengesApi };
