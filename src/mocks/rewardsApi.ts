import type { Quest, Streak, Achievement, Referral, StoreItem, RewardTransaction, PlayerLevel } from '@/lib/types';

// Mock data
const mockPlayerLevel: PlayerLevel = {
  level: 12,
  currentXP: 850,
  xpToNext: 1200,
  totalXP: 14850
};

const mockQuests: Quest[] = [
  // Daily Quests (Micro rewards)
  {
    id: 'daily-1',
    title: 'Complete 1 Verified Match',
    description: 'Win or lose, just complete one verified competitive match',
    type: 'daily',
    reward: 2,
    progress: 1,
    maxProgress: 1,
    completed: true,
    claimed: false,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    requiresVerification: true
  },
  {
    id: 'daily-2',
    title: 'Watch Teammate Stream',
    description: 'Watch a teammate\'s stream for at least 10 minutes',
    type: 'daily',
    reward: 1,
    progress: 7,
    maxProgress: 10,
    completed: false,
    claimed: false,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    requiresVerification: false
  },
  {
    id: 'daily-3',
    title: 'Unity Game Session',
    description: 'Play any Unity arcade game for 15 minutes',
    type: 'daily',
    reward: 1,
    progress: 15,
    maxProgress: 15,
    completed: true,
    claimed: true,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    requiresVerification: false
  },
  {
    id: 'daily-4',
    title: 'First Match Victory',
    description: 'Win your first match of the day (any game mode)',
    type: 'daily',
    reward: 3,
    progress: 0,
    maxProgress: 1,
    completed: false,
    claimed: false,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    requiresVerification: true
  },
  {
    id: 'daily-5',
    title: 'Join Community Chat',
    description: 'Send at least 5 messages in community channels',
    type: 'daily',
    reward: 1,
    progress: 3,
    maxProgress: 5,
    completed: false,
    claimed: false,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    requiresVerification: false
  },
  // Weekly Quests (Slightly higher rewards)
  {
    id: 'weekly-1',
    title: 'Win 5 Unity Matches',
    description: 'Achieve 5 victories in Unity arcade games this week',
    type: 'weekly',
    reward: 8,
    progress: 2,
    maxProgress: 5,
    completed: false,
    claimed: false,
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    requiresVerification: true
  },
  {
    id: 'weekly-2',
    title: 'Tournament Participation',
    description: 'Join and complete any 2 scheduled tournaments or events',
    type: 'weekly',
    reward: 6,
    progress: 0,
    maxProgress: 2,
    completed: false,
    claimed: false,
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    requiresVerification: true
  },
  {
    id: 'weekly-3',
    title: 'Console Gaming Streak',
    description: 'Win matches on console games 3 days in a row',
    type: 'weekly',
    reward: 10,
    progress: 1,
    maxProgress: 3,
    completed: false,
    claimed: false,
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    requiresVerification: true
  },
  {
    id: 'weekly-4',
    title: 'Skill Diversity',
    description: 'Play matches in 4 different game titles this week',
    type: 'weekly',
    reward: 7,
    progress: 2,
    maxProgress: 4,
    completed: false,
    claimed: false,
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    requiresVerification: true
  },
  {
    id: 'weekly-5',
    title: 'Social Engagement',
    description: 'Watch streams for 2+ hours and interact with 10 players',
    type: 'weekly',
    reward: 5,
    progress: 1,
    maxProgress: 2,
    completed: false,
    claimed: false,
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    requiresVerification: false
  }
];

