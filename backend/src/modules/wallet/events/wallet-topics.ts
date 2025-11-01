export const WALLET_TOPICS = {
  WAGER_LOCKED: 'wallet.wager.locked',
  WAGER_REFUND: 'wallet.wager.refund',
  WAGER_PAYOUT: 'wallet.wager.payout',
} as const;

export type WalletWagerLocked = { 
  matchId: string; 
  userId: string; 
  amountFc: string; 
};

export type WalletRefund = { 
  matchId: string; 
  refunded: string; 
};

export type WalletPayout = { 
  matchId: string; 
  winnerId: string; 
  winnerTake: string; 
  platformFee: string; 
};





