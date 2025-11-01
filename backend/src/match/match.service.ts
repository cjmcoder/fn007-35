import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient, MatchStatus } from '@prisma/client';
import { ENV } from '../common/env';
import { TrustService } from '../trust/trust.service';
import { FlockTubeService } from '../flocktube/flocktube.service';

type LaneKey = { gameId:string; mode:'CONSOLE_VERIFIED_STREAM'|'CLOUD_STREAM'; region:string; stakeCents:number; eloBand:string };

@Injectable()
export class MatchService {
  constructor(
    private prisma: PrismaClient,
    private trust: TrustService,
    private flock: FlockTubeService,
  ) {}

  // STUB: escrow integration points
  private async reserveEscrow(matchId: string, stakeCents: number, players: string[]) {
    return { escrowLockId: `escrow_${matchId}`, ok: true };
  }
  private async releaseEscrow(_matchId: string, _winnerUserId: string) {
    return true;
  }

  private startBy() {
    return new Date(Date.now() + ENV.READY_STARTBY_MINUTES * 60_000);
  }
  private verifyBy() {
    return new Date(Date.now() + ENV.VERIFY_WINDOW_MINUTES * 60_000);
  }

  async createReadyFromPair(aUserId: string, bUserId: string, lane: LaneKey) {
    const m = await this.prisma.match_v1_v1.create({
      data: {
        gameId: lane.gameId,
        mode: lane.mode as any,
        stakeCents: lane.stakeCents,
        playerAId: aUserId,
        playerBId: bUserId,
        status: MatchStatus.READY,
        startBy: this.startBy(),
      },
    });
    const esc = await this.reserveEscrow(m.id, lane.stakeCents, [aUserId, bUserId]);
    await this.prisma.match_v1_v1.update({ where: { id: m.id }, data: { escrowLockId: esc.escrowLockId }});
    return m;
  }

  async streamReady(matchId: string, userId: string, url: string, nonceOk: boolean) {
    const m = await this.prisma.match_v1_v1.findUnique({ where: { id: matchId }});
    if (!m) throw new BadRequestException('Match not found');

    if (m.playerAId === userId) {
      await this.prisma.match_v1_v1.update({ where: { id: m.id }, data: { streamA: url }});
    } else if (m.playerBId === userId) {
      await this.prisma.match_v1_v1.update({ where: { id: m.id }, data: { streamB: url }});
    } else throw new BadRequestException('Not a participant');

    const updated = await this.prisma.match_v1_v1.findUnique({ where: { id: m.id }});
    const both = !!updated?.streamA && !!updated?.streamB;
    if (both && updated?.status === MatchStatus.READY) {
      await this.prisma.match_v1_v1.update({ where: { id: m.id }, data: { status: MatchStatus.LIVE }});
      // small positive trust for on-time streams
      await Promise.all([
        this.trust.adjust(m.playerAId, 1, 'on_time_streams', m.id),
        this.trust.adjust(m.playerBId, 1, 'on_time_streams', m.id),
      ]);
    }
    return this.prisma.match_v1_v1.findUnique({ where: { id: m.id }});
  }

  async reportResult(matchId: string, _userId: string, score: string) {
    const m = await this.prisma.match_v1_v1.findUnique({ where: { id: matchId }});
    if (!m) throw new BadRequestException('Match not found');
    if (m.status !== MatchStatus.LIVE && m.status !== MatchStatus.REPORTED) {
      await this.prisma.match_v1_v1.update({ where: { id: m.id }, data: { status: MatchStatus.REPORTED, reportBy: this.verifyBy() }});
    }
    // Real overlay cross-check handled by workers; keep lean here
    return this.prisma.match_v1_v1.findUnique({ where: { id: m.id }});
  }

  async settleFromOverlay(matchId: string, winnerUserId: string) {
    const m = await this.prisma.match_v1.findUnique({ where: { id: matchId }});
    if (!m) return;
    if (![MatchStatus.LIVE, MatchStatus.REPORTED, MatchStatus.VERIFY].includes(m.status)) return;

    await this.releaseEscrow(m.id, winnerUserId);
    await this.prisma.match_v1.update({
      where: { id: m.id },
      data: { status: MatchStatus.SETTLED, settledAt: new Date() },
    });
    // small quick-settle trust bonus
    await this.trust.adjust(winnerUserId, 2, 'quick_settle', m.id);
  }

  async voidNoShow(matchId: string, offenderUserId: string) {
    const m = await this.prisma.match_v1.findUnique({ where: { id: matchId }});
    if (!m) return;
    await this.prisma.match_v1.update({ where: { id: m.id }, data: { status: MatchStatus.VOID }});
    await this.trust.adjust(offenderUserId, -10, 'no_show', m.id);
  }
}