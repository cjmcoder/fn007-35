export type Platform = 'PS5' | 'Xbox' | 'PC' | 'Switch' | 'Mobile';
export type GameTitle = 'Madden' | 'Madden NFL 25' | 'UFC' | 'UFC 5' | 'FIFA' | 'FIFA 24' | 'NHL' | 'NHL 24' | 'NBA' | 'NBA 2K25' | 'UNDISPUTED' | 'F1' | 'TENNIS' | 'MLB' | 'CustomUnity' | 'Arena Warriors' | 'Speed Trials';
export type Rank = 'All' | 'Rookie' | 'Pro' | 'Elite';

export interface UserRef {
  id: string;
  name: string;
  rating: number;
  avatarUrl?: string;
}

export interface Challenge {
  id: string;
  title: string;               // "Madden NFL 25 — PS5"
  game: GameTitle;
  platform: Platform;
  entryFC: number;             // 1..2000
  payoutFC: number;            // entry * 2 - fee
  creator: UserRef;
  opponent?: UserRef;
  mode: '1v1' | 'SoloSkill';
  rank: Rank;
  rules: string;
  region?: string;
  streamRequired: boolean;     // if true: matchID in title required
  status: 'Open' | 'InMatch' | 'Disputed' | 'Complete';
  createdAt: string;
  tier: 'tier1' | 'tier2' | 'vip';  // New tier system
  trustScore: 'green' | 'yellow' | 'red';  // Player reputation
  winStreak: number;           // Current streak counter
  isLocked?: boolean;          // VIP access requirement
  lockReason?: string;         // Why VIP is locked
}

export interface Wallet {
  fc: number;
  lockedFC: number;
}

export interface SquawkMessage {
  id: string;
  channel: string;  // 'Madden'|'UFC'|...
  user: UserRef;
  text: string;
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  rating: number;
  avatarUrl?: string;
  platforms: Platform[];
  gamesPlayed: number;
  winRate: number;
  status: 'online' | 'offline' | 'in-match';
}

export interface Tournament {
  id: string;
  title: string;
  game: GameTitle;
  platform: Platform;
  entryFC: number;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  startDate: string;
  status: 'upcoming' | 'in-progress' | 'completed';
}

export interface GameEvent {
  id: string;
  title: string;
  game: GameTitle;
  platform: Platform | 'All';
  format: '1v1' | 'Bracket' | 'Swiss' | 'Leaderboard';
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  startTime: string;
  duration: string;
  status: 'open' | 'live' | 'full' | 'completed';
  verified: boolean;
  streamRequired: boolean;
  isJoined: boolean;
  description?: string;
  host?: string;
}

// --- Live Props Ticker Types ---
export type TickerChannel = 'Madden' | 'UFC' | 'FIFA' | 'NHL' | 'NBA' | 'UNDISPUTED' | 'F1' | 'TENNIS' | 'MLB' | 'Unity';
export type PropType = 'Over/Under';

export interface LiveProp {
  id: string;
  channel: TickerChannel;
  player: { id: string; name: string; rating: number };
  opponent?: { id: string; name: string; rating: number };
  game: GameTitle;
  platform: Platform;
  propType: PropType;
  title: string; // UX copy like "Over/Under: Total Points (45.5)"
  line: number; // The betting line (e.g., 45.5)
  statType: string; // The stat being tracked (e.g., "Total Points", "Rushing Yards")
  entryFC: number; // stake (entry)
  payoutFC: number; // projected payout
  matchId?: string; // used for stream verification
  streamRequired?: boolean;
  createdAt: string;
  startsInSec?: number;
}

// Rewards System Types
export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  reward: number; // FC amount
  progress: number;
  maxProgress: number;
  completed: boolean;
  claimed: boolean;
  expiresAt: string;
  requiresVerification: boolean;
}

export interface Streak {
  id: string;
  title: string;
  description: string;
  currentStreak: number;
  maxStreak: number;
  lastActivityDate: string;
  dailyReward: number;
  bonusReward?: number; // for milestone days
  canClaim: boolean;
  nextResetAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
  claimed: boolean;
  unlockedAt?: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface Referral {
  id: string;
  friendName: string;
  email: string;
  status: 'signed_up' | 'verified' | 'rewarded';
  signupDate: string;
  rewardAmount: number;
  claimed: boolean;
}

export interface StoreItem {
  id: string;
  title: string;
  description: string;
  category: 'avatar' | 'nameplate' | 'booster' | 'special' | 'utility';
  price: number; // FC cost
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image: string;
  stock?: number; // undefined = unlimited
  isLimited: boolean;
  owned: boolean;
}

export interface RewardTransaction {
  id: string;
  type: 'quest' | 'streak' | 'achievement' | 'referral' | 'redeem' | 'purchase';
  title: string;
  description: string;
  amount: number; // positive for earned, negative for spent
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface PlayerLevel {
  level: number;
  currentXP: number;
  xpToNext: number;
  totalXP: number;
}