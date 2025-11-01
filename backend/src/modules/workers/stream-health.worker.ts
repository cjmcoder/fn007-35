import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { KafkaService } from '../../common/kafka/kafka.service';

const MIN_FPS = 30;
const MIN_KBPS = 2500;
const OFFLINE_GRACE_MS = 90_000; // 90 seconds grace period
const CHECK_INTERVAL_MS = 30_000; // 30 seconds

interface StreamInfo {
  live: boolean;
  title?: string;
  fps: number;
  bitrate: number;
  provider?: string;
  channelId?: string;
}

interface ActiveMatch {
  id: string;
  hostId: string;
  oppId: string;
  state: string;
}

@Injectable()
export class StreamHealthWorker {
  private readonly logger = new Logger(StreamHealthWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly kafka: KafkaService,
  ) {}

  /**
   * Check stream health for all active VERIFIED_STREAM matches
   */
  async checkStreamHealth(): Promise<void> {
    this.logger.debug('Starting stream health check');

    try {
      const activeMatches = await this.prisma.client.match.findMany({
        where: {
          mode: { in: ['VERIFIED_STREAM', 'PRIVATE_SERVER_WITH_STREAM'] },
          state: { in: ['READY_CHECK', 'ACTIVE'] }
        },
        select: {
          id: true,
          hostId: true,
          oppId: true,
          state: true,
          mode: true
        }
      });

      this.logger.debug(`Checking stream health for ${activeMatches.length} active matches`);

      const now = Date.now();
      
      for (const match of activeMatches) {
        await this.checkMatchStreamHealth(match, now);
      }
    } catch (error) {
      this.logger.error('Error during stream health check:', error);
    }
  }

  /**
   * Check stream health for a specific match
   */
  private async checkMatchStreamHealth(match: ActiveMatch, now: number): Promise<void> {
    try {
      // Get stream info for both players
      const [p1Stream, p2Stream] = await Promise.all([
        this.getStreamInfo(match.hostId),
        this.getStreamInfo(match.oppId)
      ]);

      // Update checklist items based on stream health
      await this.updateStreamChecklist(match.id, p1Stream, p2Stream);

      // Only enforce stream rules when match is ACTIVE (not during READY_CHECK)
      if (match.state !== 'ACTIVE') {
        return;
      }

      // Enforce stream health rules with grace periods
      await this.enforceStreamHealth(match.id, 'host', p1Stream, now);
      await this.enforceStreamHealth(match.id, 'opp', p2Stream, now);
    } catch (error) {
      this.logger.error(`Error checking stream health for match ${match.id}:`, error);
    }
  }

  /**
   * Update match checklist based on stream health
   */
  private async updateStreamChecklist(
    matchId: string,
    p1Stream: StreamInfo,
    p2Stream: StreamInfo
  ): Promise<void> {
    try {
      const titleOk = (title?: string) => {
        if (!title) return false;
        return title.includes(`#${matchId}`) || title.includes(`[${matchId}]`);
      };

      // Update checklist items
      await this.updateMatchChecklist(matchId, 'p1StreamLive', p1Stream.live ? 'PASS' : 'PENDING');
      await this.updateMatchChecklist(matchId, 'p2StreamLive', p2Stream.live ? 'PASS' : 'PENDING');
      await this.updateMatchChecklist(
        matchId,
        'titlesContainMatchId',
        (titleOk(p1Stream.title) && titleOk(p2Stream.title)) ? 'PASS' : 'PENDING'
      );
      await this.updateMatchChecklist(
        matchId,
        'bitrateOk',
        (p1Stream.bitrate >= MIN_KBPS && p2Stream.bitrate >= MIN_KBPS) ? 'PASS' : 'PENDING'
      );
      await this.updateMatchChecklist(
        matchId,
        'fpsOk',
        (p1Stream.fps >= MIN_FPS && p2Stream.fps >= MIN_FPS) ? 'PASS' : 'PENDING'
      );
    } catch (error) {
      this.logger.error(`Error updating stream checklist for match ${matchId}:`, error);
    }
  }

