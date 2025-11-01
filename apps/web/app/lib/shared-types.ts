// Shared types (replacement for @flocknode/shared)

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  kycStatus?: string;
}

export interface SessionInfo {
  user?: AuthUser;
  isAuthenticated?: boolean;
  expiresAt?: Date;
}

export interface BalanceItem {
  currency: string;
  balance: string;
  balanceFormatted?: string;
  decimals?: number;
}

export interface WalletBalanceResponseDto {
  balances: BalanceItem[];
  totalUsdValue?: string;
}

export interface WagerSummaryDto {
  id: string;
  matchId: string;
  entryMinor: string;
  entryFormatted?: string;
  currency: string;
  status: string;
  creator?: { username: string };
  opponent?: { username: string };
  winner?: { username: string };
}

export interface PropSummaryDto {
  id: string;
  matchId: string;
  type: string;
  status?: string;
  state?: string;
  label?: string;
  cutoffAt?: string;
  minEntryFormatted?: string;
  maxEntryFormatted?: string;
  totalStaked?: number;
  pools?: Record<string, { totalFormatted: string; count: number }>;
}
