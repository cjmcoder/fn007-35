import { create } from 'zustand';
import { Wallet } from '@/lib/types';
import { walletApi } from '@/lib/api';

interface WalletState {
  wallet: Wallet;
  isConnected: boolean;
  isConnecting: boolean;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  addFC: (amount: number) => Promise<void>;
  updateBalance: (newWallet: Wallet) => void;
}

export const useWallet = create<WalletState>((set, get) => ({
  wallet: {
    fc: 0,
    lockedFC: 0
  },
  isConnected: false,
  isConnecting: false,
  
  connectWallet: async () => {
    set({ isConnecting: true });
    
    try {
      // Get real wallet balance from production API
      // TODO: Get userId from auth context
      const userId = localStorage.getItem('userId') || '';
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const response = await fetch(`/api/wallet/${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch wallet: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Parse wallet response from backend
      // Backend returns balances in minor units, convert to FC
      const fcBalance = data.balances?.find((b: any) => b.currency === 'FC');
      const fcAmount = fcBalance ? parseFloat(fcBalance.balanceMinor || '0') / 100 : 0;
      
      set({ 
        isConnected: true, 
        isConnecting: false,
        wallet: {
          fc: fcAmount,
          lockedFC: data.lockedFC || 0
        }
      });
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      set({ 
        isConnected: false, 
        isConnecting: false,
        wallet: {
          fc: 0,
          lockedFC: 0
        }
      });
      throw error;
    }
  },
  
  disconnectWallet: () => {
    set({ 
      isConnected: false,
      wallet: { fc: 0, lockedFC: 0 }
    });
  },
  
  addFC: async (usdAmount: number) => {
    // Deposit is handled by deposit modals which redirect to Stripe/PayPal
    // After successful payment, refresh wallet balance
    try {
      await get().connectWallet();
    } catch (error) {
      console.error('Failed to refresh wallet after deposit:', error);
      throw error;
    }
  },
  
  
  updateBalance: (newWallet: Wallet) => {
    set({ wallet: newWallet });
  }
}));