  /**
   * Enforce stream health rules with grace period
   */
  private async enforceStreamHealth(
    matchId: string,
    side: 'host' | 'opp',
    streamInfo: StreamInfo,
    now: number
  ): Promise<void> {
    const isHealthy = streamInfo.live && 
                     streamInfo.fps >= MIN_FPS && 
                     streamInfo.bitrate >= MIN_KBPS;
    
    const graceKey = `str:grace:${matchId}:${side}`;

    if (isHealthy) {
      // Stream is healthy - clear any grace window
      await this.clearGrace(graceKey);
      return;
    }

    // Stream is unhealthy - start or check grace window
    const graceStart = await this.getGraceStart(graceKey);
    
    if (!graceStart) {
      // Start grace period
      await this.startGrace(graceKey, now);
      await this.kafka.emit('stream.health.warn', {
        v: 'v1',
        matchId,
        side,
        reason: this.getUnhealthyReason(streamInfo),
        timestamp: now
      });
      
      this.logger.warn(`Stream health warning for match ${matchId}, ${side}: ${this.getUnhealthyReason(streamInfo)}`);
      return;
    }

    const elapsed = now - graceStart;
    if (elapsed < OFFLINE_GRACE_MS) {
      // Still within grace period
      return;
    }

    // Grace period expired - enforce outcome
    await this.enforceStreamViolation(matchId, side, streamInfo, now);
    await this.clearGrace(graceKey);
  }

  /**
   * Enforce stream violation outcome
   */
  private async enforceStreamViolation(
    matchId: string,
    side: 'host' | 'opp',
    streamInfo: StreamInfo,
    now: number
  ): Promise<void> {
    try {
      // Check if overlay indicates gameplay is still running
      const overlayRunning = await this.overlaySaysRunning(matchId);
      
      if (overlayRunning) {
        // Overlay shows gameplay continued - forfeit the unhealthy side
        await this.handleForfeit(matchId, side, now);
      } else {
        // No overlay confirmation - open dispute
        await this.handleDispute(matchId, side, streamInfo, now);
      }
    } catch (error) {
      this.logger.error(`Error enforcing stream violation for match ${matchId}, ${side}:`, error);
    }
  }

  /**
   * Handle forfeit due to stream violation
   */
  private async handleForfeit(matchId: string, side: 'host' | 'opp', now: number): Promise<void> {
    try {
      const match = await this.prisma.client.match.findUnique({
        where: { id: matchId },
        select: { hostId: true, oppId: true, entryFc: true }
      });

      if (!match) {
        this.logger.error(`Match not found for forfeit: ${matchId}`);
        return;
      }

      const forfeiterId = side === 'host' ? match.hostId : match.oppId!;
      const winnerId = side === 'host' ? match.oppId! : match.hostId;
      const totalPot = Number(match.entryFc) * 2;

      await this.kafka.emit('match.forfeit', {
        v: 'v1',
        eventId: `ff:${matchId}:${side}:${now}`,
        matchId,
        forfeiterId,
        winnerId,
        totalPot: totalPot.toString(),
        reason: 'STREAM_OFFLINE',
        timestamp: now
      });

      this.logger.log(`Forfeit triggered for match ${matchId}: ${side} stream offline`);
    } catch (error) {
      this.logger.error(`Error handling forfeit for match ${matchId}:`, error);
    }
  }

  /**
   * Handle dispute due to stream violation
   */
  private async handleDispute(
    matchId: string,
    side: 'host' | 'opp',
    streamInfo: StreamInfo,
    now: number
  ): Promise<void> {
    try {
      await this.kafka.emit('match.dispute', {
        v: 'v1',
        eventId: `dp:${matchId}:${side}:${now}`,
        matchId,
        hostResult: null,
        oppResult: null,
        evidenceRefs: [`stream:${side}:offline`, `stream:${side}:${this.getUnhealthyReason(streamInfo)}`],
        reason: 'STREAM_VIOLATION',
        timestamp: now
      });

      this.logger.log(`Dispute triggered for match ${matchId}: ${side} stream violation`);
    } catch (error) {
      this.logger.error(`Error handling dispute for match ${matchId}:`, error);
    }
  }

