import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { z } from 'zod';
import { MatchService } from './match.service';
import { StreamReadySchema } from './dto/stream-ready.dto';
import { ReportSchema } from './dto/report.dto';
import { RedisService } from '../common/redis/redis.service';
import { laneKeyParts, laneZsetKey } from '../common/lane.util';

@Controller('match')
export class MatchController {
  constructor(private svc: MatchService, private redis: RedisService) {}

  @Post('seek')
  async seek(@Req() req: any, @Body() body: any) {
    const SeekSchema = z.object({
      gameId: z.string(),
      mode: z.enum(['CONSOLE_VERIFIED_STREAM','CLOUD_STREAM']),
      stakeCents: z.number().int().positive(),
      region: z.string(),
      eloBand: z.string(),
      pingHint: z.number().int().optional(),
    });
    const lane = SeekSchema.parse(body);
    const userId = req.user?.id ?? 'demo-user';

    // 1) Write seeker payload
    const ticketId = `t_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
    const parts = laneKeyParts(lane);
    const zkey = laneZsetKey(parts);
    const c = await this.redis.getClient();

    await c.hSet(`seek:${ticketId}`, {
      userId,
      gameId: lane.gameId,
      mode: lane.mode,
      stakeCents: String(lane.stakeCents),
      region: lane.region,
      eloBand: lane.eloBand,
      pingHint: String(lane.pingHint ?? ''),
      enqueuedAt: String(Date.now()),
    });

    // 2) Enqueue in ZSET (score=enqueuedAt)
    await c.zAdd(zkey, [{ score: Date.now(), value: ticketId }]);

    // The worker pairs asynchronously. Return ticket + recommendations (simple empty for now).
    return { ticketId, altChallenges: [] };
  }

  @Post(':id/stream-ready')
  async streamReady(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const { streamUrl, overlayNonce } = StreamReadySchema.parse(body);
    // (stub) assume FlockTube ok
    return this.svc.streamReady(id, req.user?.id ?? 'demo-user', streamUrl, !!overlayNonce);
  }

  @Post(':id/report')
  async report(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const { score } = ReportSchema.parse(body);
    return this.svc.reportResult(id, req.user?.id ?? 'demo-user', score);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc['prisma'].match_v1.findUnique({ where: { id } });
  }
}