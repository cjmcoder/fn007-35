import { leaderboardService } from './leaderboardService';
import { propsApi } from '@/lib/api';

/**
 * Service to integrate prop betting with other platform features
 */
export class PropIntegrationService {
  
  /**
   * Handle prop stake placement with full integration
   */
  static async stakePropWithIntegration(
    propId: string, 
    side: 'OVER' | 'UNDER' | 'YES' | 'NO', 
    amount: number,
    userId: string
  ) {
    try {
      // 1. Place the prop stake
      const stake = await propsApi.stakeProp(propId, side, amount);
      
      // 2. Update user activity in leaderboard
      await leaderboardService.updateUserActivity(userId, {
        activityType: 'PROP_STAKE',
        activityData: {
          propId,
          side,
          amount,
          timestamp: new Date().toISOString()
        }
      });
      
      // 3. Log prop betting activity for analytics
      await this.logPropActivity(userId, 'STAKE_PLACED', {
        propId,
        side,
        amount,
        stakeId: stake.id
      });
      
      return stake;
    } catch (error) {
      console.error('Failed to stake prop with integration:', error);
      throw error;
    }
  }
  
  /**
   * Handle prop resolution with leaderboard updates
   */
  static async resolvePropWithIntegration(
    propId: string,
    winningSide: string,
    result: any
  ) {
    try {
      // 1. Resolve the prop
      const resolution = await propsApi.resolveProp(propId, result, winningSide);
      
      // 2. Update leaderboard for all participants
      if (resolution.payouts) {
        for (const payout of resolution.payouts) {
          await leaderboardService.updateUserStats(payout.userId, {
            propWins: payout.won ? 1 : 0,
            propLosses: payout.won ? 0 : 1,
            propProfit: payout.won ? payout.amount : -payout.stakeAmount,
            totalEarnings: payout.won ? payout.amount : 0
          });
          
          // Log the result for analytics
          await this.logPropActivity(payout.userId, payout.won ? 'PROP_WIN' : 'PROP_LOSS', {
            propId,
            side: payout.side,
            stakeAmount: payout.stakeAmount,
            payoutAmount: payout.amount,
            result
          });
        }
      }
      
      return resolution;
    } catch (error) {
      console.error('Failed to resolve prop with integration:', error);
      throw error;
    }
  }
  
  /**
   * Get user's prop betting history and stats
   */
  static async getUserPropStats(userId: string) {
    try {
      const [userStats, propStakes] = await Promise.all([
        leaderboardService.getUserStats(userId),
        propsApi.getMyStakes()
      ]);
      
      // Calculate prop-specific stats
      const propStats = {
        totalProps: propStakes.length,
        wins: propStakes.filter(s => s.status === 'WON').length,
        losses: propStakes.filter(s => s.status === 'LOST').length,
        pending: propStakes.filter(s => s.status === 'LOCKED').length,
        totalStaked: propStakes.reduce((sum, s) => sum + s.amount, 0),
        totalWinnings: propStakes
          .filter(s => s.status === 'WON')
          .reduce((sum, s) => sum + (s.payoutAmount || 0), 0),
        winRate: 0,
        profit: 0
      };
      
      if (propStats.totalProps > 0) {
        propStats.winRate = (propStats.wins / propStats.totalProps) * 100;
        propStats.profit = propStats.totalWinnings - propStats.totalStaked;
      }
      
      return {
        userStats,
        propStats,
        recentStakes: propStakes.slice(0, 10)
      };
    } catch (error) {
      console.error('Failed to get user prop stats:', error);
      throw error;
    }
  }
  
  /**
   * Create prop from match data (for lobby integration)
   */
  static async createPropFromMatch(matchId: string, templateId: string, customParams?: any) {
    try {
      // Create prop instance
      const prop = await propsApi.createProp(templateId, matchId, customParams);
      
      // Log prop creation for analytics
      await this.logPropActivity('system', 'PROP_CREATED', {
        propId: prop.id,
        matchId,
        templateId,
        customParams
      });
      
      return prop;
    } catch (error) {
      console.error('Failed to create prop from match:', error);
      throw error;
    }
  }
  
  /**
   * Get props for active matches (lobby integration)
   */
  static async getPropsForMatches(matchIds: string[]) {
    try {
      // This would integrate with the lobby system to get relevant props
      const allProps = await propsApi.getActiveProps();
      
      // Filter props that are related to the given matches
      const matchProps = allProps.filter(prop => 
        matchIds.includes(prop.matchId || '')
      );
      
      return matchProps;
    } catch (error) {
      console.error('Failed to get props for matches:', error);
      throw error;
    }
  }
  
  /**
   * Private method to log prop activities for analytics
   */
  private static async logPropActivity(
    userId: string, 
    activityType: string, 
    data: any
  ) {
    try {
      // In production, this would send to analytics service
      console.log('Prop Activity:', {
        userId,
        activityType,
        data,
        timestamp: new Date().toISOString()
      });
      
      // Could integrate with external analytics (Mixpanel, Amplitude, etc.)
      // await analytics.track('prop_activity', { userId, activityType, data });
    } catch (error) {
      console.warn('Failed to log prop activity:', error);
    }
  }
}

// Export convenience methods
export const {
  stakePropWithIntegration,
  resolvePropWithIntegration,
  getUserPropStats,
  createPropFromMatch,
  getPropsForMatches
} = PropIntegrationService;




