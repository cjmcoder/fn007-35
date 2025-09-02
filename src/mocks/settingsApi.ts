// Mock API for Settings page data

export interface UserSettings {
  account: {
    username: string;
    displayName: string;
    email: string;
    bio: string;
    region: string;
    timezone: string;
    avatar?: string;
  };
  security: {
    twoFactorEnabled: boolean;
    securityAlerts: boolean;
  };
  notifications: {
    email: {
      matchInvites: boolean;
      tournaments: boolean;
      rewards: boolean;
      newsletter: boolean;
      promotions: boolean;
    };
    push: {
      liveEvents: boolean;
      balanceUpdates: boolean;
      challenges: boolean;
      results: boolean;
    };
    inApp: {
      mentions: boolean;
      leaderboards: boolean;
      messages: boolean;
      systemAlerts: boolean;
    };
    doNotDisturb: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    matchHistoryVisible: boolean;
    streamLinkVisible: boolean;
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
    showInLeaderboards: boolean;
  };
  preferences: {
    theme: 'dark' | 'light' | 'system';
    language: string;
    showUnityGames: boolean;
    showConsoleGames: boolean;
    showPropsFeeds: boolean;
    autoPlayVideos: boolean;
    experimentalFeatures: boolean;
    compactMode: boolean;
    showAnimations: boolean;
  };
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  default: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'Top-up' | 'Entry Fee' | 'Prize' | 'Withdrawal';
  description: string;
  amount: string;
  status: 'Completed' | 'Pending' | 'Failed';
  method: string;
}

// Mock user settings data
export const mockUserSettings: UserSettings = {
  account: {
    username: 'FlockEagle',
    displayName: 'The Flock Eagle',
    email: 'eagle@flocknode.com',
    bio: 'Competitive gamer focused on skill-based challenges. Always looking for the next big tournament!',
    region: 'us-east',
    timezone: 'America/New_York',
  },
  security: {
    twoFactorEnabled: false,
    securityAlerts: true,
  },
  notifications: {
    email: {
      matchInvites: true,
      tournaments: true,
      rewards: true,
      newsletter: false,
      promotions: false,
    },
    push: {
      liveEvents: true,
      balanceUpdates: true,
      challenges: true,
      results: true,
    },
    inApp: {
      mentions: true,
      leaderboards: true,
      messages: true,
      systemAlerts: true,
    },
    doNotDisturb: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
  },
  privacy: {
    profileVisibility: 'public',
    matchHistoryVisible: true,
    streamLinkVisible: true,
    showOnlineStatus: true,
    allowDirectMessages: true,
    showInLeaderboards: true,
  },
  preferences: {
    theme: 'dark',
    language: 'en',
    showUnityGames: true,
    showConsoleGames: true,
    showPropsFeeds: true,
    autoPlayVideos: false,
    experimentalFeatures: false,
    compactMode: false,
    showAnimations: true,
  },
};

// Mock API functions
export const settingsApi = {
  async getUserSettings(): Promise<UserSettings> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockUserSettings), 500);
    });
  },

  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, this would update the backend
        const updatedSettings = { ...mockUserSettings, ...settings };
        resolve(updatedSettings);
      }, 500);
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock password validation
        resolve(currentPassword === 'correct_password');
      }, 1000);
    });
  },

  async enable2FA(): Promise<{ qrCode: string; backupCodes: string[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          qrCode: 'data:image/png;base64,mock_qr_code',
          backupCodes: ['123456', '789012', '345678', '901234', '567890'],
        });
      }, 1000);
    });
  },

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            type: 'Visa',
            last4: '4242',
            expiryMonth: '12',
            expiryYear: '2025',
            default: true,
          },
          {
            id: '2',
            type: 'Mastercard',
            last4: '8888',
            expiryMonth: '06',
            expiryYear: '2026',
            default: false,
          },
        ]);
      }, 500);
    });
  },

  async getTransactions(limit: number = 10): Promise<Transaction[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'tx_001',
            date: '2024-01-15',
            type: 'Top-up',
            description: 'FC Purchase',
            amount: '+500 FC',
            status: 'Completed',
            method: '•••• 4242',
          },
          {
            id: 'tx_002',
            date: '2024-01-14',
            type: 'Entry Fee',
            description: 'Madden Tournament Entry',
            amount: '-25 FC',
            status: 'Completed',
            method: 'FC Balance',
          },
          {
            id: 'tx_003',
            date: '2024-01-14',
            type: 'Prize',
            description: 'Tournament Winnings',
            amount: '+100 FC',
            status: 'Completed',
            method: 'FC Balance',
          },
          {
            id: 'tx_004',
            date: '2024-01-13',
            type: 'Entry Fee',
            description: 'Arena Warriors Challenge',
            amount: '-15 FC',
            status: 'Completed',
            method: 'FC Balance',
          },
          {
            id: 'tx_005',
            date: '2024-01-12',
            type: 'Top-up',
            description: 'FC Purchase',
            amount: '+200 FC',
            status: 'Completed',
            method: '•••• 8888',
          },
        ]);
      }, 500);
    });
  },

  async requestDataDownload(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 1000);
    });
  },

  async deleteAccount(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 2000);
    });
  },
};