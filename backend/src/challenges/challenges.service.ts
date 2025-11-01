import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient, ChallengeStatus } from '@prisma/client';
import { ENV } from '../common/env';
import { TrustService } from '../trust/trust.service';

@Injectable()
export class ChallengesService {
  constructor(private prisma: PrismaClient, private trust: TrustService) {}

  async create(userId: string, dto: any) {
    const expiresAt = new Date(Date.now() + ENV.CHALLENGE_EXPIRY_MINUTES * 60_000);
    return this.prisma.challenge.create({ data: { ...dto, creatorId: userId, expiresAt } });
  }

  async accept(userId: string, id: string) {
    const ch = await this.prisma.challenge.findUnique({ where: { id }});
    if (!ch || ch.status !== ChallengeStatus.OPEN) throw new BadRequestException('Not open');
    await this.prisma.challenge.update({ where: { id }, data: { status: ChallengeStatus.PENDING }});
    return { pendingPairId: `${id}:${userId}` };
  }

  async confirm(creatorId: string, id: string) {
    const ch = await this.prisma.challenge.findUnique({ where: { id }});
    if (!ch || ch.creatorId !== creatorId) throw new BadRequestException('Not yours');
    // real flow: find accepter from cache; here we fake a bot partner for demo
    return ch;
  }

  async listOpen() {
    return this.prisma.challenge.findMany({ where: { status: ChallengeStatus.OPEN }, orderBy: { createdAt: 'desc' }, take: 20 });
  }
}

