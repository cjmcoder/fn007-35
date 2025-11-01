import { CanActivate, ExecutionContext, Injectable, ForbiddenException, PayloadTooLargeException } from '@nestjs/common';
import { timingSafeEqual, createHmac } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

const MAX_BODY = 64 * 1024; // 64KB
const MAX_SKEW_MS = 60_000; // 60 seconds

// CIDR allowlist for overlay and admin hook access
const ALLOWLIST = [
  '51.81.223.116/32', // VPS-3 public IP
  '10.42.0.0/16',     // WireGuard mesh network
  '127.0.0.1/32',     // Localhost
  '::1/128',          // IPv6 localhost
];

@Injectable()
export class HmacGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 0) Size limit check
    const contentLength = Number(request.headers['content-length'] || 0);
    if (contentLength > MAX_BODY) {
      throw new PayloadTooLargeException('Request body too large');
    }

    // 1) IP allowlist check (supports Cloudflare/NGINX headers)
    const clientIp = this.getClientIp(request);
    if (!this.isIpAllowed(clientIp)) {
      throw new ForbiddenException('Unauthorized source IP');
    }

    // 2) Extract and validate headers
    const keyId = String(request.headers['x-flock-key-id'] || '');
    const timestamp = Number(request.headers['x-flock-ts'] || 0);
    const nonce = String(request.headers['x-flock-nonce'] || '');
    const signature = String(request.headers['x-flock-signature'] || '');

    if (!keyId || !timestamp || !nonce || !this.isValidSignatureFormat(signature)) {
      throw new ForbiddenException('Invalid or missing required headers');
    }

    // 3) Clock skew protection
    const now = Date.now();
    if (Math.abs(now - timestamp) > MAX_SKEW_MS) {
      throw new ForbiddenException('Request timestamp too old or in future');
    }

    // 4) Replay attack protection
    await this.checkReplayProtection(keyId, nonce);

    // 5) Fetch and validate secret
    const secretRecord = await this.getSecretByKeyId(keyId);
    if (!secretRecord || secretRecord.expiresAt < new Date()) {
      throw new ForbiddenException('Invalid or expired key');
    }

    // 6) Validate request body structure
    const { matchId, type, payload, timestamp: bodyTimestamp } = request.body || {};
    if (!matchId || !type || bodyTimestamp == null) {
      throw new ForbiddenException('Invalid request body structure');
    }

    // 7) Create canonical string and verify signature
    const canonicalString = this.createCanonicalString(
      keyId,
      timestamp,
      nonce,
      matchId,
      String(type),
      payload
    );

    if (!this.verifySignature(signature, secretRecord.secret, canonicalString)) {
      throw new ForbiddenException('Signature verification failed');
    }

    // 8) Attach authentication context to request
    request.flock = {
      matchId,
      keyId,
      secretId: secretRecord.id,
      timestamp,
      nonce
    };

    return true;
  }

  /**
   * Get client IP address with Cloudflare/NGINX support
   */
  private getClientIp(request: any): string {
    return (
      request.headers['cf-connecting-ip'] ||
      request.headers['x-real-ip'] ||
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.ip ||
      '127.0.0.1'
    );
  }

  /**
   * Check if IP is in allowlist using CIDR matching
   */
  private isIpAllowed(ip: string): boolean {
    try {
      // Simple CIDR matching for common cases
      // For production, consider using a proper CIDR library
      
      for (const cidr of ALLOWLIST) {
        if (this.matchesCidr(ip, cidr)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Simple CIDR matching (for production, use a proper library)
   */
  private matchesCidr(ip: string, cidr: string): boolean {
    try {
      const [network, prefixLength] = cidr.split('/');
      const prefix = parseInt(prefixLength, 10);
      
      if (prefix === 32) {
        return ip === network;
      }
      
      if (prefix === 128) {
        return ip === network;
      }
      
      // Simple /16 matching for WireGuard mesh
      if (prefix === 16) {
        const ipParts = ip.split('.');
        const networkParts = network.split('.');
        return ipParts[0] === networkParts[0] && ipParts[1] === networkParts[1];
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate signature format
   */
  private isValidSignatureFormat(signature: string): boolean {
    return /^[a-f0-9]{64}$/.test(signature);
  }

  /**
   * Check replay protection using nonce
   */
  private async checkReplayProtection(keyId: string, nonce: string): Promise<void> {
    const nonceKey = `hmac:nonce:${keyId}:${nonce}`;
    const isNew = await this.redis.set(nonceKey, '1', 'NX', 'PX', 120_000); // 2 minutes TTL
    
    if (!isNew) {
      throw new ForbiddenException('Replay attack detected');
    }
  }

  /**
   * Get secret by key ID with caching
   */
  private async getSecretByKeyId(keyId: string): Promise<any> {
    try {
      // Check cache first
      const cached = await this.redis.get(`hmac:secret:${keyId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Fetch from database
      const secretRecord = await this.prisma.client.matchSecret.findUnique({
        where: { keyId }
      });

      if (secretRecord) {
        // Cache for 5 minutes
        await this.redis.setex(
          `hmac:secret:${keyId}`,
          300,
          JSON.stringify(secretRecord)
        );
      }

      return secretRecord;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create canonical string for HMAC signing
   */
  private createCanonicalString(
    keyId: string,
    timestamp: number,
    nonce: string,
    matchId: string,
    type: string,
    payload: any
  ): string {
    const canonicalPayload = this.stableStringify(payload);
    return `v1|${keyId}|${timestamp}|${nonce}|${matchId}|${type}|${canonicalPayload}`;
  }

  /**
   * Create stable JSON string with sorted keys
   */
  private stableStringify(obj: any): string {
    if (obj === null || typeof obj !== 'object') {
      return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
      return `[${obj.map(item => this.stableStringify(item)).join(',')}]`;
    }

    const keys = Object.keys(obj).sort();
    const pairs = keys.map(key => 
      `${JSON.stringify(key)}:${this.stableStringify(obj[key])}`
    );
    
    return `{${pairs.join(',')}}`;
  }

  /**
   * Verify HMAC signature with timing-safe comparison
   */
  private verifySignature(signature: string, secret: string, canonicalString: string): boolean {
    try {
      const expectedSignature = createHmac('sha256', secret)
        .update(canonicalString, 'utf8')
        .digest('hex');

      const receivedBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');

      return receivedBuffer.length === expectedBuffer.length &&
             timingSafeEqual(receivedBuffer, expectedBuffer);
    } catch (error) {
      return false;
    }
  }
}





