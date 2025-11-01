import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class HmacGuard implements CanActivate {
  private readonly hmacSecret = process.env.HMAC_SERVER_SECRET;
  private readonly allowedIPs = [
    '10.42.0.13', // VPS-3 WireGuard IP
    '51.81.223.116', // VPS-3 Public IP
    '127.0.0.1',
    '::1',
  ];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const clientIP = this.getClientIP(request);

    // Check IP allowlist
    if (!this.allowedIPs.includes(clientIP)) {
      throw new UnauthorizedException('IP not allowed');
    }

    // Check HMAC signature
    const signature = request.headers['x-hmac-signature'] as string;
    if (!signature) {
      throw new UnauthorizedException('HMAC signature required');
    }

    if (!this.verifyHmacSignature(request, signature)) {
      throw new UnauthorizedException('Invalid HMAC signature');
    }

    return true;
  }

  private getClientIP(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      '127.0.0.1'
    );
  }

  private verifyHmacSignature(request: Request, signature: string): boolean {
    if (!this.hmacSecret) {
      return false;
    }

    const body = JSON.stringify(request.body);
    const timestamp = request.headers['x-timestamp'] as string;
    const nonce = request.headers['x-nonce'] as string;

    if (!timestamp || !nonce) {
      return false;
    }

    const message = `${body}:${timestamp}:${nonce}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.hmacSecret)
      .update(message)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }
}