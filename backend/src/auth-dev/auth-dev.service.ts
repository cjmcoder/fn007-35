import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth-dev.dto';

@Injectable()
export class AuthDevService {
  private readonly logger = new Logger(AuthDevService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, username, displayName, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        displayName,
        // Note: In a real implementation, you'd store the hashed password
        // For now, we'll skip password storage in this simplified version
      },
      include: {
        profile: true,
        wallet: true,
      }
    });

    // Create default profile
    await this.prisma.profile.create({
      data: {
        userId: user.id,
        bio: null,
        location: null,
        timezone: null,
        preferences: "{}",
      }
    });

    // Create default wallet
    await this.prisma.wallet.create({
      data: {
        userId: user.id,
        availableFc: 1000.0, // Give new users 1000 FC to start
        lockedFc: 0.0,
        totalDeposited: 0.0,
        totalWithdrawn: 0.0,
      }
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

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
        lastLoginAt: user.lastLoginAt || undefined,
      }
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        wallet: true,
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // In a real implementation, you'd verify the password here
    // For now, we'll skip password verification in this simplified version

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

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
        lastLoginAt: user.lastLoginAt || undefined,
      }
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        wallet: true,
      }
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
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      profile: user.profile,
      wallet: user.wallet,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    // Find refresh token
    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(tokenRecord.userId);

    // Delete old refresh token
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        username: tokenRecord.user.username,
        displayName: tokenRecord.user.displayName,
        roles: tokenRecord.user.roles,
        trustScore: tokenRecord.user.trustScore,
        tfaEnabled: tokenRecord.user.tfaEnabled,
        isBanned: tokenRecord.user.isBanned,
        createdAt: tokenRecord.user.createdAt,
        lastLoginAt: tokenRecord.user.lastLoginAt,
      }
    };
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };
    
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET || 'dev-secret'
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret'
    });

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    return { accessToken, refreshToken };
  }
}
