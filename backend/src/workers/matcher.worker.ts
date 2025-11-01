import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../common/redis.service';
import { laneZsetKey } from '../common/lane.util';
import { PrismaClient } from '@prisma/client';
import { MatchService } from '../match/match.service';
import { ENV } from '../common/env';

// For now, iterate known/active lanes by scanning Redis keys
async function scanKeys(c: any, pattern: string, count = 100): Promise<string[]> {
  const keys: string[] = [];
  let cursor = 0;
  do {
    const [next, batch] = await c.scan(cursor, { MATCH: pattern, COUNT: count });
    cursor = Number(next);
    keys.push(...batch);
  } while (cursor !== 0);
  return keys;
}

@Injectable()
export class MatcherWorker implements OnModuleInit {
  private log = new Logger('MatcherWorker');
  private prisma = new PrismaClient();

  constructor(private redis: RedisService, private match: MatchService) {}

  onModuleInit() {
    setInterval(() => this.tick().catch(err => this.log.error(err)), 2000);
  }

  private async popOldestTwo(c: any, zkey: string): Promise<[string|undefined, string|undefined]> {
    // Get two oldest seekers
    const items = await c.zRange(zkey, 0, 1, { BY: 'SCORE' });
    if (items.length < 2) return [items[0], undefined];
    // Remove them atomically (optimistic)
    const tx = c.multi();
    tx.zRem(zkey, items[0]);
    tx.zRem(zkey, items[1]);
    await tx.exec();
    return [items[0], items[1]];
  }

  private async removeIfExpired(c: any, zkey: string, ticketId: string) {
    const h = await c.hGetAll(`seek:${ticketId}`);
    if (!h?.enqueuedAt) return true; // no hash -> unsafe, skip
    const age = Date.now() - Number(h.enqueuedAt);
    if (age > ENV.SEEK_TTL_SECONDS * 1000) {
      await c.zRem(zkey, ticketId);
      await c.del(`seek:${ticketId}`);
      return true;
    }
    return false;
  }

  private async tryPair(c: any, zkey: string) {
    const [a, b] = await this.popOldestTwo(c, zkey);
    if (!a) return;              // queue empty
    if (!b) {
      // Only one—check TTL and put back if needed
      const expired = await this.removeIfExpired(c, zkey, a);
      if (!expired) {
        // Re-add (we already removed it) with same score (now) to keep active
        await c.zAdd(zkey, [{ value: a, score: Date.now() }]);
      }
      return;
    }

    const Ha = await c.hGetAll(`seek:${a}`);
    const Hb = await c.hGetAll(`seek:${b}`);
    if (!Ha?.userId || !Hb?.userId) return; // corruption guard

    // (Simple compatibility: same lane by construction; could extend with ping/ELO tolerances)
    const lane = {
      gameId: Ha.gameId,
      mode: Ha.mode,
      region: Ha.region,
      stakeCents: Number(Ha.stakeCents),
      eloBand: Ha.eloBand,
    };

    const m = await this.match.createReadyFromPair(Ha.userId, Hb.userId, lane as any);

    // Cleanup seeker hashes
    await Promise.all([c.del(`seek:${a}`), c.del(`seek:${b}`)]);

    this.log.log(`Paired seekers ${Ha.userId} vs ${Hb.userId} -> match ${m.id}`);
    // In a real impl: notify both users via WS/push/email
  }

  private async tick() {
    const c = await this.redis.getClient();
    const keys = await scanKeys(c, 'q:*'); // all lanes
    for (const k of keys) {
      await this.tryPair(c, k);
    }
  }
}
