import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { KafkaService } from '../common/kafka/kafka.service';
import { MetricsService } from '../common/metrics/metrics.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import {
  LoginResponseDto,
  UserDto,
  LinkGamertagDto,
  LinkStreamDto,
  TwoFactorSetupDto,
  EnableNotificationsDto,
  SetLimitsDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
    private kafkaService: KafkaService,
    private metricsService: MetricsService,
  ) {}

  async getOAuthUrl(provider: string): Promise<string> {
    const baseUrl = this.configService.get<string>('frontend.apiUrl');
    
    switch (provider) {
      case 'google':
        return `${baseUrl}/auth/oauth/google`;
      case 'twitch':
        return `${baseUrl}/auth/oauth/twitch`;
      case 'discord':
        return `${baseUrl}/auth/oauth/discord`;
      default:
        throw new BadRequestException('Invalid OAuth provider');
    }
  }

  async handleOAuthCallback(provider: string, code: string, state: string): Promise<LoginResponseDto> {
    try {
      // In a real implementation, you would exchange the code for tokens
      // and fetch user information from the OAuth provider
      const userInfo = await this.exchangeCodeForUserInfo(provider, code);
      
      // Find or create user
      let user = await this.prismaService.user.findUnique({
        where: { email: userInfo.email },
      });

      if (!user) {
        user = await this.createUserFromOAuth(userInfo, provider);
        this.metricsService.recordUserRegistration(provider);
      } else {
        this.metricsService.recordUserLogin(provider);
      }

      // Update last login
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Store refresh token in Redis
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      // Emit domain event
      const event = this.kafkaService.createEvent(
        'auth.user.logged_in',
        user.id,
        'User',
        { provider, userId: user.id },
        { userId: user.id }
      );
      await this.kafkaService.publishEvent('auth.events', event);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: this.mapUserToDto(user),
      };
    } catch (error) {
      this.logger.error('OAuth callback error:', error);
      throw new UnauthorizedException('OAuth authentication failed');
    }
  }

  async refreshToken(refreshToken: string): Promise<LoginResponseDto> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      // Check if token exists in Redis
      const storedToken = await this.redisService.get(`refresh_token:${payload.sub}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get user
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.isBanned) {
        throw new UnauthorizedException('User not found or banned');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Update refresh token in Redis
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: this.mapUserToDto(user),
      };
    } catch (error) {
      this.logger.error('Token refresh error:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    // Remove refresh token from Redis
    await this.redisService.del(`refresh_token:${userId}`);
    
    // Emit domain event
    const event = this.kafkaService.createEvent(
      'auth.user.logged_out',
      userId,
      'User',
      { userId },
      { userId }
    );
    await this.kafkaService.publishEvent('auth.events', event);
  }

  async linkGamertag(userId: string, linkGamertagDto: LinkGamertagDto): Promise<{ status: string }> {
    // await this.prismaService.gamertag.upsert({
      where: {
        userId_platform: {
          userId,
          platform: linkGamertagDto.platform as any,
        },
      },
      update: {
        gamertag: linkGamertagDto.gamertag,
        updatedAt: new Date(),
      },
      create: {
        userId,
        platform: linkGamertagDto.platform as any,
        gamertag: linkGamertagDto.gamertag,
      },
    });

    // Emit domain event
    const event = this.kafkaService.createEvent(
      'profile.gamertag.linked',
      userId,
      'User',
      { platform: linkGamertagDto.platform, gamertag: linkGamertagDto.gamertag },
      { userId }
    );
    await this.kafkaService.publishEvent('profile.events', event);

    return { status: 'linked' };
  }

  async linkStream(userId: string, linkStreamDto: LinkStreamDto): Promise<{ status: string }> {
    // await this.prismaService.streamLink.upsert({
      where: {
        userId_provider: {
          userId,
          provider: linkStreamDto.provider,
        },
      },
      update: {
        channelId: linkStreamDto.channelId,
        updatedAt: new Date(),
      },
      create: {
        userId,
        provider: linkStreamDto.provider,
        channelId: linkStreamDto.channelId,
      },
    });

    // Emit domain event
    const event = this.kafkaService.createEvent(
      'stream.channel.linked',
      userId,
      'User',
      { provider: linkStreamDto.provider, channelId: linkStreamDto.channelId },
      { userId }
    );
    await this.kafkaService.publishEvent('stream.events', event);

    return { status: 'linked' };
  }

  async setup2FA(userId: string): Promise<TwoFactorSetupDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.tfaEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `FLOCKNODE (${user.email})`,
      issuer: 'FLOCKNODE',
    });

    // Generate QR code
    const qr = await QRCode.toDataURL(secret.otpauth_url);

    // Store secret temporarily (will be confirmed later)
    await this.redisService.set(`2fa_setup:${userId}`, secret.base32, 300); // 5 minutes

    return {
      qr,
      secretMasked: secret.base32.substring(0, 8) + '...',
    };
  }

  async confirm2FA(userId: string, code: string): Promise<{ status: string }> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Get stored secret
    const secret = await this.redisService.get(`2fa_setup:${userId}`);
    if (!secret) {
      throw new BadRequestException('2FA setup session expired');
    }

    // Verify code
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!verified) {
      throw new BadRequestException('Invalid 2FA code');
    }

    // Enable 2FA
    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        tfaEnabled: true,
        tfaSecret: secret,
      },
    });

    // Clean up temporary secret
    await this.redisService.del(`2fa_setup:${userId}`);

    // Emit domain event
    const event = this.kafkaService.createEvent(
      'security.2fa.enabled',
      userId,
      'User',
      { userId },
      { userId }
    );
    await this.kafkaService.publishEvent('security.events', event);

    return { status: 'enabled' };
  }

  async enableNotifications(userId: string, enableNotificationsDto: EnableNotificationsDto): Promise<{ status: string }> {
    // Store notification subscription in Redis
    const subscription = {
      endpoint: enableNotificationsDto.endpoint,
      p256dh: enableNotificationsDto.p256dh,
      auth: enableNotificationsDto.auth,
    };

    await this.redisService.set(
      `notification_subscription:${userId}`,
      JSON.stringify(subscription),
      30 * 24 * 60 * 60 // 30 days
    );

    // Emit domain event
    const event = this.kafkaService.createEvent(
      'notify.subscribed',
      userId,
      'User',
      { userId },
      { userId }
    );
    await this.kafkaService.publishEvent('notification.events', event);

    return { status: 'ok' };
  }

  async setLimits(userId: string, setLimitsDto: SetLimitsDto): Promise<{ status: string }> {
    // Store limits in Redis
    const limits = {
      dailyWagerCapFc: setLimitsDto.dailyWagerCapFc,
      withdrawCooldownMin: setLimitsDto.withdrawCooldownMin,
    };

    await this.redisService.set(
      `user_limits:${userId}`,
      JSON.stringify(limits),
      24 * 60 * 60 // 24 hours
    );

    // Emit domain event
    const event = this.kafkaService.createEvent(
      'account.limits.updated',
      userId,
      'User',
      limits,
      { userId }
    );
    await this.kafkaService.publishEvent('account.events', event);

    return { status: 'updated' };
  }

  async validateUser(payload: any): Promise<UserDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.isBanned) {
      throw new UnauthorizedException('User not found or banned');
    }

    return this.mapUserToDto(user);
  }

  private async exchangeCodeForUserInfo(provider: string, code: string): Promise<any> {
    // This is a placeholder - in real implementation, you would:
    // 1. Exchange code for access token
    // 2. Use access token to fetch user info
    // 3. Return standardized user info object
    
    switch (provider) {
      case 'google':
        return {
          email: 'user@gmail.com',
          name: 'Test User',
          picture: 'https://example.com/avatar.jpg',
        };
      case 'twitch':
        return {
          email: 'user@twitch.tv',
          name: 'TestStreamer',
          picture: 'https://example.com/avatar.jpg',
        };
      case 'discord':
        return {
          email: 'user@discord.com',
          name: 'TestUser#1234',
          picture: 'https://example.com/avatar.jpg',
        };
      default:
        throw new BadRequestException('Invalid OAuth provider');
    }
  }

  private async createUserFromOAuth(userInfo: any, provider: string): Promise<any> {
    const username = this.generateUsername(userInfo.name, userInfo.email);
    
    return this.prismaService.user.create({
      data: {
        email: userInfo.email,
        username,
        displayName: userInfo.name,
        avatarUrl: userInfo.picture,
        roles: 'user',
      },
    });
  }

  private generateUsername(name: string, email: string): string {
    const base = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const random = Math.random().toString(36).substr(2, 4);
    return `${base}${random}`;
  }

  private async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const ttl = 7 * 24 * 60 * 60; // 7 days
    await this.redisService.set(`refresh_token:${userId}`, refreshToken, ttl);
  }

  private mapUserToDto(user: any): UserDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      roles: user.roles,
      trustScore: user.trustScore,
      tfaEnabled: user.tfaEnabled,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
