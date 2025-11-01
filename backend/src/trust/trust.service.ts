import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TRUST } from './trust.constants';

@Injectable()
export class TrustService {
  constructor(private prisma: PrismaClient) {}

  async get(userId: string) {
    const row = await this.prisma.trustProfile.findUnique({ where: { userId } });
    return row ?? { userId, score: 100, noShowRate: 0, disputeRate: 0, settleSpeedMs: 0 };
  }

  private clamp(score: number) {
    return Math.min(TRUST.CLAMPS.MAX, Math.max(TRUST.CLAMPS.MIN, score));
  }

  async adjust(userId: string, delta: number, reason: string, contextId?: string) {
    const prof = await this.get(userId);
    const effectiveDelta =
      prof.score > TRUST.CLAMPS.HIGH_WALL && delta > 0 ? Math.ceil(delta / 2) : delta;

    const next = this.clamp((prof.score ?? 100) + effectiveDelta);

    await this.prisma.$transaction([
      this.prisma.trustLedger.create({ data: { userId, delta: effectiveDelta, reason, contextId } }),
      this.prisma.trustProfile.upsert({
        where: { userId },
        update: { score: next },
        create: { userId, score: next },
      }),
    ]);

    return next;
  }
}

