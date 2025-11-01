import { Injectable, Logger, BadRequestException, ForbiddenException, PayloadTooLargeException, TooManyRequestsException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { KafkaService } from '../../common/kafka/kafka.service';
import { createHmac, timingSafeEqual } from 'crypto';
import { OverlayEventType, OverlayEventDto, ScorePayloadDto } from './dto/overlay-event.dto';

@Injectable()
export class OverlayService {
  private readonly logger = new Logger(OverlayService.name);
  private readonly MAX_BODY_BYTES = 32 * 1024; // 32KB
  private readonly MAX_SKEW_MS = 60_000; // 60 seconds

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly kafka: KafkaService,
  ) {}

  /**
   * Main entry point for processing overlay events with HMAC verification
   */
  async processEvent(req: Request, body: any) {
    this.enforceSize(req);

    // 1) Extract and validate headers
    const keyId = String(req.headers['x-flock-key-id'] || '');
    const tsHdr = String(req.headers['x-flock-ts'] || '');
    const nonce = String(req.headers['x-flock-nonce'] || '');
    const sigHdr = String(req.headers['x-flock-signature'] || '');

    // 2) Basic validations
    this.validateIpAllowlist(req);
    this.validateTimestamp(tsHdr);
    await this.assertFreshNonce(keyId, nonce);

    // 3) Validate and parse body
    const { eventId, matchId, type, payload, timestamp } = this.validateBody(body);

    // 4) Resolve per-match secret by keyId
    const secret = await this.lookupSecret(matchId, keyId);
    if (!secret) {
      throw new ForbiddenException('Unknown key or expired secret');
    }

    // 5) HMAC verification with canonical string
    const canonical = this.canonicalPayload(keyId, tsHdr, nonce, matchId, type, payload);
    this.verifySignature(sigHdr, secret, canonical);

    // 6) Idempotency check by eventId
    const isDuplicate = await this.redis.setnx(`ovl:eid:${eventId}`, '1');
    if (!isDuplicate) {
      this.logger.warn(`Duplicate event detected: ${eventId}`);
      return { status: 'DUPLICATE' };
    }
    await this.redis.pexpire(`ovl:eid:${eventId}`, 86_400_000); // 24 hours

    // 7) Update heartbeat and checklist
    await this.redis.psetex(`ovl:lasthb:${matchId}`, 30 * 60_000, Date.now().toString());
    await this.updateMatchChecklist(matchId, 'overlayConnected', 'PASS');
    await this.updateMatchChecklist(matchId, 'overlayHeartbeat', 'PASS');

    // 8) Process event by type
    await this.processEventByType(matchId, type, payload, eventId);

    // 9) Emit ingestion audit event
    await this.kafka.emit('overlay.event.ingested', {
      matchId,
      type,
      eventId,
      timestamp: Date.now()
    });

    return { ok: true, eventId, matchId, type };
  }

  /**
   * Process events by type with specific logic
   */
  private async processEventByType(matchId: string, type: OverlayEventType, payload: any, eventId: string) {
    switch (type) {
      case OverlayEventType.HEARTBEAT:
        this.logger.debug(`Heartbeat received for match ${matchId}`);
        break;

      case OverlayEventType.SCORE: {
        this.enforceRateLimit(matchId, 'SCORE');
        const score = this.coerceScore(payload);
        await this.redis.set(`ovl:score:${matchId}`, JSON.stringify({
          ...score,
          ts: Date.now()
        }));
        await this.kafka.emit('overlay.score.updated', {
          matchId,
          ...score,
          eventId,
          timestamp: Date.now()
        });
        this.logger.log(`Score updated for match ${matchId}: ${score.home}-${score.away}`);
        break;
      }

      case OverlayEventType.STATE: {
        await this.kafka.emit('overlay.state', {
          matchId,
          payload,
          eventId,
          timestamp: Date.now()
        });
        this.logger.log(`State change for match ${matchId}: ${payload.state}`);
        break;
      }

      case OverlayEventType.MATCH_END: {
        await this.kafka.emit('overlay.match_end', {
          matchId,
          payload,
          eventId,
          timestamp: Date.now()
        });
        this.logger.log(`Match end event for match ${matchId}: ${payload.reason}`);
        break;
      }

      default:
        throw new BadRequestException(`Unknown event type: ${type}`);
    }
  }

  /**
   * Create canonical payload string for HMAC signing
   */
  private canonicalPayload(
    keyId: string,
    ts: string,
    nonce: string,
    matchId: string,
    type: string,
    payload: unknown
  ): string {
    const canonicalJson = this.stableStringify(payload);
    return `v1|${keyId}|${ts}|${nonce}|${matchId}|${type}|${canonicalJson}`;
  }

  /**
   * Verify HMAC signature with timing-safe comparison
   */
  private verifySignature(sigHex: string, secret: string, canonical: string) {
    if (!/^[a-f0-9]{64}$/.test(sigHex)) {
      throw new ForbiddenException('Invalid signature format');
    }

    const expected = createHmac('sha256', secret)
      .update(canonical, 'utf8')
      .digest('hex');

    const received = Buffer.from(sigHex, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');

    if (received.length !== expectedBuffer.length || 
        !timingSafeEqual(received, expectedBuffer)) {
      throw new ForbiddenException('Signature mismatch');
    }
  }

  /**
   * Create stable JSON string with sorted keys
   */
  private stableStringify(obj: any): string {
    if (obj === null || typeof obj !== 'object') {
      return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
      return `[${obj.map(v => this.stableStringify(v)).join(',')}]`;
    }

    const keys = Object.keys(obj).sort();
    const parts = keys.map(k => `${JSON.stringify(k)}:${this.stableStringify(obj[k])}`);
    return `{${parts.join(',')}}`;
  }

  /**
   * Validate request body structure
   */
  private validateBody(body: any): OverlayEventDto {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Request body is required');
    }

    const { eventId, matchId, type, payload, timestamp } = body;

    if (!eventId || !matchId || !type || timestamp == null) {
      throw new BadRequestException('Missing required fields: eventId, matchId, type, timestamp');
    }

    return {
      eventId: String(eventId),
      matchId: String(matchId),
      type: String(type) as OverlayEventType,
      payload,
      timestamp: Number(timestamp)
    };
  }

  /**
   * Validate timestamp for clock skew protection
   */
  private validateTimestamp(tsHdr: string) {
    const now = Date.now();
    const ts = Number(tsHdr);

    if (!Number.isFinite(ts)) {
      throw new ForbiddenException('Invalid timestamp format');
    }

    if (Math.abs(now - ts) > this.MAX_SKEW_MS) {
      throw new ForbiddenException(`Clock skew too large: ${Math.abs(now - ts)}ms`);
    }
  }

  /**
   * Check for replay attacks using nonce
   */
  private async assertFreshNonce(keyId: string, nonce: string) {
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(nonce)) {
      throw new ForbiddenException('Invalid nonce format');
    }

    const key = `ovl:nonce:${keyId}:${nonce}`;
    const isNew = await this.redis.set(key, '1', 'NX', 'PX', 120_000); // 2 minutes TTL

    if (!isNew) {
      throw new ForbiddenException('Replay attack detected');
    }
  }

  /**
   * Enforce request size limits
   */
  private enforceSize(req: Request) {
    const len = Number(req.headers['content-length'] || 0);
    if (len > this.MAX_BODY_BYTES) {
      throw new PayloadTooLargeException(`Request body too large: ${len} bytes`);
    }
  }

  /**
   * Validate source IP against allowlist
   */
  private validateIpAllowlist(req: Request) {
    const ip = (req.headers['cf-connecting-ip'] as string) || 
               (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
               req.ip;

    // Allow VPS-3 and overlay pod CIDRs
    const allowedIPs = [
      '51.81.223.116', // VPS-3
      '10.42.0.0/16',  // WireGuard mesh
      '127.0.0.1',     // Localhost for testing
    ];

    const isAllowed = allowedIPs.some(allowed => {
      if (allowed.includes('/')) {
        // CIDR check (simplified)
        return ip.startsWith(allowed.split('/')[0].split('.').slice(0, 2).join('.'));
      }
      return ip === allowed;
    });

    if (!isAllowed) {
      this.logger.warn(`Blocked request from unauthorized IP: ${ip}`);
      throw new ForbiddenException('Unauthorized source IP');
    }
  }

  /**
   * Look up per-match secret by keyId
   */
  private async lookupSecret(matchId: string, keyId: string): Promise<string | null> {
    try {
      // Look up in MatchSecret table or similar
      const secret = await this.redis.get(`ovl:secret:${matchId}:${keyId}`);
      if (secret) {
        return secret;
      }

      // Fallback to database lookup
      const record = await this.prisma.client.matchSecret.findUnique({
        where: { matchId_keyId: { matchId, keyId } }
      });

      if (!record || record.expiresAt < new Date()) {
        return null;
      }

      // Cache in Redis
      await this.redis.setex(
        `ovl:secret:${matchId}:${keyId}`,
        300, // 5 minutes
        record.secret
      );

      return record.secret;
    } catch (error) {
      this.logger.error(`Failed to lookup secret for match ${matchId}, key ${keyId}:`, error);
      return null;
    }
  }

  /**
   * Validate and coerce score payload
   */
  private coerceScore(payload: any): ScorePayloadDto {
    const home = Number(payload?.home);
    const away = Number(payload?.away);

    if (!Number.isInteger(home) || !Number.isInteger(away) || 
        home < 0 || away < 0 || home > 99 || away > 99) {
      throw new BadRequestException('Invalid score values');
    }

    return { home, away };
  }

  /**
   * Enforce rate limiting per match and event type
   */
  private async enforceRateLimit(matchId: string, bucket: string) {
    const key = `ovl:rl:${matchId}:${bucket}`;
    const count = await this.redis.incr(key);

    if (count === 1) {
      await this.redis.pexpire(key, 1000); // 1 second window
    }

    if (count > 10) { // Max 10 events per second per match
      throw new TooManyRequestsException('Rate limit exceeded');
    }
  }

  /**
   * Update match checklist
   */
  private async updateMatchChecklist(matchId: string, key: string, status: string) {
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

  /**
   * Get current score for a match
   */
  async getMatchScore(matchId: string): Promise<ScorePayloadDto | null> {
    try {
      const scoreData = await this.redis.get(`ovl:score:${matchId}`);
      if (!scoreData) return null;

      const parsed = JSON.parse(scoreData);
      return { home: parsed.home, away: parsed.away };
    } catch (error) {
      this.logger.error(`Failed to get score for match ${matchId}:`, error);
      return null;
    }
  }

  /**
   * Get last heartbeat timestamp for a match
   */
  async getLastHeartbeat(matchId: string): Promise<number | null> {
    try {
      const timestamp = await this.redis.get(`ovl:lasthb:${matchId}`);
      return timestamp ? Number(timestamp) : null;
    } catch (error) {
      this.logger.error(`Failed to get heartbeat for match ${matchId}:`, error);
      return null;
    }
  }

  /**
   * Generate per-match overlay secrets
   */
  async generateMatchSecrets(matchId: string): Promise<{ keyId: string; secret: string }> {
    const keyId = `ovl_${matchId}_${Date.now()}`;
    const secret = createHmac('sha256', process.env.OVERLAY_MASTER_SECRET || 'default')
      .update(matchId + keyId + Date.now())
      .digest('hex');

    // Store in database with expiration
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    await this.prisma.client.matchSecret.upsert({
      where: { matchId_keyId: { matchId, keyId } },
      create: { matchId, keyId, secret, expiresAt },
      update: { secret, expiresAt }
    });

    // Cache in Redis
    await this.redis.setex(`ovl:secret:${matchId}:${keyId}`, 300, secret);

    return { keyId, secret };
  }

  /**
   * Revoke match secrets
   */
  async revokeMatchSecrets(matchId: string) {
    try {
      // Remove from database
      await this.prisma.client.matchSecret.deleteMany({
        where: { matchId }
      });

      // Remove from Redis cache
      const keys = await this.redis.keys(`ovl:secret:${matchId}:*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }

      this.logger.log(`Revoked secrets for match ${matchId}`);
    } catch (error) {
      this.logger.error(`Failed to revoke secrets for match ${matchId}:`, error);
    }
  }
}