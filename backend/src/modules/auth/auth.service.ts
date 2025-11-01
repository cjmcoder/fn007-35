import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as crypto from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { AuditService } from '../audit/audit.service';
import { WalletService } from '../wallet/wallet.service';
import { ProfileService } from '../profile/profile.service';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { TokensResponseDto } from './dto/tokens-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
    private readonly walletService: WalletService,
    private readonly profileService: ProfileService,
  ) {}

  async getOAuthUrl(provider: string, req: Request): Promise<string> {
    const state = crypto.randomBytes(32).toString('hex');
    const redirectUri = `${this.configService.get('FRONTEND_URL')}/api/auth/oauth/${provider}/callback`;
    
    // Store state in Redis for validation
    await this.redisService.set(`oauth:state:${state}`, JSON.stringify({
      provider,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: Date.now(),
    }), 'EX', 600); // 10 minutes

    const baseUrls = {
      google: 'https://accounts.google.com/o/oauth2/v2/auth',
      twitch: 'https://id.twitch.tv/oauth2/authorize',
      discord: 'https://discord.com/api/oauth2/authorize',
    };

    const clientIds = {
      google: this.configService.get('OAUTH_GOOGLE_CLIENT_ID'),
      twitch: this.configService.get('OAUTH_TWITCH_CLIENT_ID'),
      discord: this.configService.get('OAUTH_DISCORD_CLIENT_ID'),
    };

    const scopes = {
      google: 'openid email profile',
      twitch: 'user:read:email',
      discord: 'identify email',
    };

    const params = new URLSearchParams({
      client_id: clientIds[provider],
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes[provider],
      state,
    });

    return `${baseUrls[provider]}?${params.toString()}`;
  }

  async handleOAuthCallback(provider: string, query: OAuthCallbackDto, req: Request): Promise<TokensResponseDto> {
    // Validate state parameter
    const stateData = await this.redisService.get(`oauth:state:${query.state}`);
    if (!stateData) {
      throw new BadRequestException('Invalid or expired OAuth state');
    }

    const { provider: storedProvider, ip, userAgent } = JSON.parse(stateData);
    if (storedProvider !== provider || ip !== req.ip) {
      throw new BadRequestException('OAuth state validation failed');
    }

    // Clean up state
    await this.redisService.del(`oauth:state:${query.state}`);

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(provider, query.code);
    
    // Get user info from provider
    const userInfo = await this.getUserInfoFromProvider(provider, tokens.access_token);
    
    // Find or create user
    const user = await this.findOrCreateUser(provider, userInfo, tokens);
    
    // Create wallet and profile if they don't exist
    await this.ensureUserSetup(user.id);
    
    // Generate JWT tokens
    const jwtTokens = await this.generateTokens(user);
    
    // Store refresh token
    await this.storeRefreshToken(user.id, jwtTokens.refreshToken, req);
    
    // Log successful login
    await this.auditService.log({
      actorId: user.id,
      action: 'USER_LOGIN',
      entity: 'USER',
      entityId: user.id,
      metadata: { provider, ip: req.ip, userAgent: req.get('User-Agent') },
    });

    return jwtTokens;
  }

  private async exchangeCodeForTokens(provider: string, code: string): Promise<any> {
    const redirectUri = `${this.configService.get('FRONTEND_URL')}/api/auth/oauth/${provider}/callback`;
    
    const tokenUrls = {
      google: 'https://oauth2.googleapis.com/token',
      twitch: 'https://id.twitch.tv/oauth2/token',
      discord: 'https://discord.com/api/oauth2/token',
    };

    const clientSecrets = {
      google: this.configService.get('OAUTH_GOOGLE_CLIENT_SECRET'),
      twitch: this.configService.get('OAUTH_TWITCH_CLIENT_SECRET'),
      discord: this.configService.get('OAUTH_DISCORD_CLIENT_SECRET'),
    };

    const clientIds = {
      google: this.configService.get('OAUTH_GOOGLE_CLIENT_ID'),
      twitch: this.configService.get('OAUTH_TWITCH_CLIENT_ID'),
      discord: this.configService.get('OAUTH_DISCORD_CLIENT_ID'),
    };

    const response = await fetch(tokenUrls[provider], {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientIds[provider],
        client_secret: clientSecrets[provider],
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to exchange OAuth code for tokens');
    }

    return response.json();
  }

  private async getUserInfoFromProvider(provider: string, accessToken: string): Promise<any> {
    const userInfoUrls = {
      google: 'https://www.googleapis.com/oauth2/v2/userinfo',
      twitch: 'https://api.twitch.tv/helix/users',
      discord: 'https://discord.com/api/users/@me',
    };

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };

    if (provider === 'twitch') {
      headers['Client-Id'] = this.configService.get('OAUTH_TWITCH_CLIENT_ID');
    }

    const response = await fetch(userInfoUrls[provider], { headers });

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch user info from provider');
    }

    const data = await response.json();
    
    // Normalize user info across providers
    switch (provider) {
      case 'google':
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          picture: data.picture,
        };
      case 'twitch':
        const user = data.data[0];
        return {
          id: user.id,
          email: user.email,
          name: user.display_name,
          picture: user.profile_image_url,
        };
      case 'discord':
        return {
          id: data.id,
          email: data.email,
          name: data.username,
          picture: `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`,
        };
      default:
        throw new BadRequestException('Unsupported OAuth provider');
    }
  }

  private async findOrCreateUser(provider: string, userInfo: any, tokens: any) {
    // Check if user exists by email
    let user = await this.prisma.user.findUnique({
      where: { email: userInfo.email },
      include: { authProviders: true },
    });

    if (user) {
      // Update or create auth provider
      await this.prisma.authProvider.upsert({
        where: {
          provider_providerUserId: {
            provider,
            providerUserId: userInfo.id,
          },
        },
        update: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
        create: {
          userId: user.id,
          provider,
          providerUserId: userInfo.id,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
      });
    } else {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          email: userInfo.email,
          username: userInfo.name.toLowerCase().replace(/\s+/g, ''),
          displayName: userInfo.name,
          avatarUrl: userInfo.picture,
          authProviders: {
            create: {
              provider,
              providerUserId: userInfo.id,
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
            },
          },
        },
        include: { authProviders: true },
      });
    }

    return user;
  }

  private async ensureUserSetup(userId: string) {
    // Create wallet if it doesn't exist
    await this.walletService.ensureWallet(userId);
    
    // Create profile if it doesn't exist
    await this.profileService.ensureProfile(userId);
  }

  private async generateTokens(user: any): Promise<TokensResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
    };
  }

  private async storeRefreshToken(userId: string, refreshToken: string, req: Request) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      },
    });
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<TokensResponseDto> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    // Find and validate refresh token
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const newTokens = await this.generateTokens(storedToken.user);
    
    // Store new refresh token
    await this.storeRefreshToken(userId, newTokens.refreshToken, { 
      get: () => storedToken.userAgent,
      ip: storedToken.ip,
    } as Request);

    return newTokens;
  }

  async logout(userId: string, req: Request) {
    const userAgent = req.get('User-Agent');
    const ip = req.ip;
    
    // Revoke all refresh tokens for this user session
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        userAgent,
        ip,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    // Log logout
    await this.auditService.log({
      actorId: userId,
      action: 'USER_LOGOUT',
      entity: 'USER',
      entityId: userId,
      metadata: { ip, userAgent },
    });
  }

  async revokeAllRefreshTokens(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    await this.auditService.log({
      actorId: userId,
      action: 'REVOKE_ALL_TOKENS',
      entity: 'USER',
      entityId: userId,
    });
  }

  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        wallet: true,
        authProviders: {
          select: { provider: true, createdAt: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      roles: user.roles,
      trustScore: user.trustScore,
      tfaEnabled: user.tfaEnabled,
      isBanned: user.isBanned,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      profile: user.profile,
      wallet: user.wallet,
      authProviders: user.authProviders,
    };
  }
}