const mockStreaks: Streak[] = [
  {
    id: 'login-streak',
    title: 'Daily Login Streak',
    description: 'Login every day to maintain your streak',
    currentStreak: 5,
    maxStreak: 12,
    lastActivityDate: new Date().toISOString(),
    dailyReward: 1,
    bonusReward: 5, // Bonus every 7 days
    canClaim: true,
    nextResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'match-streak',
    title: 'Match Streak',
    description: 'Play verified matches on consecutive days',
    currentStreak: 3,
    maxStreak: 8,
    lastActivityDate: new Date().toISOString(),
    dailyReward: 2,
    bonusReward: 8, // Bonus every 5 days
    canClaim: false,
    nextResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'win-streak',
    title: 'Victory Streak',
    description: 'Win matches on consecutive days (minimum 1 win per day)',
    currentStreak: 2,
    maxStreak: 6,
    lastActivityDate: new Date().toISOString(),
    dailyReward: 3,
    bonusReward: 12, // Bonus every 3 days
    canClaim: true,
    nextResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'social-streak',
    title: 'Community Streak',
    description: 'Engage with community features daily (chat, streams, etc.)',
    currentStreak: 1,
    maxStreak: 4,
    lastActivityDate: new Date().toISOString(),
    dailyReward: 1,
    bonusReward: 4, // Bonus every 7 days
    canClaim: false,
    nextResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockAchievements: Achievement[] = [
  // Bronze Tier (Common) - Small rewards
  {
    id: 'first-blood',
    title: 'First Blood',
    description: 'Win your first verified match',
    icon: '🩸',
    rarity: 'common',
    reward: 3,
    progress: 1,
    maxProgress: 1,
    completed: true,
    claimed: true,
    unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    tier: 'bronze'
  },
  {
    id: 'social-starter',
    title: 'Social Starter',
    description: 'Send your first 10 community messages',
    icon: '💬',
    rarity: 'common',
    reward: 2,
    progress: 10,
    maxProgress: 10,
    completed: true,
    claimed: false,
    unlockedAt: new Date().toISOString(),
    tier: 'bronze'
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Complete 5 daily login streaks',
    icon: '🌅',
    rarity: 'common',
    reward: 4,
    progress: 5,
    maxProgress: 5,
    completed: true,
    claimed: false,
    unlockedAt: new Date().toISOString(),
    tier: 'bronze'
  },
  // Silver Tier (Rare) - Medium rewards
  {
    id: 'clutch-master',
    title: 'Clutch Master',
    description: 'Win 5 matches while trailing by 10+ points',
    icon: '💎',
    rarity: 'rare',
    reward: 8,
    progress: 3,
    maxProgress: 5,
    completed: false,
    claimed: false,
    tier: 'silver'
  },
  {
    id: 'multi-talent',
    title: 'Multi-Talent',
    description: 'Win matches in 8 different game titles',
    icon: '🎯',
    rarity: 'rare',
    reward: 12,
    progress: 5,
    maxProgress: 8,
    completed: false,
    claimed: false,
    tier: 'silver'
  },
  {
    id: 'consistency-king',
    title: 'Consistency King',
    description: 'Maintain a 7-day login streak',
    icon: '⚡',
    rarity: 'rare',
    reward: 10,
    progress: 5,
    maxProgress: 7,
    completed: false,
    claimed: false,
    tier: 'silver'
  },
  {
    id: 'team-player',
    title: 'Team Player',
    description: 'Successfully refer 3 friends who complete their first match',
    icon: '🤝',
    rarity: 'rare',
    reward: 15,
    progress: 2,
    maxProgress: 3,
    completed: false,
    claimed: false,
    tier: 'silver'
  },
  // Gold Tier (Epic) - Higher rewards
  {
    id: 'streamer',
    title: 'Content Creator',
    description: 'Complete 10 verified matches while streaming',
    icon: '📺',
    rarity: 'epic',
    reward: 25,
    progress: 7,
    maxProgress: 10,
    completed: false,
    claimed: false,
    tier: 'gold'
  },
  {
    id: 'tournament-warrior',
    title: 'Tournament Warrior',
    description: 'Win 3 different tournament events',
    icon: '🏆',
    rarity: 'epic',
    reward: 30,
    progress: 1,
    maxProgress: 3,
    completed: false,
    claimed: false,
    tier: 'gold'
  },
  {
    id: 'unity-specialist',
    title: 'Unity Specialist',
    description: 'Win 50 Unity arcade matches',
    icon: '🎮',
    rarity: 'epic',
    reward: 35,
    progress: 23,
    maxProgress: 50,
    completed: false,
    claimed: false,
    tier: 'gold'
  },
  {
    id: 'mentor',
    title: 'Mentor',
    description: 'Help 5 new players complete their first match',
    icon: '🎓',
    rarity: 'epic',
    reward: 28,
    progress: 3,
    maxProgress: 5,
    completed: false,
    claimed: false,
    tier: 'gold'
  },
  // Platinum Tier (Legendary) - Prestigious rewards
  {
    id: 'perfect-week',
    title: 'Perfect Week',
    description: 'Win every match played in a week (minimum 15 matches)',
    icon: '⭐',
    rarity: 'legendary',
    reward: 75,
    progress: 12,
    maxProgress: 15,
    completed: false,
    claimed: false,
    tier: 'platinum'
  },
  {
    id: 'unity-champion',
    title: 'Unity Champion',
    description: 'Win 200 Unity arcade matches',
    icon: '👑',
    rarity: 'legendary',
    reward: 100,
    progress: 47,
    maxProgress: 200,
    completed: false,
    claimed: false,
    tier: 'platinum'
  },
  {
    id: 'marathon-legend',
    title: 'Marathon Legend',
    description: 'Play for 12 hours in a single day (with breaks)',
    icon: '⏰',
    rarity: 'legendary',
    reward: 60,
    progress: 8,
    maxProgress: 12,
    completed: false,
    claimed: false,
    tier: 'platinum'
  },
  {
    id: 'community-leader',
    title: 'Community Leader',
    description: 'Successfully refer 15 friends',
    icon: '🌟',
    rarity: 'legendary',
    reward: 120,
    progress: 4,
    maxProgress: 15,
    completed: false,
    claimed: false,
    tier: 'platinum'
  }
];

const mockReferrals: Referral[] = [
  {
    id: 'ref-1',
    friendName: 'Alex_Gamer',
    email: 'alex@example.com',
    status: 'rewarded',
    signupDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    rewardAmount: 5, // Reduced from 50
    claimed: true
  },
  {
    id: 'ref-2',
    friendName: 'ProPlayer_Mike',
    email: 'mike@example.com',
    status: 'verified',
    signupDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    rewardAmount: 5, // Reduced from 50
    claimed: false
  },
  {
    id: 'ref-3',
    friendName: 'GamerGirl_Sarah',
    email: 'sarah@example.com',
    status: 'verified',
    signupDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    rewardAmount: 5, // Reduced from 50
    claimed: false
  },
  {
    id: 'ref-4',
    friendName: 'CasualPlayer_Jon',
    email: 'jon@example.com',
    status: 'signed_up',
    signupDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    rewardAmount: 5, // Pending first match completion
    claimed: false
  },
  {
    id: 'ref-5',
    friendName: 'StreamQueen_Lisa',
    email: 'lisa@example.com',
    status: 'rewarded',
    signupDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    rewardAmount: 5,
    claimed: true
  }
];

const mockStoreItems: StoreItem[] = [
  // Common Items (Very affordable)
  {
    id: 'nameplate-basic',
    title: 'Bronze Competitor Badge',
    description: 'Basic nameplate showing your competitive spirit',
    category: 'nameplate',
    price: 8,
    rarity: 'common',
    image: '🥉',
    isLimited: false,
    owned: false
  },
  {
    id: 'booster-small',
    title: 'XP Boost (1.5x)',
    description: '50% extra XP gains for 12 hours',
    category: 'booster',
    price: 15,
    rarity: 'common',
    image: '⚡',
    isLimited: false,
    owned: true
  },
  {
    id: 'avatar-starter',
    title: 'Casual Gamer Avatar',
    description: 'Simple but clean avatar for everyday gaming',
    category: 'avatar',
    price: 12,
    rarity: 'common',
    image: '😎',
    isLimited: false,
    owned: false
  },
  // Rare Items (Moderate pricing)
  {
    id: 'avatar-1',
    title: 'Neon Warrior Avatar',
    description: 'A futuristic warrior avatar with glowing neon accents',
    category: 'avatar',
    price: 35,
    rarity: 'rare',
    image: '🤖',
    isLimited: false,
    owned: false
  },
  {
    id: 'nameplate-silver',
    title: 'Silver Champion Nameplate',
    description: 'Show your competitive status with this silver nameplate',
    category: 'nameplate',
    price: 28,
    rarity: 'rare',
    image: '🥈',
    isLimited: false,
    owned: false
  },
  {
    id: 'booster-medium',
    title: 'XP Booster (2x)',
    description: 'Double XP gains for 24 hours',
    category: 'booster',
    price: 25,
    rarity: 'rare',
    image: '💫',
    isLimited: false,
    owned: false
  },
  // Epic Items (Higher tier)
  {
    id: 'nameplate-gold',
    title: 'Golden Champion Nameplate',
    description: 'Show your elite status with this golden nameplate',
    category: 'nameplate',
    price: 60,
    rarity: 'epic',
    image: '🏆',
    isLimited: true,
    stock: 50,
    owned: false
  },
  {
    id: 'avatar-pro',
    title: 'Pro Esports Avatar',
    description: 'Professional-grade avatar with team colors and effects',
    category: 'avatar',
    price: 55,
    rarity: 'epic',
    image: '🎯',
    isLimited: false,
    owned: false
  },
  {
    id: 'booster-mega',
    title: 'Mega XP Booster (3x)',
    description: 'Triple XP gains for 48 hours',
    category: 'booster',
    price: 45,
    rarity: 'epic',
    image: '🚀',
    isLimited: true,
    stock: 20,
    owned: false
  },
  // Legendary Items (Premium pricing)
  {
    id: 'avatar-legend',
    title: 'Cyber Samurai',
    description: 'Traditional meets futuristic in this legendary avatar',
    category: 'avatar',
    price: 120,
    rarity: 'legendary',
    image: '🥷',
    isLimited: true,
    stock: 15,
    owned: false
  },
  {
    id: 'nameplate-platinum',
    title: 'Platinum Elite Badge',
    description: 'The ultimate status symbol for top competitors',
    category: 'nameplate',
    price: 150,
    rarity: 'legendary',
    image: '💎',
    isLimited: true,
    stock: 10,
    owned: false
  },
  {
    id: 'special-season',
    title: 'Season 3 Exclusive Skin',
    description: 'Limited time exclusive cosmetic for Season 3',
    category: 'special',
    price: 200,
    rarity: 'legendary',
    image: '✨',
    isLimited: true,
    stock: 8,
    owned: false
  },
  // Utility Items
  {
    id: 'utility-streak',
    title: 'Streak Protector',
    description: 'Protects one login streak from breaking (one-time use)',
    category: 'utility',
    price: 20,
    rarity: 'rare',
    image: '🛡️',
    isLimited: false,
    owned: false
  },
  {
    id: 'utility-quest',
    title: 'Quest Skip Token',
    description: 'Instantly complete one daily quest (one-time use)',
    category: 'utility',
    price: 18,
    rarity: 'rare',
    image: '⏭️',
    isLimited: false,
    owned: false
  }
];

const mockHistory: RewardTransaction[] = [
  {
    id: 'tx-1',
    type: 'quest',
    title: 'Daily Quest: Complete Match',
    description: 'Completed daily quest reward',
    amount: 2,
    date: new Date().toISOString(),
    status: 'completed'
  },
  {
    id: 'tx-2',
    type: 'achievement',
    title: 'Achievement: First Blood',
    description: 'Unlocked First Blood achievement',
    amount: 3,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: 'tx-3',
    type: 'redeem',
    title: 'XP Booster Purchase',
    description: 'Purchased 1.5x XP Booster',
    amount: -15,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: 'tx-4',
    type: 'streak',
    title: 'Login Streak Bonus',
    description: 'Day 5 login streak reward',
    amount: 1,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: 'tx-5',
    type: 'referral',
    title: 'Referral Bonus',
    description: 'Friend Alex_Gamer completed first match',
    amount: 5,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: 'tx-6',
    type: 'quest',
    title: 'Daily Quest: Watch Stream',
    description: 'Watched teammate stream for 10+ minutes',
    amount: 1,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: 'tx-7',
    type: 'quest',
    title: 'Daily Quest: First Victory',
    description: 'Won first match of the day',
    amount: 3,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: 'tx-8',
    type: 'streak',
    title: 'Victory Streak Bonus',
    description: 'Day 3 victory streak reward',
    amount: 3,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: 'tx-9',
    type: 'redeem',
    title: 'Bronze Badge Purchase',
    description: 'Purchased Bronze Competitor Badge',
    amount: -8,
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: 'tx-10',
    type: 'achievement',
    title: 'Achievement: Social Starter',
    description: 'Unlocked Social Starter achievement',
    amount: 2,
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  }
];

// API Functions
export const getRewardsSummary = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const unclaimedRewards = [
    ...mockQuests.filter(q => q.completed && !q.claimed).map(q => ({
      id: q.id,
      type: 'quest' as const,
      title: q.title,
      reward: q.reward
    })),
    ...mockStreaks.filter(s => s.canClaim).map(s => ({
      id: s.id,
      type: 'streak' as const,
      title: s.title,
      reward: s.dailyReward
    })),
    ...mockAchievements.filter(a => a.completed && !a.claimed).map(a => ({
      id: a.id,
      type: 'achievement' as const,
      title: a.title,
      reward: a.reward
    }))
  ];

  return {
    playerLevel: mockPlayerLevel,
    unclaimedRewards,
    referralCode: 'FLOCKNODE123',
    seasonEndsIn: '12d 04:12'
  };
};

export const getQuests = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockQuests;
};

