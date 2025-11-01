import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class HmacAuthGuard implements CanActivate {
  private readonly logger = new Logger(HmacAuthGuard.name);

  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['x-signature'];
    const sourceIp = request.ip;

    if (!signature) {
      throw new UnauthorizedException('Missing HMAC signature');
    }

    // Verify IP allowlist
    if (!this.isAllowedIp(sourceIp)) {
      this.logger.warn(`Blocked request from unauthorized IP: ${sourceIp}`);
      throw new UnauthorizedException('IP not allowed');
    }

    // Verify HMAC signature
    if (!this.verifyHmacSignature(request, signature)) {
      this.logger.warn(`Invalid HMAC signature from IP: ${sourceIp}`);
      throw new UnauthorizedException('Invalid HMAC signature');
    }

    return true;
  }

  private isAllowedIp(sourceIp: string): boolean {
    const allowedIps = this.configService.get<string>('ALLOWED_SOURCE_IPS', '').split(',');
    return allowedIps.includes(sourceIp) || allowedIps.includes('*');
  }

  private verifyHmacSignature(request: any, signature: string): boolean {
    try {
      const secret = this.configService.get<string>('HMAC_OVERLAY_SECRET');
      if (!secret) {
        this.logger.error('HMAC_OVERLAY_SECRET not configured');
        return false;
      }

      const body = JSON.stringify(request.body);
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      const providedSignature = signature.replace('sha256=', '');
      
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      );
    } catch (error) {
      this.logger.error('HMAC verification error:', error);
      return false;
    }
  }
}





