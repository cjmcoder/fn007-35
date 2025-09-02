import { create } from 'zustand';
import { Wallet } from '@/lib/types';

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
    fc: 1250,
    lockedFC: 0
  },
  isConnected: true, // Auto-connected for demo
  isConnecting: false,
  
  connectWallet: async () => {
    set({ isConnecting: true });
    
    // Mock MetaMask Embedded connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set({ 
      isConnected: true, 
      isConnecting: false,
      wallet: {
        fc: 1250,
        lockedFC: 0
      }
    });
  },
  
  disconnectWallet: () => {
    set({ 
      isConnected: false,
      wallet: { fc: 0, lockedFC: 0 }
    });
  },
  
  addFC: async (usdAmount: number) => {
    // Mock credit card processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const fcToAdd = usdAmount * 100; // $1 = 100 FC
    const currentWallet = get().wallet;
    
    set({
      wallet: {
        ...currentWallet,
        fc: currentWallet.fc + fcToAdd
      }
    });
  },
  
  
  updateBalance: (newWallet: Wallet) => {
    set({ wallet: newWallet });
  }
}));