import { useState, useEffect, useContext, createContext, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  role: string;
  trustScore: number;
  reputation: number;
  level: number;
  experience: number;
  walletBalance: {
    fc: number;
    lockedFC: number;
  };
  profile: {
    bio?: string;
    location?: string;
    timezone?: string;
    avatarUrl?: string;
  };
  stats: {
    totalMatches: number;
    totalWins: number;
    totalLosses: number;
    winRate: number;
    totalEarnings: number;
    totalDeposits: number;
    totalWithdrawals: number;
  };
  flags: {
    isHighRisk: boolean;
    isVip: boolean;
    hasViolations: boolean;
    isTrustedTrader: boolean;
  };
  kycStatus: string;
  createdAt: string;
  lastLoginAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // If session is invalid, clear user data
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // First try to get user from localStorage (for immediate UI update)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('user');
        }
      }

      // Then verify with server
      await refreshUser();
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
