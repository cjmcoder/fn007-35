import { Injectable, Logger } from '@nestjs/common';

export interface LeaderboardEntry {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  rank: number;
  score: number;
  level: number;
  gamesPlayed: number;
  winRate: number;
  totalEarnings: number;
  streak: number;
  badges: string[];
  lastActive: string;
  gameMode: 'console_stream' | 'cloud_gaming' | 'all';
}

export interface UserStats {
  rank: number;
  score: number;
  level: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  totalEarnings: number;
  currentStreak: number;
  bestStreak: number;
  badges: string[];
  achievements: string[];
  lastGamePlayed: string;
  favoriteGame: string;
  averageMatchDuration: number;
}

export interface LeaderboardCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  timeRange: 'daily' | 'weekly' | 'monthly' | 'all_time';
  gameMode?: 'console_stream' | 'cloud_gaming' | 'all';
}

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  // Mock data for development
  private mockLeaderboardData: LeaderboardEntry[] = [
    {
      id: '1',
      username: 'progamer123',
      displayName: 'ProGamer123',
      rank: 1,
      score: 15420,
      level: 25,
      gamesPlayed: 156,
      winRate: 78.5,
      totalEarnings: 1250.50,
      streak: 12,
      badges: ['champion', 'streak_master', 'high_roller'],
      lastActive: new Date().toISOString(),
      gameMode: 'all'
    },
    {
      id: '2',
      username: 'flockmaster',
      displayName: 'FlockMaster',
      rank: 2,
      score: 14280,
      level: 23,
      gamesPlayed: 134,
      winRate: 76.2,
      totalEarnings: 980.25,
      streak: 8,
      badges: ['elite', 'consistent'],
      lastActive: new Date().toISOString(),
      gameMode: 'all'
    },
    {
      id: '3',
      username: 'cloudking',
      displayName: 'CloudKing',
      rank: 3,
      score: 13890,
      level: 22,
      gamesPlayed: 142,
      winRate: 74.8,
      totalEarnings: 875.75,
      streak: 5,
      badges: ['cloud_master', 'quick_learner'],
      lastActive: new Date().toISOString(),
      gameMode: 'all'
    },
    {
      id: '4',
      username: 'consolequeen',
      displayName: 'ConsoleQueen',
      rank: 4,
      score: 12560,
      level: 21,
      gamesPlayed: 118,
      winRate: 72.3,
      totalEarnings: 720.40,
      streak: 3,
      badges: ['console_expert'],
      lastActive: new Date().toISOString(),
      gameMode: 'all'
    },
    {
      id: '5',
      username: 'newcomer',
      displayName: 'NewComer',
      rank: 5,
      score: 8920,
      level: 18,
      gamesPlayed: 89,
      winRate: 68.9,
      totalEarnings: 445.20,
      streak: 2,
      badges: ['rising_star'],
      lastActive: new Date().toISOString(),
      gameMode: 'all'
    }
  ];

  private mockUserStats: Map<string, UserStats> = new Map([
    ['flocknodeadmin@flocknode.com', {
      rank: 15,
      score: 7560,
      level: 16,
      gamesPlayed: 67,
      wins: 45,
      losses: 22,
      winRate: 67.2,
      totalEarnings: 340.80,
      currentStreak: 4,
      bestStreak: 8,
      badges: ['admin', 'founder', 'early_adopter'],
      achievements: ['first_match', 'win_streak_5', 'earn_100_fc'],
      lastGamePlayed: new Date().toISOString(),
      favoriteGame: 'PES6',
      averageMatchDuration: 12.5
    }],
    ['user@flocknode.com', {
      rank: 8,
      score: 10240,
      level: 19,
      gamesPlayed: 95,
      wins: 68,
      losses: 27,
      winRate: 71.6,
      totalEarnings: 520.45,
      currentStreak: 6,
      bestStreak: 11,
      badges: ['dedicated', 'improving'],
      achievements: ['first_win', 'win_streak_3', 'earn_50_fc', 'play_50_matches'],
      lastGamePlayed: new Date().toISOString(),
      favoriteGame: 'Assetto Corsa',
      averageMatchDuration: 15.2
    }]
  ]);

  getCategories(): LeaderboardCategory[] {
    return [
      {
        id: 'overall',
        name: 'Overall Leaderboard',
        description: 'Top players across all game modes',
        icon: '🏆',
        timeRange: 'all_time',
        gameMode: 'all'
      },
      {
        id: 'console_stream',
        name: 'Console Stream Champions',
        description: 'Best console stream players',
        icon: '🎮',
        timeRange: 'all_time',
        gameMode: 'console_stream'
      },
      {
        id: 'cloud_gaming',
        name: 'Cloud Gaming Masters',
        description: 'Top cloud gaming players',
        icon: '☁️',
        timeRange: 'all_time',
        gameMode: 'cloud_gaming'
      },
      {
        id: 'daily',
        name: 'Daily Champions',
        description: 'Today\'s top performers',
        icon: '📅',
        timeRange: 'daily',
        gameMode: 'all'
      },
      {
        id: 'weekly',
        name: 'Weekly Warriors',
        description: 'This week\'s leaders',
        icon: '🗓️',
        timeRange: 'weekly',
        gameMode: 'all'
      },
      {
        id: 'monthly',
        name: 'Monthly Legends',
        description: 'This month\'s top players',
        icon: '📊',
        timeRange: 'monthly',
        gameMode: 'all'
      }
    ];
  }

  async getLeaderboard(categoryId: string, limit: number = 100, offset: number = 0): Promise<{ entries: LeaderboardEntry[] }> {
    this.logger.log(`Fetching leaderboard for category: ${categoryId}`);
    
    // Filter by category if needed
    let filteredData = [...this.mockLeaderboardData];
    
    if (categoryId === 'console_stream') {
      filteredData = filteredData.filter(entry => entry.gameMode === 'console_stream' || entry.gameMode === 'all');
    } else if (categoryId === 'cloud_gaming') {
      filteredData = filteredData.filter(entry => entry.gameMode === 'cloud_gaming' || entry.gameMode === 'all');
    }
    
    // Apply pagination
    const paginatedData = filteredData.slice(offset, offset + limit);
    
    return {
      entries: paginatedData
    };
  }

  async getUserStats(userId: string): Promise<{ stats: UserStats }> {
    this.logger.log(`Fetching user stats for: ${userId}`);
    
    // Try to find user by ID or email
    const stats = this.mockUserStats.get(userId) || this.mockUserStats.get('user@flocknode.com');
    
    if (!stats) {
      // Return default stats for new users
      const defaultStats: UserStats = {
        rank: 999,
        score: 0,
        level: 1,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalEarnings: 0,
        currentStreak: 0,
        bestStreak: 0,
        badges: ['newcomer'],
        achievements: [],
        lastGamePlayed: '',
        favoriteGame: '',
        averageMatchDuration: 0
      };
      
      return { stats: defaultStats };
    }
    
    return { stats };
  }

  async createUserEntry(createUserDto: {
    userId: string;
    username: string;
    displayName: string;
    initialScore?: number;
    level?: number;
    badges?: string[];
  }): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Creating leaderboard entry for user: ${createUserDto.username}`);
    
    // Add to mock data (in real implementation, this would be saved to database)
    const newEntry: LeaderboardEntry = {
      id: createUserDto.userId,
      username: createUserDto.username,
      displayName: createUserDto.displayName,
      rank: this.mockLeaderboardData.length + 1,
      score: createUserDto.initialScore || 0,
      level: createUserDto.level || 1,
      gamesPlayed: 0,
      winRate: 0,
      totalEarnings: 0,
      streak: 0,
      badges: createUserDto.badges || ['newcomer'],
      lastActive: new Date().toISOString(),
      gameMode: 'all'
    };
    
    // Add user stats
    const newUserStats: UserStats = {
      rank: this.mockLeaderboardData.length + 1,
      score: createUserDto.initialScore || 0,
      level: createUserDto.level || 1,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalEarnings: 0,
      currentStreak: 0,
      bestStreak: 0,
      badges: createUserDto.badges || ['newcomer'],
      achievements: [],
      lastGamePlayed: '',
      favoriteGame: '',
      averageMatchDuration: 0
    };
    
    this.mockLeaderboardData.push(newEntry);
    this.mockUserStats.set(createUserDto.userId, newUserStats);
    
    return {
      success: true,
      message: 'User added to leaderboard successfully'
    };
  }

  async updateUserScore(updateScoreDto: {
    userId: string;
    won: boolean;
    score: number;
    gameMode: 'console_stream' | 'cloud_gaming';
    earnings: number;
  }): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Updating score for user: ${updateScoreDto.userId}`);
    
    // Find user in leaderboard
    const userIndex = this.mockLeaderboardData.findIndex(entry => entry.id === updateScoreDto.userId);
    const userStats = this.mockUserStats.get(updateScoreDto.userId);
    
    if (userIndex === -1 || !userStats) {
      return {
        success: false,
        message: 'User not found in leaderboard'
      };
    }
    
    // Update leaderboard entry
    const entry = this.mockLeaderboardData[userIndex];
    entry.score += updateScoreDto.score;
    entry.gamesPlayed += 1;
    entry.totalEarnings += updateScoreDto.earnings;
    entry.lastActive = new Date().toISOString();
    
    if (updateScoreDto.won) {
      entry.streak += 1;
      // Add win streak badges
      if (entry.streak === 5 && !entry.badges.includes('streak_5')) {
        entry.badges.push('streak_5');
      }
      if (entry.streak === 10 && !entry.badges.includes('streak_10')) {
        entry.badges.push('streak_10');
      }
    } else {
      entry.streak = 0;
    }
    
    // Recalculate win rate
    entry.winRate = (userStats.wins + (updateScoreDto.won ? 1 : 0)) / (entry.gamesPlayed) * 100;
    
    // Update user stats
    userStats.score = entry.score;
    userStats.gamesPlayed = entry.gamesPlayed;
    userStats.wins += updateScoreDto.won ? 1 : 0;
    userStats.losses += updateScoreDto.won ? 0 : 1;
    userStats.winRate = entry.winRate;
    userStats.totalEarnings = entry.totalEarnings;
    userStats.currentStreak = entry.streak;
    userStats.bestStreak = Math.max(userStats.bestStreak, entry.streak);
    userStats.lastGamePlayed = new Date().toISOString();
    userStats.badges = entry.badges;
    
    // Re-rank all players
    this.recalculateRanks();
    
    return {
      success: true,
      message: 'Score updated successfully'
    };
  }

  private recalculateRanks(): void {
    // Sort by score descending
    this.mockLeaderboardData.sort((a, b) => b.score - a.score);
    
    // Update ranks
    this.mockLeaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    // Update user stats ranks
    this.mockUserStats.forEach((stats, userId) => {
      const entry = this.mockLeaderboardData.find(e => e.id === userId);
      if (entry) {
        stats.rank = entry.rank;
      }
    });
  }

  async getOverviewStats(): Promise<{
    totalPlayers: number;
    activePlayers: number;
    totalMatches: number;
    totalEarnings: number;
    averageScore: number;
  }> {
    const totalPlayers = this.mockLeaderboardData.length;
    const activePlayers = this.mockLeaderboardData.filter(entry => 
      new Date(entry.lastActive) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;
    
    const totalMatches = this.mockLeaderboardData.reduce((sum, entry) => sum + entry.gamesPlayed, 0);
    const totalEarnings = this.mockLeaderboardData.reduce((sum, entry) => sum + entry.totalEarnings, 0);
    const averageScore = totalPlayers > 0 ? 
      this.mockLeaderboardData.reduce((sum, entry) => sum + entry.score, 0) / totalPlayers : 0;
    
    return {
      totalPlayers,
      activePlayers,
      totalMatches,
      totalEarnings,
      averageScore
    };
  }
}
