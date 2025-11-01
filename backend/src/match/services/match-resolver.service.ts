import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class MatchResolverService {
  private readonly logger = new Logger(MatchResolverService.name);

  constructor(
    private prismaService: PrismaService,
    private redisService: RedisService,
    private kafkaService: KafkaService,
  ) {}

  async resolveMatch(matchId: string, results: { hostResult: any; oppResult: any }): Promise<void> {
    const { hostResult, oppResult } = results;

    try {
      const match = await this.prismaService.match.findUnique({
        where: { id: matchId },
      });

      if (!match) {
        throw new Error(`Match ${matchId} not found`);
      }

      // Parse results
      const hostData = JSON.parse(hostResult);
      const oppData = JSON.parse(oppResult);

      // Determine winner based on results
      let winnerId: string | null = null;
      let hostScore = 0;
      let oppScore = 0;

      if (hostData.result === 'WIN' && oppData.result === 'LOSS') {
        winnerId = match.hostId;
        hostScore = 1;
        oppScore = 0;
      } else if (hostData.result === 'LOSS' && oppData.result === 'WIN') {
        winnerId = match.oppId;
        hostScore = 0;
        oppScore = 1;
      } else if (hostData.result === 'DRAW' && oppData.result === 'DRAW') {
        // Draw - no winner
        hostScore = 0;
        oppScore = 0;
      } else {
        // Conflicting results - need manual resolution
        this.logger.warn(`Conflicting results for match ${matchId}:`, { hostData, oppData });
        await this.flagForManualResolution(matchId, { hostData, oppData });
        return;
      }

      // Update match
      const updatedMatch = await this.prismaService.match.update({
        where: { id: matchId },
        data: {
          state: 'COMPLETE',
          winnerId,
          completeAt: new Date(),
          hostScore,
          oppScore,
        },
      });

      // Process wager payout
      if (winnerId) {
        await this.processWagerPayout(matchId, winnerId);
      } else {
        // Draw - refund both players
        await this.processWagerRefund(matchId);
      }

      // Clean up Redis state
      await this.cleanupMatchState(matchId);

      // Emit domain event
      const event = this.kafkaService.createEvent(
        'match.completed',
        matchId,
        'Match',
        { 
          matchId, 
          winnerId, 
          hostScore, 
          oppScore, 
          reason: 'RESULT_REPORTED' 
        },
        { userId: winnerId || match.hostId }
      );
      await this.kafkaService.publishEvent('match.events', event);

      this.logger.log(`Match ${matchId} resolved successfully. Winner: ${winnerId || 'DRAW'}`);

    } catch (error) {
      this.logger.error(`Failed to resolve match ${matchId}:`, error);
      throw error;
    }
  }

  async processWagerPayout(matchId: string, winnerId: string): Promise<void> {
    try {
      const wagerLocks = await this.prismaService.wagerLock.findMany({
        where: { matchId, state: 'LOCKED' },
      });

      const totalPayout = wagerLocks.reduce((sum, lock) => sum + lock.amountFc, 0);

      // Update winner's wallet
      await this.prismaService.wallet.update({
        where: { userId: winnerId },
        data: {
          availableFc: { increment: totalPayout },
          lockedFc: { decrement: wagerLocks.find(l => l.userId === winnerId)?.amountFc || 0 },
        },
      });

      // Update all wager locks to paid out
      await this.prismaService.wagerLock.updateMany({
        where: { matchId, state: 'LOCKED' },
        data: { state: 'PAID_OUT' },
      });

      // Create transaction records
      const transactions = wagerLocks.map(lock => ({
        userId: lock.userId,
        type: lock.userId === winnerId ? 'WAGER_PAYOUT' : 'WAGER_LOCK',
        amount: lock.userId === winnerId ? totalPayout : -lock.amountFc,
        refType: 'MATCH',
        refId: matchId,
        state: 'COMPLETED',
      }));

      await this.prismaService.fcTransaction.createMany({
        data: transactions,
      });

      // Emit wallet event
      const event = this.kafkaService.createEvent(
        'wallet.wager.payout',
        winnerId,
        'User',
        { matchId, amount: totalPayout },
        { userId: winnerId }
      );
      await this.kafkaService.publishEvent('wallet.events', event);

      this.logger.log(`Wager payout processed for match ${matchId}. Winner: ${winnerId}, Amount: ${totalPayout}`);

    } catch (error) {
      this.logger.error(`Failed to process wager payout for match ${matchId}:`, error);
      throw error;
    }
  }

  async processWagerRefund(matchId: string): Promise<void> {
    try {
      const wagerLocks = await this.prismaService.wagerLock.findMany({
        where: { matchId, state: 'LOCKED' },
      });

      // Refund all players
      for (const lock of wagerLocks) {
        await this.prismaService.wallet.update({
          where: { userId: lock.userId },
          data: {
            availableFc: { increment: lock.amountFc },
            lockedFc: { decrement: lock.amountFc },
          },
        });
      }

      // Update all wager locks to refunded
      await this.prismaService.wagerLock.updateMany({
        where: { matchId, state: 'LOCKED' },
        data: { state: 'REFUNDED' },
      });

      // Create transaction records
      const transactions = wagerLocks.map(lock => ({
        userId: lock.userId,
        type: 'WAGER_REFUND',
        amount: lock.amountFc,
        refType: 'MATCH',
        refId: matchId,
        state: 'COMPLETED',
      }));

      await this.prismaService.fcTransaction.createMany({
        data: transactions,
      });

      // Emit wallet events
      for (const lock of wagerLocks) {
        const event = this.kafkaService.createEvent(
          'wallet.wager.refund',
          lock.userId,
          'User',
          { matchId, amount: lock.amountFc },
          { userId: lock.userId }
        );
        await this.kafkaService.publishEvent('wallet.events', event);
      }

      this.logger.log(`Wager refund processed for match ${matchId}. Refunded ${wagerLocks.length} players`);

    } catch (error) {
      this.logger.error(`Failed to process wager refund for match ${matchId}:`, error);
      throw error;
    }
  }

  private async flagForManualResolution(matchId: string, results: any): Promise<void> {
    try {
      // Update match state to disputed
      await this.prismaService.match.update({
        where: { id: matchId },
        data: { state: 'DISPUTED' },
      });

      // Create dispute record
      await this.prismaService.dispute.create({
        data: {
          matchId,
          userId: results.hostData.userId || 'system',
          reason: 'Conflicting result reports',
          notes: `Host reported: ${JSON.stringify(results.hostData)}, Opponent reported: ${JSON.stringify(results.oppData)}`,
          state: 'OPEN',
        },
      });

      // Emit domain event
      const event = this.kafkaService.createEvent(
        'match.disputed',
        matchId,
        'Match',
        { matchId, reason: 'Conflicting result reports' },
        { userId: 'system' }
      );
      await this.kafkaService.publishEvent('match.events', event);

      this.logger.warn(`Match ${matchId} flagged for manual resolution due to conflicting results`);

    } catch (error) {
      this.logger.error(`Failed to flag match ${matchId} for manual resolution:`, error);
      throw error;
    }
  }

  private async cleanupMatchState(matchId: string): Promise<void> {
    try {
      // Remove Redis keys
      const keys = [
        `match:${matchId}:state`,
        `match:${matchId}:result:*`,
      ];

      for (const key of keys) {
        if (key.includes('*')) {
          // Handle wildcard keys
          const pattern = key.replace('*', '');
          const matchingKeys = await this.redisService.keys(pattern);
          for (const matchingKey of matchingKeys) {
            await this.redisService.del(matchingKey);
          }
        } else {
          await this.redisService.del(key);
        }
      }

      this.logger.log(`Cleaned up Redis state for match ${matchId}`);

    } catch (error) {
      this.logger.error(`Failed to cleanup Redis state for match ${matchId}:`, error);
      // Don't throw here as this is cleanup
    }
  }

  async autoResolveMatches(): Promise<void> {
    try {
      // Find matches that have been active for too long without completion
      const timeoutThreshold = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours

      const timedOutMatches = await this.prismaService.match.findMany({
        where: {
          state: 'ACTIVE',
          startAt: {
            lt: timeoutThreshold,
          },
        },
      });

      for (const match of timedOutMatches) {
        this.logger.warn(`Auto-resolving timed out match: ${match.id}`);
        
        // Create dispute for manual resolution
        await this.prismaService.dispute.create({
          data: {
            matchId: match.id,
            userId: match.hostId,
            reason: 'Match timeout - no result reported',
            notes: 'Match was active for more than 2 hours without completion',
            state: 'OPEN',
          },
        });

        // Update match state
        await this.prismaService.match.update({
          where: { id: match.id },
          data: { state: 'DISPUTED' },
        });

        // Emit domain event
        const event = this.kafkaService.createEvent(
          'match.disputed',
          match.id,
          'Match',
          { matchId: match.id, reason: 'Match timeout' },
          { userId: 'system' }
        );
        await this.kafkaService.publishEvent('match.events', event);
      }

      if (timedOutMatches.length > 0) {
        this.logger.log(`Auto-resolved ${timedOutMatches.length} timed out matches`);
      }

    } catch (error) {
      this.logger.error('Failed to auto-resolve matches:', error);
    }
  }
}





