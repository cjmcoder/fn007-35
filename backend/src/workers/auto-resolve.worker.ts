import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { WalletService } from '../modules/wallet/wallet.service';
import { KafkaService } from '../common/kafka/kafka.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AutoResolveWorker {
  private readonly logger = new Logger(AutoResolveWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly kafka: KafkaService,
  ) {}

  /**
   * Process auto-resolve events
   */
  async processAutoResolve(event: any): Promise<void> {
    const { matchId, winnerId, totalPot } = event;

    try {
      this.logger.log(`Processing auto-resolve for match ${matchId}, winner: ${winnerId}`);

      // Get match details
      const match = await this.prisma.match.findUnique({
        where: { id: matchId },
        include: { host: true, opponent: true },
      });

      if (!match) {
        this.logger.error(`Match ${matchId} not found for auto-resolve`);
        return;
      }

      if (match.state !== 'ACTIVE') {
        this.logger.warn(`Match ${matchId} is not active, skipping auto-resolve`);
        return;
      }

      // Generate idempotency key
      const idempotencyKey = uuidv4();

      // Process payout with 10% rake
      const payoutResult = await this.walletService.payoutWinner({
        matchId,
        winnerId,
        totalPot,
        idempotencyKey,
      });

      // Update match state
      await this.prisma.match.update({
        where: { id: matchId },
        data: {
          state: 'COMPLETE',
          winnerId,
          completeAt: new Date(),
        },
      });

      this.logger.log(`Auto-resolved match ${matchId}: winner ${winnerId}, payout ${payoutResult.winnerAmount} FC, rake ${payoutResult.platformRake} FC`);

      // Emit completion event
      await this.kafka.emit('match.auto_resolved', {
        matchId,
        winnerId,
        winnerAmount: payoutResult.winnerAmount,
        platformRake: payoutResult.platformRake,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Failed to auto-resolve match ${matchId}: ${error.message}`);
      
      // Emit error event
      await this.kafka.emit('match.auto_resolve_failed', {
        matchId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Process forfeit events
   */
  async processForfeit(event: any): Promise<void> {
    const { matchId, forfeiterId, winnerId, totalPot } = event;

    try {
      this.logger.log(`Processing forfeit for match ${matchId}, forfeiter: ${forfeiterId}, winner: ${winnerId}`);

      // Generate idempotency key
      const idempotencyKey = uuidv4();

      // Process payout with 10% rake
      const payoutResult = await this.walletService.payoutWinner({
        matchId,
        winnerId,
        totalPot,
        idempotencyKey,
      });

      this.logger.log(`Processed forfeit for match ${matchId}: winner ${winnerId}, payout ${payoutResult.winnerAmount} FC, rake ${payoutResult.platformRake} FC`);

    } catch (error) {
      this.logger.error(`Failed to process forfeit for match ${matchId}: ${error.message}`);
    }
  }

  /**
   * Process disputed matches
   */
  async processDispute(event: any): Promise<void> {
    const { matchId, hostResult, oppResult } = event;

    try {
      this.logger.log(`Processing dispute for match ${matchId}`);

      // Create dispute record
      await this.prisma.dispute.create({
        data: {
          matchId,
          openedBy: 'SYSTEM', // System opened due to conflicting reports
          reason: 'Conflicting match results',
          notes: `Host reported: ${hostResult.result}, Opponent reported: ${oppResult.result}`,
          status: 'OPEN',
        },
      });

      // Update match state
      await this.prisma.match.update({
        where: { id: matchId },
        data: { state: 'DISPUTED' },
      });

      this.logger.log(`Created dispute for match ${matchId} due to conflicting results`);

      // Emit dispute event
      await this.kafka.emit('dispute.created', {
        matchId,
        reason: 'Conflicting match results',
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Failed to process dispute for match ${matchId}: ${error.message}`);
    }
  }

  /**
   * Process match end from overlay
   */
  async processOverlayMatchEnd(event: any): Promise<void> {
    const { matchId, result } = event;

    try {
      this.logger.log(`Processing overlay match end for match ${matchId}`);

      // Get match details
      const match = await this.prisma.match.findUnique({
        where: { id: matchId },
      });

      if (!match || match.state !== 'ACTIVE') {
        this.logger.warn(`Match ${matchId} not found or not active for overlay match end`);
        return;
      }

      // Check if we have high confidence in the result
      const confidence = result.confidence || 0;
      const threshold = 0.8; // 80% confidence threshold

      if (confidence >= threshold) {
        // High confidence - auto-resolve
        const winnerId = result.winnerId;
        const totalPot = match.entryFc * 2;

        await this.processAutoResolve({
          matchId,
          winnerId,
          totalPot,
        });
      } else {
        // Low confidence - require manual confirmation
        this.logger.log(`Low confidence (${confidence}) for match ${matchId}, requiring manual confirmation`);
        
        await this.kafka.emit('match.requires_manual_review', {
          matchId,
          confidence,
          result,
          timestamp: new Date().toISOString(),
        });
      }

    } catch (error) {
      this.logger.error(`Failed to process overlay match end for match ${matchId}: ${error.message}`);
    }
  }
}