  /**
   * Get stream info for a user (supports both external and FlockTube streams)
   */
  private async getStreamInfo(userId: string, matchId?: string, mode?: string): Promise<StreamInfo> {
    try {
      // Check if this is a FlockTube stream
      if (mode === 'PRIVATE_SERVER_WITH_STREAM' && matchId) {
        return await this.getFlockTubeStreamInfo(userId, matchId);
      }

      // External stream (Twitch/YouTube/Kick) - mock implementation
      // In production, you would call Twitch/YouTube/Kick APIs here
      // with proper rate limiting and caching
      
      const cached = await this.redis.get(`stream:info:${userId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Mock stream info - replace with real API calls
      const streamInfo: StreamInfo = {
        live: Math.random() > 0.1, // 90% chance of being live
        title: `FLOCKNODE Match #${userId}`,
        fps: Math.floor(Math.random() * 30) + 30, // 30-60 FPS
        bitrate: Math.floor(Math.random() * 2000) + 2500, // 2500-4500 kbps
        provider: 'twitch',
        channelId: userId
      };

      // Cache for 30 seconds
      await this.redis.setex(`stream:info:${userId}`, 30, JSON.stringify(streamInfo));
      
      return streamInfo;
    } catch (error) {
      this.logger.error(`Error getting stream info for user ${userId}:`, error);
      return {
        live: false,
        fps: 0,
        bitrate: 0
      };
    }
  }

  /**
   * Get FlockTube stream info from database
   */
  private async getFlockTubeStreamInfo(userId: string, matchId: string): Promise<StreamInfo> {
    try {
      const stream = await this.prisma.client.flocktubeStream.findFirst({
        where: {
          matchId,
          userId
        },
        select: {
          status: true,
          bitrate: true,
          fps: true,
          resolution: true,
          title: true,
          viewerCount: true
        }
      });

      if (!stream) {
        return {
          live: false,
          fps: 0,
          bitrate: 0
        };
      }

      return {
        live: stream.status === 'LIVE',
        title: stream.title || `FLOCKNODE Match #${matchId}`,
        fps: stream.fps || 30,
        bitrate: stream.bitrate || 2500,
        provider: 'flocktube',
        channelId: userId
      };
    } catch (error) {
      this.logger.error(`Error getting FlockTube stream info for user ${userId}:`, error);
      return {
        live: false,
        fps: 0,
        bitrate: 0
      };
    }
  }

  /**
   * Check if overlay indicates gameplay is running
   */
  private async overlaySaysRunning(matchId: string): Promise<boolean> {
    try {
      // Check overlay heartbeat in Redis
      const lastHeartbeat = await this.redis.get(`ovl:lasthb:${matchId}`);
      if (!lastHeartbeat) return false;

      const timestamp = Number(lastHeartbeat);
      const now = Date.now();
      const timeDiff = (now - timestamp) / 1000; // seconds

      // Consider overlay running if heartbeat within last 30 seconds
      return timeDiff <= 30;
    } catch (error) {
      this.logger.error(`Error checking overlay status for match ${matchId}:`, error);
      return false;
    }
  }

  /**
   * Get reason for unhealthy stream
   */
  private getUnhealthyReason(streamInfo: StreamInfo): string {
    if (!streamInfo.live) return 'offline';
    if (streamInfo.fps < MIN_FPS) return 'low_fps';
    if (streamInfo.bitrate < MIN_KBPS) return 'low_bitrate';
    return 'unknown';
  }

  /**
   * Update match checklist
   */
  private async updateMatchChecklist(matchId: string, key: string, status: string): Promise<void> {
    try {
      await this.prisma.client.$executeRawUnsafe(`
        UPDATE "matches"
        SET checklist = jsonb_set(checklist::jsonb, '{${key}}', '"${status}"', true)
        WHERE id = $1
      `, matchId);
    } catch (error) {
      this.logger.error(`Failed to update checklist for match ${matchId}:`, error);
    }
  }

  // Redis grace period helpers
  private async getGraceStart(key: string): Promise<number | null> {
    try {
      const value = await this.redis.get(key);
      return value ? Number(value) : null;
    } catch (error) {
      this.logger.error(`Error getting grace start for key ${key}:`, error);
      return null;
    }
  }

  private async startGrace(key: string, now: number): Promise<void> {
    try {
      await this.redis.setex(key, Math.ceil(OFFLINE_GRACE_MS / 1000), now.toString());
    } catch (error) {
      this.logger.error(`Error starting grace for key ${key}:`, error);
    }
  }

  private async clearGrace(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Error clearing grace for key ${key}:`, error);
    }
  }
}
