import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMinimalService {
  private readonly logger = new Logger(AuthMinimalService.name);
  private users: any[] = [];
  private refreshTokens: string[] = [];

  constructor(private readonly jwtService: JwtService) {}

  async register(body: any) {
    const { email, username, displayName, password } = body;

    // Check if user already exists
    const existingUser = this.users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Create user (in memory for now)
    const user = {
      id: `user_${Date.now()}`,
      email,
      username,
      displayName,
      roles: 'user',
      trustScore: 100.0,
      tfaEnabled: false,
      isBanned: false,
      createdAt: new Date(),
      lastLoginAt: null,
    };

    this.users.push(user);

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    this.logger.log(`New user registered: ${user.email}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        roles: user.roles,
        trustScore: user.trustScore,
        tfaEnabled: user.tfaEnabled,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      }
    };
  }

  async login(body: any) {
    const { email, password } = body;

    if (!email || !password) {
      throw new UnauthorizedException('Email and password required');
    }

    // Find user or create test user for testing
    let user = this.users.find(u => u.email === email);
    if (!user) {
      // Auto-create test user for testing purposes
      user = {
        id: `user_${Date.now()}`,
        email: email,
        username: email.split('@')[0],
        displayName: email.split('@')[0],
        roles: 'user',
        trustScore: 100.0,
        tfaEnabled: false,
        isBanned: false,
        createdAt: new Date(),
        lastLoginAt: null,
      };
      this.users.push(user);
      this.logger.log(`Auto-created test user: ${user.email}`);
    }

    // In a real implementation, you'd verify the password here
    // For testing, accept any password

    // Update last login
    user.lastLoginAt = new Date();

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        roles: user.roles,
        trustScore: user.trustScore,
        tfaEnabled: user.tfaEnabled,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      }
    };
  }

  async getProfile(userId?: string) {
    // Find user by ID if provided, otherwise return most recently logged in user
    let user;
    if (userId) {
      user = this.users.find(u => u.id === userId);
    }
    
    // If no user found, return the most recently logged in user or first user
    if (!user) {
      user = this.users
        .filter(u => u.lastLoginAt)
        .sort((a, b) => (b.lastLoginAt?.getTime() || 0) - (a.lastLoginAt?.getTime() || 0))[0]
        || this.users[0];
    }

    // Fallback to demo user if no users exist
    if (!user) {
      user = {
        id: 'demo_user',
        email: 'demo@flocknode.com',
        username: 'demo_user',
        displayName: 'Demo User',
        roles: 'user',
        trustScore: 100.0,
        tfaEnabled: false,
        isBanned: false,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: null,
      roles: user.roles,
      trustScore: user.trustScore,
      tfaEnabled: user.tfaEnabled,
      isBanned: user.isBanned,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      profile: {
        id: 'profile_1',
        userId: user.id,
        bio: null,
        location: null,
        timezone: null,
        preferences: '{}',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      wallet: {
        id: 'wallet_1',
        userId: user.id,
        availableFc: 1000.0,
        lockedFc: 0.0,
        totalDeposited: 0.0,
        totalWithdrawn: 0.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  }

  async refreshToken(refreshToken: string) {
    if (!this.refreshTokens.includes(refreshToken)) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Remove old refresh token
    this.refreshTokens = this.refreshTokens.filter(t => t !== refreshToken);

    // Generate new tokens (using a mock user ID)
    const tokens = this.generateTokens('demo_user');

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: 'demo_user',
        email: 'demo@flocknode.com',
        username: 'demo_user',
        displayName: 'Demo User',
        roles: 'user',
        trustScore: 100.0,
        tfaEnabled: false,
        isBanned: false,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      }
    };
  }

  async logout(refreshToken: string) {
    this.refreshTokens = this.refreshTokens.filter(t => t !== refreshToken);
    return { message: 'Logged out successfully' };
  }

  private generateTokens(userId: string) {
    const payload = { sub: userId };
    
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET || 'dev-secret'
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret'
    });

    // Store refresh token
    this.refreshTokens.push(refreshToken);

    return { accessToken, refreshToken };
  }
}





