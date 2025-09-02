/**
 * Calculate payout from entry amount with platform fee
 */
export function calculatePayout(entryFC: number, platformFeePercent: number = 5): number {
  const totalPot = entryFC * 2;
  const fee = Math.round(totalPot * (platformFeePercent / 100));
  return totalPot - fee;
}

/**
 * Calculate platform fee from entry amount
 */
export function calculateFee(entryFC: number, platformFeePercent: number = 5): number {
  const totalPot = entryFC * 2;
  return Math.round(totalPot * (platformFeePercent / 100));
}


/**
 * Format FC amount for display
 */
export function formatFC(amount: number): string {
  return amount.toLocaleString();
}

/**
 * Calculate tournament prize pool after platform fee
 */
export function calculateTournamentPrizePool(entryFee: number, participants: number, platformFeePercent: number = 15): {
  totalCollected: number;
  platformFee: number;
  prizePoolAfterFee: number;
} {
  const totalCollected = entryFee * participants;
  const platformFee = Math.round(totalCollected * (platformFeePercent / 100));
  const prizePoolAfterFee = totalCollected - platformFee;
  
  return {
    totalCollected,
    platformFee,
    prizePoolAfterFee
  };
}

/**
 * Calculate tournament prize distribution (1st 60%, 2nd 25%, 3rd 15%)
 */
export function calculateTournamentPayouts(prizePool: number): {
  first: number;
  second: number;
  third: number;
} {
  return {
    first: Math.round(prizePool * 0.60),
    second: Math.round(prizePool * 0.25),
    third: Math.round(prizePool * 0.15)
  };
}

/**
 * Calculate leaderboard FC rewards for top 15 positions
 * Based on weekly leaderboard prize structure
 */
export function calculateLeaderboardRewards(rank: number): number {
  if (rank > 15) return 0;
  
  if (rank === 1) return 150; // 🥇 Rank 1: 150 FC
  if (rank >= 2 && rank <= 3) return 100; // 🥈 Ranks 2–3: 100 FC  
  if (rank >= 4 && rank <= 10) return 50; // 🏅 Ranks 4–10: 50 FC
  if (rank >= 11 && rank <= 15) return 25; // 🎖 Ranks 11–15: 25 FC
  
  return 0;
}

/**
 * Validate entry amount
 */
export function validateEntryAmount(amount: number): { isValid: boolean; error?: string } {
  if (amount < 1) {
    return { isValid: false, error: 'Minimum entry is 1 FC' };
  }
  if (amount > 2000) {
    return { isValid: false, error: 'Maximum entry is 2,000 FC' };
  }
  if (!Number.isInteger(amount)) {
    return { isValid: false, error: 'Entry must be a whole number' };
  }
  return { isValid: true };
}