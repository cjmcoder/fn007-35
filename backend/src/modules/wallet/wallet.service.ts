import { Injectable, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { KafkaService } from '../../common/kafka/kafka.service';
import { Prisma, MatchState } from '@prisma/client';
import { WALLET_TOPICS } from './events/wallet-topics';
import { v4 as uuidv4 } from 'uuid';

const D = Prisma.Decimal;

export interface LockWagerRequest {
  userId: string;
  matchId: string;
  amountFc: Prisma.Decimal;
  idempotencyKey: string;
}

export interface PayoutRequest {
  matchId: string;
  winnerId: string;
  totalPot: Prisma.Decimal;
  idempotencyKey: string;
}

export interface RefundRequest {
  matchId: string;
  idempotencyKey: string;
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly kafka: KafkaService,
  ) {}

  /**
   * Lock FC for match wager with idempotency
   * On match creation/join: lock entryFc for each player
   */
  async lockWager(userId: string, matchId: string, amountFcNum: number, idempKey: string): Promise<{ ok: boolean; txnId: string; amountFc: string }> {
    const amountFc = new D(amountFcNum).toDecimalPlaces(2);

    const result = await this.prisma.client.$transaction(async (tx) => {
      // short-circuit if idempotency key already used
      const prior = idempKey
        ? await tx.fcTransaction.findUnique({ where: { idempotencyKey: idempKey } })
        : null;
      if (prior) return prior;

      const w = await tx.wallet.findUniqueOrThrow({ where: { userId } });
      if (w.availableFc.lt(amountFc)) {
        throw new BadRequestException('ERR_INSUFFICIENT_FUNDS');
      }

      const w2 = await tx.wallet.update({
        where: { userId },
        data: {
          availableFc: { decrement: amountFc },
          lockedFc:    { increment: amountFc },
        },
      });

      const txn = await tx.fcTransaction.create({
        data: {
          userId,
          walletId: w2.id,
          type: 'WAGER',
          state: 'COMPLETED',
          amountFc: amountFc.neg(), // Negative for lock
          balanceAfterFc: w2.availableFc,
          refType: 'MATCH',
          refId: matchId,
          idempotencyKey: idempKey || undefined,
          metadata: JSON.stringify({ kind: 'WAGER_LOCK' }),
        },
      });

      return txn;
    });

    // AFTER COMMIT: emit event
    await this.kafka.emit(WALLET_TOPICS.WAGER_LOCKED, {
      matchId, userId, amountFc: result.amountFc.abs().toString(),
    });

    this.logger.log(`User ${userId} locked ${amountFc} FC for match ${matchId}`);
    return { ok: true, txnId: result.id, amountFc: result.amountFc.abs().toString() };
  }

  /**
   * Payout winner with exact 90/10 rake (idempotent by match)
   */
  async payoutWinner(matchId: string, winnerId: string, idempKey: string): Promise<{ ok: boolean; matchId: string; winnerId: string; winnerTake: string; platformFee: string }> {
    const platformWalletUserId = process.env.PLATFORM_WALLET_USER_ID;

    const payload = await this.prisma.client.$transaction(async (tx) => {
      // Only one PAYOUT per match
      const existing = await tx.fcTransaction.findFirst({
        where: { refType: 'MATCH', refId: matchId, type: 'PAYOUT' },
      });
      if (existing) {
        return {
          matchId,
          winnerId,
          winnerTake: existing.amountFc,
          platformFee: new D(0), // unknown here; fine for idempotent return
        };
      }

      const match = await tx.match.findUniqueOrThrow({ where: { id: matchId } });
      if (match.state !== MatchState.ACTIVE && match.state !== MatchState.DISPUTED) {
        throw new BadRequestException('ERR_MATCH_NOT_PAYABLE');
      }
      if (!match.oppId) throw new BadRequestException('ERR_MISSING_OPPONENT');

      // Sum real stakes from LOCK ledger
      const sumLock = async (uid: string) => {
        const a = await tx.fcTransaction.aggregate({
          _sum: { amountFc: true },
          where: { userId: uid, refType: 'MATCH', refId: matchId, type: 'WAGER' },
        });
        return new D(a._sum.amountFc ?? 0).abs(); // Convert negative lock to positive
      };

      const hostStake = await sumLock(match.hostId);
      const oppStake  = await sumLock(match.oppId);
      const pot       = hostStake.add(oppStake);

      if (pot.lte(0)) throw new BadRequestException('ERR_NO_POT');

      const rakePercent = new D(match.rakePercent ?? 10);
      const platformFee = pot.mul(rakePercent).div(100).toDecimalPlaces(2);
      const winnerTake  = pot.sub(platformFee);

      const loserId = winnerId === match.hostId ? match.oppId : match.hostId;

      // 1) Unlock locks to zero (both players)
      if (hostStake.gt(0)) {
        await tx.wallet.update({ where: { userId: match.hostId }, data: { lockedFc: { decrement: hostStake } } });
      }
      if (oppStake.gt(0)) {
        await tx.wallet.update({ where: { userId: match.oppId },  data: { lockedFc: { decrement: oppStake  } } });
      }

      // 2) Winner credit
      const wAfter = await tx.wallet.update({
        where: { userId: winnerId },
        data:  { availableFc: { increment: winnerTake } },
      });
      await tx.fcTransaction.create({
        data: {
          userId: winnerId,
          walletId: wAfter.id,
          type: 'WIN',
          state: 'COMPLETED',
          amountFc: winnerTake,
          balanceAfterFc: wAfter.availableFc,
          refType: 'MATCH',
          refId: matchId,
          idempotencyKey: idempKey || undefined,
          metadata: JSON.stringify({ split: '90/10', ratePercent: rakePercent }),
        },
      });

      // 3) Loser debit of their stake
      const loserStake = winnerId === match.hostId ? oppStake : hostStake;
      const lAfter = await tx.wallet.update({
        where: { userId: loserId },
        data:  { availableFc: { decrement: loserStake } },
      });
      await tx.fcTransaction.create({
        data: {
          userId: loserId,
          walletId: lAfter.id,
          type: 'LOSS',
          state: 'COMPLETED',
          amountFc: loserStake.neg(), // Negative for loss
          balanceAfterFc: lAfter.availableFc,
          refType: 'MATCH',
          refId: matchId,
          idempotencyKey: `LOSE:${matchId}:${loserId}`,
          metadata: JSON.stringify({ kind: 'LOSER_STAKE' }),
        },
      });

      // 4) Platform fee credit (optional)
      if (platformWalletUserId) {
        const plat = await tx.wallet.upsert({
          where: { userId: platformWalletUserId },
          create: { userId: platformWalletUserId, availableFc: platformFee, lockedFc: new D(0) },
          update: { availableFc: { increment: platformFee } },
        });
        await tx.fcTransaction.create({
          data: {
            userId: platformWalletUserId,
            walletId: plat.id,
            type: 'PLATFORM_FEE',
            state: 'COMPLETED',
            amountFc: platformFee,
            balanceAfterFc: plat.availableFc,
            refType: 'MATCH',
            refId: matchId,
            idempotencyKey: `FEE:${matchId}`,
            metadata: JSON.stringify({ kind: 'PLATFORM_FEE', ratePercent: rakePercent }),
          },
        });
      }

      // 5) Mark complete
      await tx.match.update({
        where: { id: matchId },
        data:  { state: 'COMPLETE', completeAt: new Date(), winnerId },
      });

      return { matchId, winnerId, winnerTake, platformFee };
    });

    await this.kafka.emit(WALLET_TOPICS.WAGER_PAYOUT, {
      matchId: payload.matchId,
      winnerId: payload.winnerId,
      winnerTake: payload.winnerTake.toString(),
      platformFee: payload.platformFee.toString(),
    });

    this.logger.log(`Paid out ${payload.winnerTake} FC to winner ${payload.winnerId} in match ${payload.matchId} (rake: ${payload.platformFee} FC)`);
    return {
      ok: true,
      matchId: payload.matchId,
      winnerId: payload.winnerId,
      winnerTake: payload.winnerTake.toString(),
      platformFee: payload.platformFee.toString(),
    };
  }

  /**
   * Refund cancelled matches (100% back to both sides; idempotent by keys)
   */
  async refundMatch(matchId: string, idempKey: string): Promise<{ ok: boolean; matchId: string; refunded: string }> {

    const res = await this.prisma.client.$transaction(async (tx) => {
      const match = await tx.match.findUniqueOrThrow({ where: { id: matchId } });
      if (!match.oppId) throw new BadRequestException('ERR_MISSING_OPPONENT');

      const sumLock = async (uid: string) => {
        const a = await tx.fcTransaction.aggregate({
          _sum: { amountFc: true },
          where: { userId: uid, refType: 'MATCH', refId: matchId, type: 'WAGER' },
        });
        return new D(a._sum.amountFc ?? 0).abs(); // Convert negative lock to positive
      };

      const hostStake = await sumLock(match.hostId);
      const oppStake  = await sumLock(match.oppId);

      const refundOne = async (uid: string, amt: Prisma.Decimal, tag: string) => {
        if (amt.lte(0)) return;
        const wAfter = await tx.wallet.update({
          where: { userId: uid },
          data: {
            lockedFc:    { decrement: amt },
            availableFc: { increment: amt },
          },
        });
        await tx.fcTransaction.create({
          data: {
            userId: uid,
            walletId: wAfter.id,
            type: 'REFUND',
            state: 'COMPLETED',
            amountFc: amt,
            balanceAfterFc: wAfter.availableFc,
            refType: 'MATCH',
            refId: matchId,
            idempotencyKey: `${idempKey}:${tag}`,
            metadata: JSON.stringify({ kind: 'WAGER_REFUND' }),
          },
        });
      };

      await refundOne(match.hostId, hostStake, 'HOST');
      await refundOne(match.oppId,  oppStake,  'OPP');

      await tx.match.update({ where: { id: matchId }, data: { state: 'CANCELLED' } });

      return { refunded: hostStake.add(oppStake) };
    });

    await this.kafka.emit(WALLET_TOPICS.WAGER_REFUND, {
      matchId, refunded: res.refunded.toString(),
    });

    this.logger.log(`Refunded ${res.refunded} FC for match ${matchId}`);
    return { ok: true, matchId, refunded: res.refunded.toString() };
  }

  /**
   * Get wallet balance for user
   */
  async getBalance(userId: string): Promise<{
    availableFc: number;
    lockedFc: number;
    totalFc: number;
    totalDeposited: number;
    totalWithdrawn: number;
  }> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    return {
      availableFc: wallet.availableFc.toNumber(),
      lockedFc: wallet.lockedFc.toNumber(),
      totalFc: wallet.availableFc.add(wallet.lockedFc).toNumber(),
      totalDeposited: wallet.totalDeposited.toNumber(),
      totalWithdrawn: wallet.totalWithdrawn.toNumber(),
    };
  }

  /**
   * Get transaction history
   */
  async getHistory(userId: string, cursor?: string, limit = 20): Promise<{
    items: any[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const where = cursor ? { userId, id: { lt: cursor } } : { userId };
    
    const transactions = await this.prisma.fcTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });

    const hasMore = transactions.length > limit;
    const items = hasMore ? transactions.slice(0, limit) : transactions;
    const nextCursor = hasMore ? items[items.length - 1].id : undefined;

    return {
      items: items.map(tx => ({
        id: tx.id,
        type: tx.type,
        state: tx.state,
        amount: tx.amountFc.toNumber(),
        balanceAfter: tx.balanceAfterFc?.toNumber() || null,
        refType: tx.refType,
        refId: tx.refId,
        metadata: tx.metadata,
        createdAt: tx.createdAt,
      })),
      nextCursor,
      hasMore,
    };
  }
}