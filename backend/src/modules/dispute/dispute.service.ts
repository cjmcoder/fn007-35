import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { KafkaService } from '../../common/kafka/kafka.service';
import { WalletService } from '../wallet/wallet.service';
import { v4 as uuidv4 } from 'uuid';

export interface OpenDisputeRequest {
  matchId: string;
  reason: string;
  notes?: string;
}

export interface ResolveDisputeRequest {
  matchId: string;
  outcome: 'PAYOUT' | 'REFUND' | 'VOID';
  winnerId?: string;
}

@Injectable()
export class DisputeService {
  private readonly logger = new Logger(DisputeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly kafka: KafkaService,
    private readonly walletService: WalletService,
  ) {}

  /**
   * Open a dispute
   */
  async openDispute(userId: string, request: OpenDisputeRequest): Promise<{
    disputeId: string;
    status: string;
  }> {
    const { matchId, reason, notes } = request;

    // Get match
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (![match.hostId, match.oppId].includes(userId)) {
      throw new BadRequestException('You are not part of this match');
    }

    // Check if dispute already exists
    const existingDispute = await this.prisma.dispute.findFirst({
      where: { matchId, status: 'OPEN' },
    });

    if (existingDispute) {
      throw new BadRequestException('Dispute already exists for this match');
    }

    // Create dispute
    const dispute = await this.prisma.dispute.create({
      data: {
        matchId,
        openedBy: userId,
        reason,
        notes,
        status: 'OPEN',
      },
    });

    // Update match state
    await this.prisma.match.update({
      where: { id: matchId },
      data: { state: 'DISPUTED' },
    });

    // Emit Kafka event
    await this.kafka.emit('dispute.opened', {
      matchId,
      disputeId: dispute.id,
      openedBy: userId,
      reason,
      notes,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Opened dispute ${dispute.id} for match ${matchId} by user ${userId}`);

    return {
      disputeId: dispute.id,
      status: dispute.status,
    };
  }

  /**
   * Resolve a dispute (admin only)
   */
  async resolveDispute(adminId: string, request: ResolveDisputeRequest): Promise<{
    disputeId: string;
    status: string;
    resolution: string;
  }> {
    const { matchId, outcome, winnerId } = request;

    // Get dispute
    const dispute = await this.prisma.dispute.findFirst({
      where: { matchId, status: 'OPEN' },
    });

    if (!dispute) {
      throw new NotFoundException('No open dispute found for this match');
    }

    // Get match
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    // Generate idempotency key
    const idempotencyKey = uuidv4();

    try {
      // Process resolution based on outcome
      switch (outcome) {
        case 'PAYOUT':
          if (!winnerId) {
            throw new BadRequestException('Winner ID required for PAYOUT resolution');
          }
          await this.walletService.payoutWinner({
            matchId,
            winnerId,
            totalPot: match.entryFc * 2,
            idempotencyKey,
          });
          break;

        case 'REFUND':
          await this.walletService.refundMatch({
            matchId,
            idempotencyKey,
          });
          break;

        case 'VOID':
          // No financial action needed for VOID
          break;
      }

      // Update dispute
      const updatedDispute = await this.prisma.dispute.update({
        where: { id: dispute.id },
        data: {
          status: 'RESOLVED',
          resolution: outcome,
          resolvedBy: adminId,
          resolvedAt: new Date(),
        },
      });

      // Update match state
      await this.prisma.match.update({
        where: { id: matchId },
        data: {
          state: 'COMPLETE',
          winnerId: outcome === 'PAYOUT' ? winnerId : null,
          completeAt: new Date(),
        },
      });

      // Emit Kafka event
      await this.kafka.emit('dispute.resolved', {
        matchId,
        disputeId: dispute.id,
        outcome,
        winnerId,
        resolvedBy: adminId,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Resolved dispute ${dispute.id} for match ${matchId} with outcome ${outcome}`);

      return {
        disputeId: dispute.id,
        status: updatedDispute.status,
        resolution: outcome,
      };

    } catch (error) {
      this.logger.error(`Failed to resolve dispute ${dispute.id}: ${error.message}`);
      throw new BadRequestException(`Failed to resolve dispute: ${error.message}`);
    }
  }

  /**
   * Get dispute details
   */
  async getDispute(disputeId: string): Promise<any> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        match: {
          include: {
            host: { select: { id: true, username: true, displayName: true } },
            opponent: { select: { id: true, username: true, displayName: true } },
          },
        },
      },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  /**
   * Get disputes for a match
   */
  async getMatchDisputes(matchId: string): Promise<any[]> {
    const disputes = await this.prisma.dispute.findMany({
      where: { matchId },
      orderBy: { createdAt: 'desc' },
    });

    return disputes;
  }

  /**
   * Get all open disputes (admin only)
   */
  async getOpenDisputes(): Promise<any[]> {
    const disputes = await this.prisma.dispute.findMany({
      where: { status: 'OPEN' },
      include: {
        match: {
          include: {
            host: { select: { id: true, username: true, displayName: true } },
            opponent: { select: { id: true, username: true, displayName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return disputes;
  }
}





