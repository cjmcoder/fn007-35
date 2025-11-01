import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient, MatchStatus } from '@prisma/client';
import { ENV } from '../common/env';
import { TrustService } from '../trust/trust.service';

@Injectable()
export class LifecycleWorker implements OnModuleInit {
  private log = new Logger('LifecycleWorker');
  prisma = new PrismaClient();
  constructor(private trust: TrustService) {}

  onModuleInit() {
    setInterval(() => this.tick().catch(e => this.log.error(e)), 15_000);
  }

  private async tick() {
    const now = new Date();

    // 1) READY -> VOID when past startBy
    const stale = await this.prisma.match_v1.findMany({
      where: { status: MatchStatus.READY, startBy: { lt: now } },
    });
    for (const m of stale) {
      await this.prisma.match_v1.update({ where: { id: m.id }, data: { status: MatchStatus.VOID }});
      // Ideally detect who failed to go live; for now, penalize both mildly (or pick offender if you track streamReady per user)
      await this.trust.adjust(m.playerAId, -10, 'no_show', m.id);
      await this.trust.adjust(m.playerBId, -10, 'no_show', m.id);
      this.log.warn(`VOID no-show match ${m.id}`);
    }

    // 2) VERIFY timeouts (TODO when overlay reconciliation added)
    // 3) LIVE stream drop > grace (TODO when stream health events added)
  }
}