export const getStreaks = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockStreaks;
};

export const getAchievements = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockAchievements;
};

export const getReferrals = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockReferrals;
};

export const getStoreItems = async (filters: any) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  let items = [...mockStoreItems];
  
  if (filters.category !== 'all') {
    items = items.filter(item => item.category === filters.category);
  }
  
  if (filters.rarity !== 'all') {
    items = items.filter(item => item.rarity === filters.rarity);
  }
  
  items = items.filter(item => 
    item.price >= filters.minPrice && item.price <= filters.maxPrice
  );
  
  return items;
};

export const getRewardHistory = async (page: number = 1) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockHistory;
};

export const claimQuest = async (questId: string) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const quest = mockQuests.find(q => q.id === questId);
  if (!quest || !quest.completed || quest.claimed) {
    throw new Error('Quest cannot be claimed');
  }
  
  // Update quest status
  quest.claimed = true;
  
  return {
    success: true,
    reward: quest.reward,
    newBalance: 1250 + quest.reward
  };
};

export const claimStreak = async (streakId: string) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const streak = mockStreaks.find(s => s.id === streakId);
  if (!streak || !streak.canClaim) {
    throw new Error('Streak bonus cannot be claimed');
  }
  
  const reward = streak.currentStreak === 7 ? streak.bonusReward || streak.dailyReward : streak.dailyReward;
  
  // Update streak status
  streak.canClaim = false;
  
  return {
    success: true,
    reward,
    newBalance: 1250 + reward
  };
};

export const claimAchievement = async (achievementId: string) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const achievement = mockAchievements.find(a => a.id === achievementId);
  if (!achievement || !achievement.completed || achievement.claimed) {
    throw new Error('Achievement cannot be claimed');
  }
  
  // Update achievement status
  achievement.claimed = true;
  
  return {
    success: true,
    reward: achievement.reward,
    newBalance: 1250 + achievement.reward
  };
};

export const redeemStoreItem = async (itemId: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const item = mockStoreItems.find(i => i.id === itemId);
  if (!item) {
    throw new Error('Item not found');
  }
  
  if (item.owned) {
    throw new Error('Item already owned');
  }
  
  if (1250 < item.price) { // Using mock wallet balance
    throw new Error('Insufficient FC balance');
  }
  
  if (item.stock !== undefined && item.stock <= 0) {
    throw new Error('Item out of stock');
  }
  
  // Update item status
  item.owned = true;
  if (item.stock !== undefined) {
    item.stock--;
  }
  
  return {
    success: true,
    item,
    newBalance: 1250 - item.price
  };
};